/**
 * Parser for genealogy tree text format
 * Supports format like:
 * ANCESTOR
 * │
 * └── CHILD + Spouse
 *     │
 *     ├── • Grandchild
 *     └── • Another Grandchild
 */

export interface ParsedMember {
  name: string;
  spouse?: string;
  isDeceased: boolean;
  children: ParsedMember[];
  level: number;
  isChild: boolean; // true if marked with •
}

export interface ParseResult {
  root: ParsedMember;
  totalMembers: number;
  totalMarriages: number;
  generations: number;
}

/**
 * Parse genealogy tree from text format
 */
export function parseGenealogyTree(text: string): ParseResult {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  let root: ParsedMember | null = null;
  const stack: Array<{ member: ParsedMember; level: number }> = [];
  let totalMembers = 0;
  let totalMarriages = 0;
  let maxGeneration = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip tree structure lines (│, ├, └, etc)
    if (line.trim().match(/^[│├└─\s]+$/)) {
      continue;
    }

    // Calculate indentation level
    const level = countIndentLevel(line);
    
    // Extract member info
    const cleanLine = line.replace(/[│├└─]/g, '').trim();
    
    if (!cleanLine) continue;

    // Check if this is a child marker (•)
    const isChild = cleanLine.startsWith('•');
    const nameText = cleanLine.replace(/^[•\s]+/, '').trim();
    
    // Parse name and spouse
    const { name, spouse, isDeceased } = parseName(nameText);
    
    if (!name) continue;

    const member: ParsedMember = {
      name,
      spouse,
      isDeceased,
      children: [],
      level,
      isChild
    };

    totalMembers++;
    if (spouse) totalMarriages++;
    if (level > maxGeneration) maxGeneration = level;

    // Build tree structure
    if (!root) {
      root = member;
      stack.push({ member, level });
    } else {
      // Find parent
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length > 0) {
        const parent = stack[stack.length - 1].member;
        parent.children.push(member);
        stack.push({ member, level });
      }
    }
  }

  if (!root) {
    throw new Error('No root member found in tree');
  }

  return {
    root,
    totalMembers,
    totalMarriages,
    generations: maxGeneration + 1
  };
}

/**
 * Count indentation level
 */
function countIndentLevel(line: string): number {
  let level = 0;
  let inTree = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '└' || char === '├') {
      inTree = true;
    }
    
    if (inTree && char === '•') {
      level++;
      break;
    }
    
    if (char !== ' ' && char !== '│' && char !== '├' && char !== '└' && char !== '─' && char !== '•') {
      break;
    }
    
    // Count significant indentation markers
    if (char === '└' || char === '├') {
      level++;
    }
  }
  
  return level;
}

/**
 * Parse name, check for spouse (+ separator) and deceased marker (Alm)
 */
function parseName(text: string): { name: string; spouse?: string; isDeceased: boolean } {
  let isDeceased = false;
  let workingText = text;

  // Check for deceased marker
  if (workingText.includes('(Alm)')) {
    isDeceased = true;
    workingText = workingText.replace(/\(Alm\)/g, '').trim();
  }

  // Check for spouse
  if (workingText.includes('+')) {
    const parts = workingText.split('+').map(p => p.trim());
    const mainName = cleanName(parts[0]);
    const spouseName = parts[1] ? cleanName(parts[1]) : undefined;
    
    return {
      name: mainName,
      spouse: spouseName,
      isDeceased
    };
  }

  return {
    name: cleanName(workingText),
    isDeceased
  };
}

/**
 * Clean up name (remove numbering like "1.", "2.", etc)
 */
function cleanName(name: string): string {
  return name
    .replace(/^\d+\.\s*/, '') // Remove leading numbers like "1. ", "2. "
    .replace(/\(Nama tidak tercantum\)/g, 'Unknown') // Handle unknown names
    .trim();
}

/**
 * Generate import preview (for UI display before confirming)
 */
export function generateImportPreview(parseResult: ParseResult): string {
  const lines: string[] = [];
  
  lines.push(`📊 Import Summary:`);
  lines.push(`   Total Members: ${parseResult.totalMembers}`);
  lines.push(`   Total Marriages: ${parseResult.totalMarriages}`);
  lines.push(`   Generations: ${parseResult.generations}`);
  lines.push('');
  lines.push(`🌳 Tree Structure:`);
  
  function traverse(member: ParsedMember, indent: number = 0) {
    const prefix = '  '.repeat(indent);
    const marker = member.isChild ? '• ' : '';
    const deceased = member.isDeceased ? ' (Alm)' : '';
    const spouse = member.spouse ? ` + ${member.spouse}` : '';
    
    lines.push(`${prefix}${marker}${member.name}${spouse}${deceased}`);
    
    member.children.forEach(child => traverse(child, indent + 1));
  }
  
  traverse(parseResult.root);
  
  return lines.join('\n');
}

/**
 * Convert parsed tree to API format for bulk creation
 */
export interface BulkImportMember {
  fullName: string;
  isAlive: boolean;
  spouseName?: string;
  parentName?: string;
  gender?: string; // Try to infer from name patterns
}

export function convertToImportFormat(parseResult: ParseResult): BulkImportMember[] {
  const members: BulkImportMember[] = [];
  
  function traverse(member: ParsedMember, parentName?: string) {
    members.push({
      fullName: member.name,
      isAlive: !member.isDeceased,
      spouseName: member.spouse,
      parentName,
      gender: inferGender(member.name)
    });
    
    // If has spouse, add spouse as member too
    if (member.spouse) {
      members.push({
        fullName: member.spouse,
        isAlive: true, // Assume alive unless marked
        parentName: undefined,
        gender: inferGender(member.spouse)
      });
    }
    
    // Traverse children
    member.children.forEach(child => traverse(child, member.name));
  }
  
  traverse(parseResult.root);
  
  return members;
}

/**
 * Try to infer gender from Indonesian name patterns
 */
function inferGender(name: string): string {
  const nameLower = name.toLowerCase();
  
  // Common female prefixes/patterns in Indonesian names
  const femalePatterns = [
    'siti', 'umi', 'desi', 'etty', 'eny', 'lisa', 'vivi', 'elita',
    'nunung', 'endah', 'tri', 'dwi', 'yuni', 'yani', 'lilin',
    'evani', 'dema', 'aknifa', 'qisti', 'chumaira', 'lyfia'
  ];
  
  // Common male prefixes/patterns
  const malePatterns = [
    'muhammad', 'muh.', 'h.', 'imam', 'bambang', 'agus', 'nugroho',
    'guruh', 'asrori', 'bryan', 'rendra', 'afwaz', 'rangga', 'bunyamin'
  ];
  
  // Check female patterns
  for (const pattern of femalePatterns) {
    if (nameLower.includes(pattern)) {
      return 'female';
    }
  }
  
  // Check male patterns
  for (const pattern of malePatterns) {
    if (nameLower.includes(pattern)) {
      return 'male';
    }
  }
  
  // Default to unknown
  return 'male'; // Default assumption
}
