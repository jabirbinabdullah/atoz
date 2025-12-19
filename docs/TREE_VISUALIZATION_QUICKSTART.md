# 🚀 Quick Start: Tree Visualization

## Access Tree Visualization in 3 Ways

### Method 1: From Dashboard (Easiest)
1. Go to home page: `http://localhost:3000/`
2. Look for "🌳 Pohon Keluarga" in **Quick Actions** section
3. Click it → Opens `/visualize-tree`

### Method 2: Direct Navigation
- Visit: `http://localhost:3000/visualize-tree`

### Method 3: From Family Unit Detail
1. Go to `/family-units`
2. Click on any family unit
3. Scroll down to "🌳 Visualisasi Pohon Silsilah" section
4. Click "Tampilkan Pohon Silsilah"

---

## Using Tree Visualization

### Step 1: Select a Family Unit
- Look at the **sidebar on the left**
- Each family is listed with its units (father + mother names)
- Click on a unit to view its tree

### Step 2: Choose View Mode
- **📄 View Tree Text:** See ASCII tree format
- **📋 View Hierarki:** See interactive member list

### Step 3: Tree Text Mode Features
```
Mbah Nuryo Utomo (1920-2010) ✝
├─ + Mbah Siti Romlah (1925-2015) ✝
│  ├─ Bapak Slamet (1950-) Hidup
│  ├─ Ibu Tri Untari (1952-) Hidup
└─ Mas Bambang (1952-) Hidup
```

**Actions:**
- 📊 **Toggle Stats:** Show/hide statistics (members, generations, deceased)
- 📋 **Copy:** One-click copy entire tree to clipboard
- ⬇️ **Download:** Save tree as `.txt` file

### Step 4: Hierarchy Mode Features
- **Expand/Collapse:** Click generation headers to show/hide levels
- **Expand All / Collapse All:** Quick buttons for all generations
- **Click Names:** Click member name → view their profile page
- **Status Badges:** 
  - ✓ Hidup (alive) = green
  - ✝ Meninggal (deceased) = gray
- **Refresh:** Reload data from server

---

## Verify Your Import

### Use This Checklist:

- [ ] **Root Member at Top:** Oldest ancestor first
- [ ] **Indentation Correct:** Each generation indented properly
- [ ] **Spouses Marked:** Spouse has "+" prefix
- [ ] **Children Listed:** All children shown at right level
- [ ] **Deceased Marked:** (Alm) or ✝ symbol present
- [ ] **Count Matches:** Total members match dashboard

### If Something Looks Wrong:
1. Check the statistics (members, generations, deceased)
2. Search for specific members in hierarchy
3. Click member names to view detailed profile
4. Compare with original import data

---

## Export Tree Data

### Copy to Clipboard
1. Select "📄 View Tree Text" tab
2. Click "📋 Copy" button
3. Paste anywhere (email, document, etc.)

### Download File
1. Select "📄 View Tree Text" tab
2. Click "⬇️ Download" button
3. File saves as: `tree_[id]_[date].txt`
4. Share or backup the file

### Via API
```bash
curl "http://localhost:3000/api/family-units/export?familyUnitId=YOUR_ID_HERE" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  | jq '.treeText'
```

---

## Understanding Tree Format

### Symbols
- **├─**: Branch (not last child)
- **└─**: Last branch
- **│**: Line continuation
- **+**: Spouse/marriage
- **✝**: Deceased
- **(Alm)**: Deceased (Indonesian)

### Member Display
- `Name (BirthYear-DeathYear) Status`
- `+ Spouse Name (BirthYear-) Hidup`

### Example
```
Root (1920-2010) ✝
├─ + Spouse (1925-2015) ✝
│  ├─ Child1 (1950-) Hidup
│  │  ├─ + Child1_Spouse (1952-) Hidup
│  │  │  ├─ Grandchild1 (1975-) Hidup
│  │  │  └─ Grandchild2 (1977-) Hidup
│  └─ Child2 (1952-) Hidup
└─ Child3 (1952-) Hidup
```

---

## Statistics Explained

| Statistic | Meaning |
|-----------|---------|
| **Total Family Units** | Number of parent-child family "nucleus" units |
| **Total Members** | Sum of all people in all units |
| **Generations** | Depth of tree (root = 1, their children = 2, etc.) |
| **Deceased Count** | Number of members marked as deceased |

Example: Mbah Nuryo family
- 42 family units (multiple generations of parents)
- 83 total members (all individuals)
- 5 generations (from Mbah Nuryo down to great-great-grandchildren)
- 12 deceased members

---

## Troubleshooting

### Page won't load
- Verify you're logged in
- Check server is running: `npm run dev`
- Try refreshing the page

### No family units showing
- Create or import a family first
- Go to `/family-units` or `/import`
- Return to `/visualize-tree`

### Tree looks incomplete
- Check dashboard for total member count
- Verify import completed successfully
- Check hierarchy mode for all levels

### Export not working
- Ensure you're logged in
- Check browser developer console (F12)
- Try copy instead of download

---

## Data Quality Verification

After importing a tree, verify quality by:

1. **Count Members:** Does tree show all 83 members?
2. **Check Root:** Is Mbah Nuryo at the very top?
3. **Verify Generations:** Are there 5 levels visible?
4. **Inspect Spouses:** Can you see marriage connections?
5. **Review Deceased:** Are 12 people marked as deceased?
6. **Check Children:** Do main families have their children listed?

---

## Next Steps

After verifying your imported tree:

1. **Edit Individual Members:** Go to `/members` to add/update details
2. **Add New Family Members:** Use "Tambah Anggota" quick action
3. **Create Additional Trees:** Use `/family-units` wizard
4. **Export Backup:** Download tree as `.txt` file
5. **Share Data:** Copy tree text to share with family

---

## Tips & Best Practices

✅ **DO:**
- Export tree regularly for backup
- Verify import accuracy immediately after import
- Use hierarchy mode to explore specific branches
- Click member names to view/edit their details
- Download tree in multiple formats

❌ **DON'T:**
- Edit tree in text format manually
- Use visualization mode for editing (use member pages instead)
- Share confidential family data without permission
- Rely solely on tree visualization (verify in member profiles too)

---

## Related Pages

- **Import Data:** `/import` - Upload new trees
- **Family Units:** `/family-units` - Manage unit structure
- **Members:** `/members` - Add/edit individual people
- **Dashboard:** `/` - Overview and statistics
- **Member Profile:** `/members/{id}` - Detailed person view

---

## Need Help?

1. **This Quick Start:** You're reading it! 📖
2. **Full Documentation:** See `docs/TREE_VISUALIZATION.md`
3. **Phase 3 Summary:** See `docs/PHASE_3_COMPLETION_SUMMARY.md`
4. **Import Guide:** See `docs/IMPORT_GENEALOGY.md`

---

**Ready to visualize your family tree? Go to `/visualize-tree` now! 🌳**
