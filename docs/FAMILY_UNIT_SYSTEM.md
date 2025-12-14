# Sistem Unit Keluarga (Family Unit System)

## Konsep Dasar

Aplikasi AtoZ telah ditingkatkan dari pendekatan **individual-based** menjadi **family-based** genealogy, yang memungkinkan penyusunan silsilah yang lebih terstruktur dan intuitif.

### Apa itu Unit Keluarga?

**Unit Keluarga (Family Unit)** adalah grup/node yang merepresentasikan keluarga inti, yaitu:
- Satu pasangan (ayah dan ibu)
- Anak-anak mereka
- Hubungan pernikahan yang menghubungkan pasangan tersebut

Setiap unit keluarga berfungsi sebagai "building block" dari pohon silsilah yang lebih besar.

## Alur Kerja (Workflow)

### 1. Membuat Unit Keluarga Pertama

Mulai dengan membuat unit keluarga root (keluarga pertama):

1. Klik **"Susunan Keluarga"** di dashboard
2. Klik tombol **"+ Buat Keluarga Baru"**
3. Ikuti wizard langkah-per-langkah:
   - **Langkah 1**: Masukkan data Ayah (nama, tanggal lahir)
   - **Langkah 2**: Masukkan data Ibu (nama, tanggal lahir)
   - **Langkah 3**: Tambahkan anak-anak (optional, bisa multiple)
   - **Langkah 4**: Review dan simpan

### 2. Menghubungkan Unit Keluarga

Ketika anak dari unit keluarga menikah, mereka akan membentuk unit keluarga baru:

**Skenario:** Ahmad (anak dari Keluarga A) menikah dengan Siti
1. Buat unit keluarga baru dengan Ahmad sebagai ayah, Siti sebagai ibu
2. Sistem secara otomatis menghubungkan unit keluarga baru ini sebagai child dari Keluarga A
3. Tambahkan anak-anak Ahmad dan Siti ke unit keluarga baru

## Model Database

### FamilyUnit
```typescript
{
  id: string
  familyId: string         // FK to Family
  fatherId?: string         // FK to Member
  motherId?: string         // FK to Member
  marriageId?: string       // FK to Marriage
  parentUnitId?: string     // FK to parent FamilyUnit (for hierarchy)
  children: FamilyUnitMember[]  // Children in this unit
  childUnits: FamilyUnit[]      // Units formed by children's marriages
}
```

### FamilyUnitMember
```typescript
{
  id: string
  familyUnitId: string     // FK to FamilyUnit
  memberId: string         // FK to Member
}
```

## API Endpoints

### GET /api/family-units?familyId={id}
Mengambil semua unit keluarga dalam satu family tree.

**Response:**
```json
[
  {
    "id": "...",
    "father": { "id": "...", "fullName": "Ahmad" },
    "mother": { "id": "...", "fullName": "Siti" },
    "children": [
      { "member": { "id": "...", "fullName": "Budi" } }
    ],
    "_count": { "childUnits": 2 }
  }
]
```

### POST /api/family-units
Membuat unit keluarga baru.

**Request Body:**
```json
{
  "familyId": "...",
  "fatherId": "...",
  "motherId": "...",
  "marriageId": "...",
  "childrenIds": ["...", "..."],
  "parentUnitId": "..."  // Optional: untuk menghubungkan dengan unit parent
}
```

### GET /api/family-units/{id}
Mengambil detail unit keluarga spesifik termasuk relasi lengkap.

### PUT /api/family-units/{id}
Update unit keluarga (ubah parents, tambah/hapus anak).

### DELETE /api/family-units/{id}
Hapus unit keluarga (cascade delete untuk children references).

## Komponen UI

### FamilyWizard
Komponen wizard multi-step untuk membuat unit keluarga baru:
- Step-by-step guidance (4 langkah)
- Validasi input per step
- Preview sebelum submit
- Automatic creation of members, marriage, parent-child relationships

**Props:**
- `familyId`: ID dari family tree
- `onComplete`: Callback setelah sukses membuat unit

**Location:** `src/components/family/FamilyWizard.tsx`

### FamilyUnitsList
Komponen untuk menampilkan daftar semua unit keluarga:
- Grid layout dengan card per unit
- Menampilkan parents, children count, connected units count
- Link ke detail page per unit

**Props:**
- `familyId`: ID dari family tree

**Location:** `src/components/family/FamilyUnitsList.tsx`

## Pages

### /family-units
Halaman utama untuk manajemen unit keluarga:
- Tombol "Buat Keluarga Baru" di header
- Conditional rendering: wizard atau list
- Automatic family creation untuk user pertama kali

### /family-units/[id]
Halaman detail unit keluarga:
- Info lengkap pasangan (father & mother)
- Info pernikahan (tanggal, dll)
- Daftar anak-anak dengan link ke profil
- Info parent unit (jika ada)
- List connected child units (keluarga yang dibentuk oleh anak)
- Tombol delete (dengan konfirmasi)

## Activity Logging

Semua operasi pada unit keluarga tercatat dalam activity log:
- `entityType: 'familyunit'`
- `action: 'created' | 'updated' | 'deleted'`
- `entityName`: "{Father Name} & {Mother Name}"
- `details`: JSON dengan fatherId, motherId, childrenCount, dll

## Keuntungan Pendekatan Family-Based

1. **Struktur Lebih Terorganisir**: Silsilah tersusun dalam unit-unit keluarga yang jelas
2. **Workflow Intuitif**: User dipandu step-by-step untuk membuat keluarga
3. **Visualisasi Lebih Mudah**: Setiap unit adalah node yang bisa divisualisasikan
4. **Hubungan Lebih Jelas**: Parent-child antar keluarga eksplisit, bukan implicit
5. **Skalabilitas**: Mudah menambah generasi baru dengan menghubungkan unit

## Migrasi dari Approach Lama

Untuk user existing yang sudah punya data individual:
1. Data member existing tetap utuh (tidak ada perubahan skema Member)
2. Buat unit keluarga untuk grup pasangan + anak yang ada
3. Link unit keluarga baru dengan member existing via fatherId/motherId/children
4. Both approaches compatible: bisa tetap tambah member individual atau via family unit

## Best Practices

1. **Mulai dari Root**: Selalu mulai dengan membuat keluarga pertama/leluhur tertua
2. **Lengkapi Data**: Isi semua field yang diketahui (tanggal lahir, dll)
3. **Dokumentasi**: Gunakan field notes untuk menyimpan cerita/informasi tambahan
4. **Verifikasi**: Review data di halaman detail sebelum menambah unit baru
5. **Hubungkan Bertahap**: Jangan terburu-buru, hubungkan unit keluarga satu per satu dengan verifikasi

## Troubleshooting

**Q: Bagaimana jika hanya tahu salah satu parent?**  
A: Biarkan field father/mother kosong (optional). Unit tetap bisa dibuat dengan satu parent.

**Q: Bagaimana menambah anak ke unit existing?**  
A: Buka detail page unit, klik edit (fitur akan ditambahkan), atau buat member baru lalu hubungkan via API.

**Q: Bisa hapus unit keluarga?**  
A: Ya, tapi hati-hati karena akan menghapus references. Member individual tetap ada, hanya grouping yang hilang.

**Q: Bagaimana dengan polygamy/multiple marriages?**  
A: Buat unit keluarga terpisah untuk setiap pernikahan. Satu member bisa jadi father/mother di multiple units.

## Future Enhancements

- [ ] Family tree visualization (graph/diagram)
- [ ] Edit mode untuk update unit existing via UI
- [ ] Drag-and-drop untuk reorder children
- [ ] Export unit keluarga ke PDF/image
- [ ] Import GEDCOM file untuk bulk create
- [ ] AI-assisted relationship detection
