# Cara Import Data Keluarga Mbah Nuryo Utomo

## Data yang Siap Diimpor

Berikut adalah bagan silsilah lengkap yang bisa langsung di-copy dan import:

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
    │   ├── • ZAIDAN JAUHARI + Sukartina
    │   │   │
    │   │   ├── • Muhammad Fadel Rosyid (Alm)
    │   │   │
    │   │   └── • Pipit Vanesa
    │   │
    │   ├── • ENY KURNIA ASTUTI + Yanto Kristiyanto
    │   │   │
    │   │   ├── • Nadila Nadhea Putri
    │   │   │
    │   │   └── • Ghea Amanda Ratu Rania
    │   │
    │   └── • LISA DOROYATUN HASANAH + Nur Hidayat
    │       │
    │       └── • Alya Ramadhani
    │
    ├── 2. SITI MARTILAH + Imam Harsono
    │   │
    │   ├── • IMAM HADI PURWANTO + Purwanti
    │   │   │
    │   │   └── • Aurora Glen
    │   │
    │   ├── • BAMBANG BUDI WIBOWO + Siti Aisyah
    │   │   │
    │   │   ├── • Canditya Galih Gumilang
    │   │   │
    │   │   ├── • Ibyu Hiban
    │   │   │
    │   │   └── • Alegi Hilmi Bahij
    │   │
    │   ├── • AGUS SETIONO + Yuni
    │   │   │
    │   │   └── • Salsabila
    │   │
    │   ├── • ENDAH SETYANINGSIH
    │   │
    │   ├── • NUGROHO ADI C + Yani
    │   │   │
    │   │   ├── • Willy
    │   │   │
    │   │   └── • Dimas Fatih Dzaky
    │   │
    │   ├── • GURUH FAJAR RAHARJO
    │   │
    │   └── • DESI NUR CAHYANTI
    │
    ├── 3. SITI RUJINAH + Santo Tukimin (Alm)
    │   │
    │   ├── • ETTY RUDIYANTI + Wijayanto
    │   │   │
    │   │   ├── • Zain Reswara WP
    │   │   │
    │   │   └── • Lunetta Neelam Batari
    │   │
    │   └── • ASRORI JADID MUHARROM + Diar Afiantina
    │       │
    │       └── • Muh. Adidaan Rahadith Aysy (Alm)
    │
    ├── 4. H. BUNYAMIN + Ni Nyoman Adhi Hayati
    │   │
    │   ├── • EVANI AZZA YURISA RAUF
    │   │
    │   ├── • DEMA LATUMARAE AURUNISA + Andy Fathur Rohman
    │   │   │
    │   │   └── • Aufa Nafisa Raihanun
    │   │
    │   └── • BRYAN AHADYA MUHAMMAD
    │
    ├── 5. SITI JAZILAH + Suratno (Alm)
    │   │
    │   ├── • LILIN MUSTIKASARI + Karyawadi
    │   │   │
    │   │   └── • Najwa Rida Fakhrunnisa Ardhaneswari
    │   │
    │   ├── • VIVI HANDAYANI
    │   │
    │   ├── • RENDRA WAHYU HARIMURTI + Fitri Murdiyanti
    │   │
    │   └── • MUH. YURAHMA
    │
    ├── 6. (Nama tidak tercantum) + ST Wahimah
    │   │
    │   ├── • ELITA ELVA LINTANG FEMILA
    │   │
    │   └── • MUHAMMAD REZA ALI ZEIN
    │
    ├── 7. UMI JANNAH + Ahamudin
    │   │
    │   ├── • AKNIFA NAUFIS ZUNAIFA
    │   │
    │   ├── • QISTI RAISAL BARO
    │   │
    │   └── • AFWAZ MUHAMAD AFIF
    │
    ├── 8. BINASORI + Dwi Astuti
    │   │
    │   ├── • MUHAMMAD YOSE ARDITO
    │   │
    │   └── • CHUMAIRA DEBI NUR AKMALA
    │
    └── 9. SITI KHUZAIMAH + Mugiyanto
        │
        ├── • LYFIA PRATIDINA ALUTFI
        │
        └── • RANGGA PRADITYA DIKUTAUW LUTFI
```

## Langkah-Langkah Import

### 1. Buka Halaman Import
- Login ke aplikasi AtoZ
- Klik **"Import Bagan Silsilah"** di dashboard
- Atau buka: `http://localhost:3000/import`

### 2. Copy & Paste Data
1. Select semua text di atas (dari "MBAH NURYO UTOMO" sampai baris terakhir)
2. Copy (Ctrl+C atau Cmd+C)
3. Paste di textarea yang tersedia di halaman import
4. Klik **"Preview Import →"**

### 3. Review Preview
Sistem akan menampilkan:
- **Total Anggota**: ~83 orang
- **Total Pernikahan**: ~29 pasangan
- **Generasi**: 5 generasi
- Preview tree structure

Periksa apakah data terlihat benar.

### 4. Konfirmasi & Import
1. Klik **"✓ Konfirmasi & Import"**
2. Tunggu proses selesai (sekitar 5-10 detik)
3. Sistem akan menampilkan hasil:
   - Jumlah anggota yang dibuat
   - Jumlah pernikahan yang dibuat
   - Jumlah unit keluarga yang dibuat

### 5. Verifikasi Hasil
Setelah redirect ke halaman "Susunan Keluarga":
1. Anda akan melihat semua unit keluarga yang terbentuk
2. Klik pada unit keluarga untuk melihat detail
3. Verifikasi data anggota dan relasi

## Hasil yang Diharapkan

Setelah import berhasil, Anda akan memiliki:

### Struktur Keluarga
- **Root**: MBAH NURYO UTOMO
- **Anak**: ALI SISWAWIYATA
- **Cucu**: 9 pasangan (anak-anak Ali + pasangan mereka)
  1. SITI MURSIDAH + Muh. Husein (6 anak)
  2. SITI MARTILAH + Imam Harsono (7 anak)
  3. SITI RUJINAH + Santo Tukimin (2 anak)
  4. H. BUNYAMIN + Ni Nyoman Adhi Hayati (3 anak)
  5. SITI JAZILAH + Suratno (4 anak)
  6. (Unknown) + ST Wahimah (2 anak)
  7. UMI JANNAH + Ahamudin (3 anak)
  8. BINASORI + Dwi Astuti (2 anak)
  9. SITI KHUZAIMAH + Mugiyanto (2 anak)

### Unit Keluarga yang Terbentuk
Sistem akan otomatis membuat:
- 29 unit keluarga (pasangan + anak-anak mereka)
- Semua relasi parent-child
- Semua marriage relationships
- Link antar generasi via parentUnitId

### Fitur Otomatis
- ✅ Gender detection (dari pola nama)
- ✅ Deceased marker (Santo Tukimin, Muhammad Fadel Rosyid, dll)
- ✅ Activity log untuk tracking import

## Tips Setelah Import

1. **Lengkapi Data**:
   - Tambahkan tanggal lahir untuk setiap anggota
   - Tambahkan informasi kontak (email, phone)
   - Upload foto keluarga

2. **Koreksi Gender**:
   - Periksa gender yang terdeteksi otomatis
   - Edit jika ada yang salah

3. **Verifikasi Relasi**:
   - Cek apakah parent-child relationship sudah benar
   - Pastikan marriage relationship akurat

4. **Update Info Tambahan**:
   - Tambahkan alamat, pekerjaan, dll
   - Isi catatan khusus di field notes

## Troubleshooting

### Import Gagal
Jika import gagal, periksa:
- Format tree sudah benar?
- Ada karakter aneh yang tidak didukung?
- Connection internet stabil?

### Beberapa Anggota Tidak Muncul
Kemungkinan:
- Ada error di format tree (indentasi salah)
- Lihat di hasil import → error list
- Tambahkan manual yang missing

### Gender Salah Terdeteksi
Normal! Sistem inferensi gender tidak 100% akurat.
- Edit manual via halaman detail member
- Atau via halaman edit member

## Setelah Import Berhasil

Anda bisa:
1. **Lihat Dashboard**: Statistik akan terupdate otomatis
2. **Browse Unit Keluarga**: Klik di list untuk lihat detail
3. **Lihat Member**: Akses profil individual via links
4. **Activity Log**: Cek di dashboard untuk melihat log import
5. **Export**: (Coming soon) Export kembali ke format lain

## Dukungan

Jika ada masalah atau pertanyaan:
- Periksa dokumentasi lengkap: `docs/IMPORT_GENEALOGY.md`
- Check error messages di console browser
- Simpan screenshot untuk troubleshooting
