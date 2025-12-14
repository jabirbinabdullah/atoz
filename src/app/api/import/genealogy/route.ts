import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import { parseGenealogyTree, ParsedMember } from '@/lib/genealogy-parser';

interface ImportMember {
  id: string;
  fullName: string;
  originalName: string;
}

interface ImportResult {
  success: boolean;
  membersCreated: number;
  marriagesCreated: number;
  familyUnitsCreated: number;
  errors: string[];
}

/**
 * POST: Import genealogy tree from text format
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { treeText, familyId } = body;

    if (!treeText || !familyId) {
      return NextResponse.json(
        { error: 'treeText and familyId are required' },
        { status: 400 }
      );
    }

    // Parse the tree
    let parseResult;
    try {
      parseResult = parseGenealogyTree(treeText);
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to parse tree: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Validate family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId }
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Start import process
    const result: ImportResult = {
      success: true,
      membersCreated: 0,
      marriagesCreated: 0,
      familyUnitsCreated: 0,
      errors: []
    };

    // Map to store created members by name
    const memberMap = new Map<string, ImportMember>();

    // Recursive function to import tree
    async function importNode(
      node: ParsedMember,
      parentId?: string
    ): Promise<string | null> {
      try {
        // Check if member already exists
        let member = memberMap.get(node.name);
        
        if (!member) {
          // Create the member
          const created = await prisma.member.create({
            data: {
              fullName: node.name,
              familyId,
              isAlive: !node.isDeceased,
              gender: inferGender(node.name),
              createdByUserId: session.user.id || undefined
            }
          });

          member = {
            id: created.id,
            fullName: created.fullName,
            originalName: node.name
          };
          memberMap.set(node.name, member);
          result.membersCreated++;
        }

        // Create spouse if exists
        let spouseId: string | undefined;
        if (node.spouse) {
          let spouse = memberMap.get(node.spouse);
          
          if (!spouse) {
            const createdSpouse = await prisma.member.create({
              data: {
                fullName: node.spouse,
                familyId,
                isAlive: true,
                gender: inferOppositeGender(member.fullName),
                createdByUserId: session.user.id || undefined
              }
            });

            spouse = {
              id: createdSpouse.id,
              fullName: createdSpouse.fullName,
              originalName: node.spouse
            };
            memberMap.set(node.spouse, spouse);
            result.membersCreated++;
          }
          
          spouseId = spouse.id;

          // Create marriage
          try {
            const marriage = await prisma.marriage.create({
              data: {
                spouseAId: member.id,
                spouseBId: spouse.id
              }
            });
            result.marriagesCreated++;

            // Create family unit if they have children
            if (node.children.length > 0) {
              const familyUnit = await prisma.familyUnit.create({
                data: {
                  familyId,
                  fatherId: inferGender(member.fullName) === 'male' ? member.id : spouse.id,
                  motherId: inferGender(member.fullName) === 'female' ? member.id : spouse.id,
                  marriageId: marriage.id
                }
              });
              result.familyUnitsCreated++;

              // Import children and link to family unit
              for (const child of node.children) {
                const childId = await importNode(child, member.id);
                
                if (childId) {
                  // Create parent-child relationships
                  await prisma.parentChild.createMany({
                    data: [
                      {
                        parentId: member.id,
                        childId: childId,
                        parentRole: inferGender(member.fullName) === 'male' ? 'father' : 'mother'
                      },
                      {
                        parentId: spouse.id,
                        childId: childId,
                        parentRole: inferGender(spouse.fullName) === 'male' ? 'father' : 'mother'
                      }
                    ],
                    skipDuplicates: true
                  });

                  // Link child to family unit
                  await prisma.familyUnitMember.create({
                    data: {
                      familyUnitId: familyUnit.id,
                      memberId: childId
                    }
                  });
                }
              }
            }
          } catch (error) {
            // Marriage might already exist, skip
            console.log('Marriage already exists or error:', error);
          }
        } else {
          // No spouse, but may have children (single parent scenario)
          for (const child of node.children) {
            const childId = await importNode(child, member.id);
            
            if (childId && parentId) {
              try {
                await prisma.parentChild.create({
                  data: {
                    parentId: member.id,
                    childId: childId,
                    parentRole: inferGender(member.fullName) === 'male' ? 'father' : 'mother'
                  }
                });
              } catch (error) {
                // Relationship might exist
                console.log('Relationship already exists:', error);
              }
            }
          }
        }

        return member.id;
      } catch (error) {
        const errorMsg = `Failed to import ${node.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
        return null;
      }
    }

    // Start import from root
    await importNode(parseResult.root);

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: 'created',
      entityType: 'member',
      entityName: `Bulk Import: ${parseResult.root.name}`,
      details: {
        membersCreated: result.membersCreated,
        marriagesCreated: result.marriagesCreated,
        familyUnitsCreated: result.familyUnitsCreated,
        generations: parseResult.generations
      }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error importing genealogy tree:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Infer gender from Indonesian name patterns
 */
function inferGender(name: string): string {
  const nameLower = name.toLowerCase();
  
  const femalePatterns = [
    'siti', 'umi', 'desi', 'etty', 'eny', 'lisa', 'vivi', 'elita',
    'nunung', 'endah', 'tri', 'dwi', 'yuni', 'yani', 'lilin',
    'evani', 'dema', 'aknifa', 'qisti', 'chumaira', 'lyfia', 'arina',
    'inessa', 'pipit', 'nadila', 'ghea', 'alya', 'aurora', 'salsabila',
    'lunetta', 'aufa', 'najwa', 'fitri'
  ];
  
  for (const pattern of femalePatterns) {
    if (nameLower.includes(pattern)) {
      return 'female';
    }
  }
  
  return 'male';
}

/**
 * Infer opposite gender (for spouse)
 */
function inferOppositeGender(name: string): string {
  return inferGender(name) === 'male' ? 'female' : 'male';
}
