/**
 * Generate tree visualization from family unit data
 */

export interface TreeNode {
  id: string;
  name: string;
  spouse?: { id: string; name: string };
  children: TreeNode[];
  isDeceased: boolean;
  generation: number;
}

export interface FamilyUnitWithRelations {
  id: string;
  father?: { id: string; fullName: string; isAlive: boolean };
  mother?: { id: string; fullName: string; isAlive: boolean };
  children: Array<{ member: { id: string; fullName: string; isAlive: boolean } }>;
  childUnits: Array<{ 
    id: string; 
    father?: { id: string; fullName: string };
    mother?: { id: string; fullName: string };
  }>;
  parentUnit?: { 
    id: string;
    father?: { id: string; fullName: string };
    mother?: { id: string; fullName: string };
  };
}

/**
 * Build tree structure from family unit
 */
export function buildFamilyTree(
  rootUnit: FamilyUnitWithRelations,
  allUnits: FamilyUnitWithRelations[],
  generation: number = 0
): TreeNode {
  const spouseName = rootUnit.mother?.fullName || rootUnit.father?.fullName;
  const fatherName = rootUnit.father?.fullName || 'Unknown';
  const motherName = rootUnit.mother?.fullName || 'Unknown';

  // Main node name (couple)
  const nodeName =
    rootUnit.father && rootUnit.mother
      ? `${rootUnit.father.fullName} + ${rootUnit.mother.fullName}`
      : rootUnit.father?.fullName || rootUnit.mother?.fullName || 'Unknown Couple';

  const node: TreeNode = {
    id: rootUnit.id,
    name: nodeName,
    spouse: spouseName
      ? { id: rootUnit.mother?.id || rootUnit.father?.id || '', name: spouseName }
      : undefined,
    children: [],
    isDeceased: !rootUnit.father?.isAlive || !rootUnit.mother?.isAlive,
    generation
  };

  // Add children (as tree nodes from their family units)
  if (rootUnit.childUnits && rootUnit.childUnits.length > 0) {
    for (const childUnitId of rootUnit.childUnits) {
      const childUnit = allUnits.find(u => u.id === childUnitId.id);
      if (childUnit) {
        const childTree = buildFamilyTree(childUnit, allUnits, generation + 1);
        node.children.push(childTree);
      }
    }
  }

  return node;
}

/**
 * Generate tree text visualization
 */
export function generateTreeText(node: TreeNode, prefix: string = '', isLast: boolean = true): string {
  const lines: string[] = [];

  // Current node
  const deceased = node.isDeceased ? ' (Alm)' : '';
  const connector = prefix + (isLast ? '└── ' : '├── ');
  lines.push(connector + node.name + deceased);

  // Children
  if (node.children.length > 0) {
    // Add vertical connector
    lines.push(prefix + (isLast ? '    ' : '│   ') + '│');

    node.children.forEach((child, index) => {
      const isLastChild = index === node.children.length - 1;
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      const childText = generateTreeText(child, newPrefix, isLastChild);
      lines.push(childText);
    });
  }

  return lines.join('\n');
}

/**
 * Generate flat list with indentation for hierarchy view
 */
export function generateHierarchyList(node: TreeNode, indent: number = 0): string[] {
  const lines: string[] = [];
  const indentStr = '  '.repeat(indent);
  const deceased = node.isDeceased ? ' (Alm)' : '';

  lines.push(`${indentStr}├─ ${node.name}${deceased}`);

  node.children.forEach(child => {
    lines.push(...generateHierarchyList(child, indent + 1));
  });

  return lines;
}

/**
 * Generate detailed tree with member info
 */
export interface DetailedTreeOptions {
  includeDeceased?: boolean;
  maxDepth?: number;
  showIds?: boolean;
}

export function generateDetailedTree(
  node: TreeNode,
  options: DetailedTreeOptions = {},
  currentDepth: number = 0,
  prefix: string = ''
): string[] {
  const { includeDeceased = true, maxDepth = 999, showIds = false } = options;

  if (currentDepth > maxDepth) return [];

  const lines: string[] = [];
  const isLastChild = !prefix.includes('├');
  const deceased = node.isDeceased ? ' ✝' : '✓';
  const id = showIds ? ` [${node.id}]` : '';

  if (node.isDeceased && !includeDeceased) {
    return lines;
  }

  const linePrefix = currentDepth === 0 ? '' : prefix;
  const connector = currentDepth === 0 ? '' : isLastChild ? '└── ' : '├── ';

  lines.push(`${linePrefix}${connector}${node.name} ${deceased}${id}`);

  if (node.children.length > 0) {
    const childPrefix = currentDepth === 0
      ? ''
      : linePrefix + (isLastChild ? '    ' : '│   ');

    node.children.forEach((child, index) => {
      const isLastChildInFamily = index === node.children.length - 1;
      const nextPrefix = childPrefix + (isLastChildInFamily ? '    ' : '│   ');
      const childLines = generateDetailedTree(
        child,
        options,
        currentDepth + 1,
        nextPrefix + (isLastChildInFamily ? '└── ' : '├── ')
      );
      lines.push(...childLines);
    });
  }

  return lines;
}

/**
 * Get tree statistics
 */
export interface TreeStats {
  totalNodes: number;
  totalMembers: number;
  maxDepth: number;
  deceasedCount: number;
  livingCount: number;
  childrenCount: number;
}

export function getTreeStats(node: TreeNode): TreeStats {
  let totalNodes = 1;
  let totalMembers = 1; // Count couple as 1 node
  let maxDepth = 0;
  let deceasedCount = node.isDeceased ? 1 : 0;
  let livingCount = node.isDeceased ? 0 : 1;
  let childrenCount = node.children.length;

  function traverse(n: TreeNode, depth: number) {
    if (depth > maxDepth) maxDepth = depth;

    n.children.forEach(child => {
      totalNodes++;
      totalMembers++;
      deceasedCount += child.isDeceased ? 1 : 0;
      livingCount += child.isDeceased ? 0 : 1;
      childrenCount += child.children.length;
      traverse(child, depth + 1);
    });
  }

  traverse(node, 1);

  return {
    totalNodes,
    totalMembers,
    maxDepth: maxDepth + 1,
    deceasedCount,
    livingCount,
    childrenCount
  };
}

/**
 * Find member in tree by name
 */
export function findMemberInTree(node: TreeNode, searchName: string): TreeNode | null {
  if (node.name.toLowerCase().includes(searchName.toLowerCase())) {
    return node;
  }

  for (const child of node.children) {
    const found = findMemberInTree(child, searchName);
    if (found) return found;
  }

  return null;
}

/**
 * Get all ancestors of a node
 */
export function getAncestors(node: TreeNode, targetId: string, path: TreeNode[] = []): TreeNode[] {
  if (node.id === targetId) {
    return [...path, node];
  }

  for (const child of node.children) {
    const result = getAncestors(child, targetId, [...path, node]);
    if (result.length > 0) return result;
  }

  return [];
}

/**
 * Get all descendants of a node
 */
export function getDescendants(node: TreeNode): TreeNode[] {
  const descendants: TreeNode[] = [node];

  function traverse(n: TreeNode) {
    n.children.forEach(child => {
      descendants.push(child);
      traverse(child);
    });
  }

  traverse(node);
  return descendants;
}
