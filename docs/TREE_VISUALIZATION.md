# 🌳 Tree Visualization & Verification Guide

## Overview

The Tree Visualization feature allows users to view, verify, and export the genealogy data that was imported into the system. After importing a family tree using the bulk import feature, users can now verify the structure, relationships, and hierarchy of the imported data.

**Problem Solved:** "induk silsilah yang diimpor belum bisa ditampilkan kembali untuk dipastikan kesesuaian relasi dan letaknya" (The imported root family tree could not be displayed again to verify relationships and positioning)

## Features

### 1. **🌍 Visualization Page** (`/visualize-tree`)
A dedicated page for viewing and managing family tree visualizations.

**Features:**
- **Family Unit Selector:** Browse all families and their units in a sidebar
- **Dual View Modes:**
  - **View Tree Text:** ASCII tree visualization with export options
  - **View Hierarki:** Interactive hierarchical member list
- **Verification Checklist:** Built-in checklist to verify imported data accuracy
- **Responsive Design:** Works on desktop, tablet, and mobile

**Access:**
- Dashboard → 🌳 Pohon Keluarga (quick action)
- Direct URL: `/visualize-tree`
- Family Unit Detail Page → 🌳 Visualisasi Pohon Silsilah section

### 2. **TreeVisualizer Component** 
Displays the family tree as ASCII text and provides export capabilities.

**Features:**
- **📄 Load Tree Text:** Fetches tree visualization from API
- **📋 Copy to Clipboard:** One-click copy of tree text
- **⬇️ Download as File:** Export tree text as `.txt` file (auto-named with date)
- **📊 Toggle Statistics:** Show/hide tree statistics dashboard
- **Verification Tips:** Built-in tips for verifying tree structure

**Displayed Statistics:**
- Total Family Units
- Total Members
- Maximum Generations
- Deceased Members Count

**Example Tree Format:**
```
Mbah Nuryo Utomo (1920-2010) ✝ Meninggal
├─ + Mbah Siti Romlah (1925-2015) ✝ Meninggal
│  ├─ Bapak Slamet (1950-) Hidup
│  │  ├─ + Ibu Sristem (1952-) Hidup
│  │  │  ├─ Pak Darmawan (1975-) Hidup
│  │  │  │  ├─ + Ibu Nurmasari (1977-) Hidup
│  │  │  │  │  ├─ Reni Darmawati (2000-) Hidup
│  │  │  │  │  └─ Budi Darmawan (2002-) Hidup
│  │  │  │  └─ Rini Darmawati (1979-) Hidup
│  │  │  └─ Dewi Slamet (1977-) Hidup
│  │  └─ Ibu Tri Untari (1952-) Hidup
└─ Mas Bambang (1952-) Hidup
```

### 3. **HierarchyViewer Component**
Interactive member-centric hierarchy view for detailed tree exploration.

**Features:**
- **Expand/Collapse by Generation:** Toggle display of each generation level
- **Expand All / Collapse All:** Quick navigation controls
- **Member Links:** Click member names to view their profile
- **Status Badges:** Visual indication of alive/deceased members
  - ✓ Hidup (Alive) - Green
  - ✝ Meninggal (Deceased) - Gray
- **Hierarchical Indentation:** Visual hierarchy levels
- **Legend:** Explanation of icons and status indicators
- **Refresh:** Reload data from API

**Interactive Elements:**
- **Generation Toggle:** Click on generation headers to expand/collapse all members in that level
- **Member Names:** Click to navigate to `/members/{id}` profile page
- **Status Badges:** Color-coded family status at a glance

### 4. **Export API Endpoint**
Backend API for generating tree visualizations.

**Endpoint:** `GET /api/family-units/export?familyUnitId={id}`

**Request:**
```typescript
// Query Parameters
{
  familyUnitId: string  // UUID of the root family unit
}
```

**Response:**
```typescript
{
  treeText: string;     // ASCII tree visualization
  stats: {
    totalUnits: number;
    totalMembers: number;
    maxGenerations: number;
    deceasedCount: number;
  };
  format: string;       // "tree_text_v1"
}
```

**Example Response:**
```json
{
  "treeText": "Mbah Nuryo Utomo (1920-2010) ✝\n├─ + Mbah Siti Romlah...",
  "stats": {
    "totalUnits": 42,
    "totalMembers": 83,
    "maxGenerations": 5,
    "deceasedCount": 12
  },
  "format": "tree_text_v1"
}
```

**Error Handling:**
- `401`: Unauthorized (requires authentication)
- `400`: Missing required parameter `familyUnitId`
- `404`: Family unit not found
- `500`: Server error during tree generation

### 5. **Tree Visualization Utilities** (`src/lib/tree-visualization.ts`)
Shared utility functions for building and rendering tree structures.

**Key Functions:**

#### `buildFamilyTree()`
Recursively builds a tree structure from family units.
```typescript
buildFamilyTree(
  rootUnit: FamilyUnitWithRelations,
  allUnits: FamilyUnitWithRelations[],
  generation: number = 0,
  visited?: Set<string>
): TreeNode
```

#### `generateTreeText()`
Generates ASCII tree visualization.
```typescript
generateTreeText(
  node: TreeNode,
  prefix: string = '',
  isLast: boolean = true
): string
```

#### `generateHierarchyList()`
Generates flat hierarchy with indentation.
```typescript
generateHierarchyList(
  node: TreeNode,
  indent: number = 0
): HierarchyItem[]
```

#### `getTreeStats()`
Calculates tree statistics.
```typescript
getTreeStats(node: TreeNode): TreeStats
```

#### `findMemberInTree()`
Searches for a member by name in the tree.
```typescript
findMemberInTree(
  node: TreeNode,
  searchName: string
): TreeNode | null
```

#### `getAncestors()` / `getDescendants()`
Traverses lineage paths.
```typescript
getAncestors(node: TreeNode, targetId: string, path?: TreeNode[]): TreeNode[]
getDescendants(node: TreeNode): TreeNode[]
```

## How to Use

### Viewing an Imported Tree

1. **From Dashboard:**
   - Go to dashboard (`/`)
   - Click "🌳 Pohon Keluarga" in Quick Actions
   - Or navigate to `/visualize-tree`

2. **From Family Unit Detail:**
   - Go to `/family-units`
   - Click on a family unit to open detail page
   - Scroll to "🌳 Visualisasi Pohon Silsilah" section
   - Click "Tampilkan Pohon Silsilah" button

3. **Direct Navigation:**
   - Visit `/visualize-tree` directly
   - Select a family unit from the sidebar

### Verifying Tree Structure

Use the verification checklist:

- ✓ **Root Member:** Is the oldest ancestor at the top?
- ✓ **Indentation:** Does indentation correctly show generation levels?
- ✓ **Spouse Relations:** Are spouses marked with "+"?
- ✓ **Children:** Are all children displayed at the correct level?
- ✓ **Deceased:** Are deceased members marked with "(Alm)" or "✝"?
- ✓ **Total Count:** Does member count match dashboard statistics?

### Exporting Tree Data

**Method 1: From TreeVisualizer Component**
1. Click "📄 View Tree Text" tab
2. Click "⬇️ Download" button
3. Tree is saved as `tree_[familyUnitId]_[date].txt`

**Method 2: Via API**
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3000/api/family-units/export?familyUnitId={id}"
```

**Method 3: Copy to Clipboard**
1. Click "📄 View Tree Text" tab
2. Click "📋 Copy" button
3. Paste tree text into document or email

## Tree Format Specification

### ASCII Tree Symbols
- **`├─`**: Branch connector (not last child)
- **`└─`**: Last branch connector
- **`│`**: Vertical line continuation
- **`+`**: Spouse/marriage indicator
- **`✝`**: Deceased indicator
- **(Alm)**: Deceased in Arabic/Indonesian format

### Member Information Display
```
Name (BirthYear-DeathYear) [Status] [Gender]
```

Examples:
- `Mbah Nuryo Utomo (1920-2010) ✝` - Deceased
- `+ Mbah Siti Romlah (1925-2015) ✝` - Spouse, Deceased
- `Pak Slamet (1950-) Hidup` - Living
- `Budi Darmawan (2000-) Hidup` - Living, young member

### Tree Structure Logic
1. **Root Level:** The specified family unit's father/mother
2. **Level 2:** Their children (represented by other family units)
3. **Level N:** Each generation's children recursively
4. **Spouses:** Shown with "+" prefix under each family head
5. **Termination:** Tree ends when leaf nodes have no children units

## Integration with Import Feature

### Data Flow
```
Import Feature → Database Storage → Tree Visualization
     (Paste)    (Member, Marriage, (Display & Export)
                 FamilyUnit, etc)
```

### Verification Workflow
1. **Import:** User imports tree using `/import` page
2. **Storage:** Data saved to database (FamilyUnit, Member, ParentChild, etc.)
3. **Visualization:** User navigates to `/visualize-tree`
4. **Verification:** User compares exported tree with original import
5. **Confirmation:** If structure is correct, import is validated

## Performance Considerations

### Large Trees (80+ Members)
- **TreeVisualizer:** Efficient ASCII rendering, minimal re-renders
- **HierarchyViewer:** Interactive expand/collapse reduces DOM nodes
- **API Endpoint:** Optimized with Prisma relations, single database query
- **Memory:** Tree structure built in memory, not paginated

### Optimization Techniques Used
1. **Visited Set:** Prevents infinite loops in recursive tree building
2. **Lazy Rendering:** HierarchyViewer only renders visible levels
3. **Memoization:** Component re-renders minimized with proper props
4. **Streaming:** Tree text generated on-demand, not pre-cached

## Troubleshooting

### "Family unit not found" Error
- Ensure the family unit ID is correct
- Verify the family unit exists in the dashboard
- Check that you have access permissions to the family

### Tree shows incomplete structure
- Verify all members were imported correctly (check dashboard stats)
- Check for missing parent-child relationships in the import data
- Review import logs for any errors during bulk import

### Export file is empty or incomplete
- Ensure you selected a valid family unit
- Check that the family unit has children/descendants
- Try refreshing the page and re-exporting

### Hierarchy viewer shows only top level
- Click "Expand All" button to show all generations
- Manually click generation headers to expand specific levels
- Check that members exist below root level

## Related Features

- **Bulk Import:** `/import` - Import family trees from ASCII format
- **Family Units:** `/family-units` - Manage family unit structure
- **Members:** `/members` - View and edit individual members
- **Dashboard:** `/` - View statistics and recent activities

## Technical Details

### Files Modified/Created
- `src/app/visualize-tree/page.tsx` - Main visualization page
- `src/components/family/TreeVisualizer.tsx` - Tree text display component
- `src/components/family/HierarchyViewer.tsx` - Interactive hierarchy component
- `src/lib/tree-visualization.ts` - Utility functions
- `src/app/api/family-units/export/route.ts` - Export endpoint
- `src/app/page.tsx` - Dashboard integration

### Database Relations Used
- `FamilyUnit` → `Member` (father, mother)
- `FamilyUnit` → `FamilyUnitMember` → `Member` (children)
- `FamilyUnit` → `FamilyUnit` (parent, child units)
- `Member` → `Marriage` (spouse relations)
- `Member` → `ParentChild` (direct relations)

### Authentication
All endpoints require NextAuth.js session authentication. Users must be logged in to access visualization features.

## Future Enhancements

Planned features for future phases:
- [ ] Interactive D3.js tree diagram visualization
- [ ] PDF export with custom formatting
- [ ] Comparison view between two trees
- [ ] Duplicate detection and merging
- [ ] Timeline view of generations
- [ ] Photo gallery in hierarchy view
- [ ] Search and filter by member attributes
- [ ] Relationship strength indicator (marriage dates, etc.)

## Support & Questions

For issues or questions about tree visualization:
1. Check this documentation
2. Review the verification checklist
3. Check application logs for error messages
4. Contact development team with details

---

**Last Updated:** December 16, 2024
**Version:** 1.0.0
**Status:** ✅ Complete and Tested
