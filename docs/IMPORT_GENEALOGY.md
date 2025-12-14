# Import Bagan Silsilah - Dokumentasi

## Fitur Import Genealogy Tree

Fitur import memungkinkan Anda untuk mengimpor seluruh struktur silsilah keluarga sekaligus dari format text tree, yang sangat berguna untuk:
- Memindahkan data dari dokumen existing
- Bulk import anggota keluarga dalam jumlah besar
- Menjaga struktur genealogy yang sudah ada

## Format yang Didukung

### Struktur Tree

Gunakan karakter ASCII untuk membuat tree structure:
- `│` - Garis vertikal (vertical line)
- `├` - Branch (left branch)
- `└` - Last branch
- `─` - Garis horizontal (horizontal line)

### Marker Khusus

| Marker | Fungsi | Contoh |
|--------|--------|--------|
| `+` | Menandai pasangan (spouse) | `ALI + Siti` |
| `•` | Menandai anak (child) | `• Muhammad` |
| `(Alm)` | Menandai yang sudah meninggal | `Ahmad (Alm)` |
| `1.`, `2.`, dll | Numbering (akan dihapus otomatis) | `1. SITI MURSIDAH` |

## Contoh Format

```
MBAH NURYO UTOMO
│
└── ALI SISWAWIYATA
    │
    ├── 1. SITI MURSIDAH + Muh. Husein
    │   │
    │   ├── • GUNARTO JAZIM + Umi Muaf
    │   │   │
    │   │   ├── • Alfareja Ega Avansa
    │   │   │
    │   │   └── • Alfaiza Ivara Jedda
    │   │
    │   └── • NUNUNG NURHAYATI
    │
    └── 2. SITI MARTILAH + Imam Harsono (Alm)
        │
        ├── • IMAM HADI PURWANTO + Purwanti
        │   │
        │   └── • Aurora Glen
        │
        └── • BAMBANG BUDI WIBOWO + Siti Aisyah
```

## Cara Menggunakan

### 1. Akses Halaman Import

- Dari dashboard, klik **"Import Bagan Silsilah"** di bagian Aksi Cepat
- Atau dari halaman Susunan Keluarga, klik tombol **"📥 Import Bagan"**
- URL: `/import`

### 2. Paste Bagan Silsilah

1. Copy bagan silsilah dari dokumen Anda
2. Paste ke dalam textarea yang disediakan
3. Pastikan format sesuai dengan contoh
4. Klik **"Preview Import →"**

### 3. Review Preview

Sistem akan menampilkan:
- Total anggota yang akan dibuat
- Total pernikahan yang akan dibuat
- Jumlah generasi
- Preview struktur tree yang akan diimpor

Periksa data dengan teliti sebelum melanjutkan.

### 4. Konfirmasi Import

1. Klik **"✓ Konfirmasi & Import"**
2. Tunggu proses import selesai (biasanya beberapa detik)
3. Sistem akan menampilkan hasil import:
   - Jumlah anggota yang berhasil dibuat
   - Jumlah pernikahan yang dibuat
   - Jumlah unit keluarga yang dibuat
   - Error/warning jika ada

### 5. Verifikasi Hasil

Setelah import berhasil:
- Anda akan diarahkan ke halaman Susunan Keluarga
- Verifikasi bahwa semua data sudah benar
- Periksa relasi antar anggota keluarga

## Proses Import (Behind the Scenes)

### 1. Parsing

Parser akan:
- Membaca struktur tree
- Mengidentifikasi level/generasi setiap anggota
- Memisahkan nama utama dan spouse
- Mendeteksi marker khusus (Alm, •, dll)
- Menghilangkan numbering otomatis

### 2. Inferensi Gender

Sistem mencoba mendeteksi gender berdasarkan pola nama Indonesia:
- **Female patterns**: Siti, Umi, Desi, Etty, Tri, Dwi, dll
- **Male patterns**: Muhammad, Imam, Bambang, Agus, dll
- Jika tidak terdeteksi: default ke 'male'

### 3. Pembuatan Data

Untuk setiap node dalam tree:
1. **Buat Member** untuk orang utama
2. **Buat Spouse** jika ada (marker `+`)
3. **Buat Marriage** antara keduanya
4. **Buat Family Unit** jika punya anak
5. **Buat Parent-Child relationships**
6. **Link children** ke family unit

### 4. Activity Logging

Setelah import selesai, sistem mencatat:
- Action: `created`
- Entity: `member`
- Name: `Bulk Import: [Root Name]`
- Details: Statistik import (members, marriages, units created)

## Tips & Best Practices

### ✅ Do's

1. **Gunakan Copy-Paste**: Copy langsung dari dokumen asli untuk menjaga formatting
2. **Periksa Indentation**: Pastikan indentasi konsisten
3. **Lengkapi Pasangan**: Selalu gunakan `+` untuk menandai pasangan
4. **Review Preview**: Selalu review sebelum konfirmasi
5. **Backup Data**: Simpan bagan original sebagai backup

### ❌ Don'ts

1. **Jangan Edit Manual di Textarea**: Jaga formatting tree character
2. **Jangan Skip Preview**: Selalu review data sebelum import
3. **Jangan Import Duplikat**: Cek apakah data sudah ada sebelum import ulang
4. **Jangan Gunakan Special Characters**: Hindari emoji atau karakter non-standard di nama

## Troubleshooting

### Error: "Failed to parse tree"

**Penyebab:**
- Format tree tidak valid
- Missing tree characters (│, ├, └)
- Indentation tidak konsisten

**Solusi:**
1. Periksa kembali format tree
2. Pastikan setiap level punya indentasi yang benar
3. Gunakan contoh format sebagai referensi

### Error: "No root member found"

**Penyebab:**
- Bagan kosong atau hanya berisi tree characters
- Root member tidak terdeteksi

**Solusi:**
1. Pastikan ada nama root/moyang di baris pertama
2. Jangan mulai langsung dengan tree characters

### Warning: "Member already exists"

**Penyebab:**
- Anggota dengan nama yang sama sudah ada di database
- Import duplikat

**Solusi:**
1. Cek data existing terlebih dahulu
2. Jika memang duplikat, skip atau edit nama
3. Atau hapus data existing sebelum import ulang

### Gender Salah Terdeteksi

**Penyebab:**
- Sistem inferensi gender tidak sempurna
- Nama tidak mengandung pattern yang dikenali

**Solusi:**
1. Setelah import, edit manual via halaman detail member
2. Atau tambahkan pattern nama baru ke parser

## API Endpoint

### POST /api/import/genealogy

Import genealogy tree dari text format.

**Request Body:**
```json
{
  "treeText": "MBAH NURYO...",
  "familyId": "..."
}
```

**Response Success:**
```json
{
  "success": true,
  "membersCreated": 50,
  "marriagesCreated": 20,
  "familyUnitsCreated": 18,
  "errors": []
}
```

**Response Error:**
```json
{
  "error": "Failed to parse tree: ...",
  "details": "..."
}
```

## Komponen

### ImportGenealogy Component

**Location:** `src/components/family/ImportGenealogy.tsx`

**Props:**
- `familyId`: string - ID family untuk import
- `onComplete?: () => void` - Callback setelah import berhasil

**Steps:**
1. `input` - Textarea untuk paste bagan
2. `preview` - Review hasil parsing
3. `importing` - Loading state
4. `success` - Success screen dengan statistics

### Parser Library

**Location:** `src/lib/genealogy-parser.ts`

**Functions:**
- `parseGenealogyTree(text: string): ParseResult` - Parse tree text
- `generateImportPreview(result: ParseResult): string` - Generate preview text
- `convertToImportFormat(result: ParseResult): BulkImportMember[]` - Convert to API format

## Limitasi

1. **Gender Detection**: Tidak 100% akurat, perlu manual correction
2. **Duplicate Handling**: Nama sama dianggap orang berbeda (belum ada smart duplicate detection)
3. **Tanggal Lahir**: Tidak bisa di-import via tree (harus manual setelah import)
4. **Info Tambahan**: Email, phone, alamat, dll tidak didukung via tree format
5. **Photo**: Tidak bisa di-upload via import

## Future Enhancements

- [ ] Support import tanggal lahir dalam format inline
- [ ] Smart duplicate detection berdasarkan nama + tanggal lahir
- [ ] Import dari GEDCOM file
- [ ] Export to tree text format (reverse operation)
- [ ] Batch edit after import (gender correction, dates, etc)
- [ ] Import preview with visual tree diagram
- [ ] Undo import feature
- [ ] Import validation dengan warning sebelum execute

## Contoh Data Lengkap

Untuk testing, gunakan data di bawah (keluarga Mbah Nuryo Utomo):

```
MBAH NURYO UTOMO
│
└── ALI SISWAWIYATA
    │
    ├── 1. SITI MURSIDAH + Muh. Husein
    │   │
    │   ├── • GUNARTO JAZIM AKHIDI + Umi Muaf Winingsih
    │   │   │
    │   │   ├── • Alfareja Ega Avansa
    │   │   │
    │   │   └── • Alfaiza Ivara Jedda
    │   │
    │   ├── • NUNUNG NURHAYATI
    │   │
    │   ├── • TRI HIDAYATI + B. Tri Wibowo
    │   │   │
    │   │   ├── • Arina Pramudita
    │   │   │
    │   │   └── • Inessa Ornella Sessa
    │   │
    │   └── • ZAIDAN JAUHARI + Sukartina
    │       │
    │       ├── • Muhammad Fadel Rosyid (Alm)
    │       │
    │       └── • Pipit Vanesa
    │
    └── 2. SITI MARTILAH + Imam Harsono
        │
        ├── • IMAM HADI PURWANTO + Purwanti
        │   │
        │   └── • Aurora Glen
        │
        └── • BAMBANG BUDI WIBOWO + Siti Aisyah
            │
            ├── • Canditya Galih Gumilang
            │
            ├── • Ibyu Hiban
            │
            └── • Alegi Hilmi Bahij
```

Expected result:
- Members: 27
- Marriages: 8
- Family Units: 7
- Generations: 5

## Support

Jika mengalami masalah dengan import:
1. Periksa format bagan Anda
2. Review dokumentasi dan contoh
3. Test dengan data kecil terlebih dahulu
4. Simpan error message untuk troubleshooting
5. Contact developer dengan detail error dan sample data
