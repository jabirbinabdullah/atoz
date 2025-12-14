# Tasks & Todo List

## 📋 Daftar Task Aktif

Dokumen ini berisi daftar task dan todo yang sedang dikerjakan atau direncanakan untuk aplikasi AtoZ.

---

## 🔴 High Priority - Current Sprint

### 1. Documentation Completion ⏳
**Status**: In Progress  
**Priority**: High  
**Assignee**: Team  
**Due**: 21 Desember 2025

**Subtasks**:
- [x] Create main documentation index
- [x] Write functional description
- [x] Write architecture documentation
- [x] Write milestones & roadmap
- [x] Write tasks & todo document
- [ ] Write API documentation
- [ ] Write database schema documentation
- [ ] Write testing guide
- [ ] Write deployment guide
- [ ] Write contributing guide

**Notes**: Foundation dokumentasi sudah selesai, tinggal dokumentasi teknis detail.

---

## 🟡 Medium Priority - Near Term

### 2. Member Detail & Edit Page 📋
**Status**: Planned  
**Priority**: Medium  
**Estimated Effort**: 3-5 hari  
**Dependencies**: None

**Requirements**:
- [ ] Create `/members/[id]` route
- [ ] Fetch member data with relations
- [ ] Display full member information
- [ ] Implement edit mode
- [ ] Connect to PATCH API
- [ ] Add delete confirmation
- [ ] Show parent-child relations
- [ ] Show marriage relations
- [ ] Add breadcrumb navigation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Write component tests

**Acceptance Criteria**:
- User can view complete member details
- Admin/Contributor can edit member info
- Admin can delete member with confirmation
- All relations are visible
- UI is responsive and user-friendly

**Technical Notes**:
```typescript
// Proposed structure
src/app/members/[id]/
├── page.tsx              // Server component
└── components/
    ├── MemberDetail.tsx  // Display mode
    ├── MemberEdit.tsx    // Edit mode
    └── RelationsList.tsx // Relations display
```

### 3. Internationalization (i18n) 📋
**Status**: Planned  
**Priority**: Medium  
**Estimated Effort**: 5-7 hari  
**Dependencies**: None

**Requirements**:
- [ ] Install next-intl package
- [ ] Setup i18n configuration
- [ ] Create language files structure
- [ ] Extract all UI strings
- [ ] Create Indonesian translations (id.json)
- [ ] Create English translations (en.json)
- [ ] Implement language switcher
- [ ] Update all components to use translations
- [ ] Test language switching
- [ ] Update documentation

**File Structure**:
```
messages/
├── id.json    # Indonesian
└── en.json    # English

src/i18n/
├── config.ts
└── request.ts
```

**Key Strings to Translate**:
- Navigation labels
- Form labels & placeholders
- Button text
- Validation messages
- Error messages
- Success notifications

### 4. Family Tree Visualization 📋
**Status**: Planned  
**Priority**: Medium  
**Estimated Effort**: 1-2 minggu  
**Dependencies**: Member detail page

**Requirements**:
- [ ] Research tree visualization libraries
- [ ] Choose library (react-family-tree, d3, vis-network)
- [ ] Create tree data structure from API
- [ ] Implement tree rendering component
- [ ] Add zoom & pan controls
- [ ] Add node click handlers
- [ ] Add generation labels
- [ ] Implement responsive layout
- [ ] Add export to image
- [ ] Optimize performance for large trees
- [ ] Write component tests

**Technical Considerations**:
- Performance: Large families (500+ members)
- Mobile support: Touch gestures
- Layout algorithm: Prevent overlaps
- Data fetching: Efficient loading of relations

---

## 🟢 Low Priority - Backlog

### 5. Photo Upload Feature 📝
**Status**: Backlog  
**Priority**: Low  
**Estimated Effort**: 5-7 hari

**Requirements**:
- [ ] Design file upload API
- [ ] Choose storage solution (S3, Cloudinary, local)
- [ ] Implement upload endpoint
- [ ] Add image validation (size, type)
- [ ] Add image optimization (resize, compress)
- [ ] Update member form with file input
- [ ] Add photo preview
- [ ] Update member cards to show photo
- [ ] Implement photo deletion
- [ ] Handle missing photos gracefully
- [ ] Write upload tests

**Storage Options**:
1. **Local File System** (Simple, free)
   - Store in `public/uploads/`
   - Serve via Next.js static files
   
2. **AWS S3** (Scalable, paid)
   - Requires AWS account
   - Better for production
   
3. **Cloudinary** (Easy, free tier)
   - Image CDN included
   - Automatic optimization

### 6. Enhanced Testing Suite 📝
**Status**: Backlog  
**Priority**: Low  
**Estimated Effort**: 1 minggu

**Requirements**:
- [ ] Setup Playwright for E2E tests
- [ ] Write E2E test scenarios
  - [ ] Login flow
  - [ ] Create member flow
  - [ ] Edit member flow
  - [ ] Search & filter flow
  - [ ] Add relationship flow
- [ ] Setup code coverage reporting
- [ ] Add performance tests
- [ ] Add accessibility tests (axe-core)
- [ ] CI/CD integration
- [ ] Update testing documentation

### 7. Advanced Search & Filters 📝
**Status**: Backlog  
**Priority**: Low  
**Estimated Effort**: 3-5 hari

**Requirements**:
- [ ] Design advanced search UI
- [ ] Add date range filters (birth/death)
- [ ] Add location filter
- [ ] Add occupation filter
- [ ] Implement combined filters
- [ ] Add search result count
- [ ] Add sort options
- [ ] Save filter presets
- [ ] Export search results
- [ ] Update API to support advanced queries

### 8. Events & Timeline 📝
**Status**: Backlog  
**Priority**: Low  
**Estimated Effort**: 1-2 minggu

**Requirements**:
- [ ] Design Event model
- [ ] Create events API
- [ ] Implement timeline view
- [ ] Add event CRUD operations
- [ ] Link events to members
- [ ] Add event types (birth, death, marriage, etc.)
- [ ] Implement chronological sorting
- [ ] Add event notifications
- [ ] Anniversary reminders
- [ ] Calendar view

---

## 🔧 Technical Debt & Improvements

### 9. Code Refactoring 📝
**Priority**: Medium  
**Status**: Ongoing

**Items**:
- [ ] Extract common API patterns to utilities
- [ ] Standardize error responses
- [ ] Create reusable form components
- [ ] Improve TypeScript types
- [ ] Add JSDoc comments
- [ ] Consolidate styling approach
- [ ] Review and optimize database queries
- [ ] Add request validation middleware

### 10. Performance Optimization 📝
**Priority**: Medium  
**Status**: Backlog

**Items**:
- [ ] Implement pagination for member list
- [ ] Add infinite scroll
- [ ] Optimize database indexes
- [ ] Implement query caching
- [ ] Add React Query or SWR
- [ ] Optimize image loading
- [ ] Code splitting review
- [ ] Bundle size analysis
- [ ] Lighthouse audit

### 11. Security Hardening 📝
**Priority**: High  
**Status**: Backlog

**Items**:
- [ ] Security audit
- [ ] Add rate limiting
- [ ] Implement CSRF tokens
- [ ] Add input sanitization
- [ ] Review CORS policies
- [ ] Add security headers
- [ ] Implement password strength requirements
- [ ] Add 2FA support
- [ ] Security testing

---

## 📝 Bug Tracking

### Known Issues

#### 🐛 BUG-001: No active bugs currently
**Status**: N/A  
**Priority**: N/A  

*(All tests passing as of Dec 14, 2025)*

---

## 🎯 Feature Requests

### Community Requested Features

#### FR-001: Export to PDF 📝
**Requested By**: User Feedback (Future)  
**Status**: Backlog  
**Description**: Export family tree or member list to PDF for printing.

#### FR-002: Mobile App 📝
**Requested By**: Planning  
**Status**: Backlog  
**Description**: Native mobile app for iOS and Android.

#### FR-003: GEDCOM Support 📝
**Requested By**: Planning  
**Status**: Backlog  
**Description**: Import and export GEDCOM files for compatibility with other genealogy software.

---

## 📅 Task Board Status

### Sprint Overview

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Completed | 29 | 60% |
| ⏳ In Progress | 1 | 2% |
| 📋 Planned | 3 | 6% |
| 📝 Backlog | 16 | 32% |
| **Total** | **49** | **100%** |

### By Category

| Category | Tasks | Completed | Remaining |
|----------|-------|-----------|-----------|
| Documentation | 10 | 5 | 5 |
| Features | 15 | 12 | 3 |
| Testing | 7 | 4 | 3 |
| Technical Debt | 8 | 0 | 8 |
| Bug Fixes | 1 | 1 | 0 |
| Feature Requests | 8 | 0 | 8 |

---

## 🔄 Workflow

### Task Lifecycle

```
📝 Backlog
    ↓
📋 Planned (Sprint planning)
    ↓
⏳ In Progress (Development)
    ↓
🔍 Review (Code review)
    ↓
🧪 Testing (QA)
    ↓
✅ Completed (Merged & deployed)
```

### Definition of Done

Sebuah task dianggap selesai ketika:
- [x] Kode sudah diimplementasikan
- [x] Semua test passing
- [x] Code review approved
- [x] Dokumentasi diupdate
- [x] Tidak ada regression bugs
- [x] Performance acceptable
- [x] Accessibility checked

---

## 📊 Velocity Tracking

### Sprint Velocity (Story Points)

| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| Sprint 0 (Nov) | 10 | 10 | 100% |
| Sprint 1 (Dec 1-7) | 15 | 12 | 80% |
| Sprint 2 (Dec 8-14) | 13 | 13 | 100% |
| Sprint 3 (Dec 15-21) | 8 | TBD | TBD |

**Average Velocity**: 93%

---

## 🎬 Next Actions

### Immediate (This Week)
1. Complete documentation (API, Database, Testing guides)
2. Review and prioritize Phase 2 tasks
3. Setup development environment for Phase 2

### Short Term (Next 2 Weeks)
1. Start member detail page implementation
2. Research i18n libraries and approaches
3. Design family tree visualization

### Medium Term (Next Month)
1. Complete Phase 2 features
2. Comprehensive testing
3. Performance optimization
4. Prepare for user testing

---

## 📝 Notes & Comments

### Development Notes
- Keep commits atomic and well-documented
- Update tests alongside feature development
- Document breaking changes
- Follow TypeScript best practices
- Maintain code quality standards

### Team Communication
- Daily standup notes (if applicable)
- Weekly progress review
- Sprint retrospective
- Knowledge sharing sessions

---

**Document Version**: 1.0  
**Last Updated**: 14 Desember 2025  
**Next Review**: 21 Desember 2025
