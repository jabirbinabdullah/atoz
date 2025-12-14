# Deskripsi Fungsional Aplikasi AtoZ

## 📋 Gambaran Umum

AtoZ adalah aplikasi web modern untuk manajemen silsilah keluarga (genealogy) yang memungkinkan keluarga untuk:
- Mendokumentasikan anggota keluarga
- Melacak hubungan keluarga (orang tua-anak, pernikahan)
- Menyimpan informasi detail setiap anggota
- Mengelola data dalam lingkup keluarga yang terpisah

## 🎯 Tujuan Aplikasi

1. **Preservasi Sejarah Keluarga**: Menyimpan dan mengorganisir informasi keluarga untuk generasi mendatang
2. **Kolaborasi**: Memungkinkan anggota keluarga bekerja sama dalam mendokumentasikan silsilah
3. **Aksesibilitas**: Menyediakan akses mudah ke informasi keluarga dari mana saja
4. **Privasi**: Memastikan data keluarga terlindungi dengan sistem autentikasi dan otorisasi

## 🔑 Fitur Utama

### 1. Manajemen Autentikasi & Otorisasi

#### Autentikasi
- **Login/Logout**: Sistem autentikasi menggunakan NextAuth.js
- **Email & Password**: Login dengan kredensial
- **Session Management**: Pengelolaan sesi user yang aman

#### Sistem Role
Aplikasi mendukung 3 tingkat akses:

| Role | Hak Akses |
|------|-----------|
| **Admin** | - Semua hak akses Contributor<br>- Menghapus data member & relasi<br>- Mengelola user dalam keluarga |
| **Contributor** | - Membuat member baru<br>- Mengedit data member<br>- Membuat relasi (parent-child, marriage)<br>- Melihat semua data dalam keluarga |
| **Viewer** | - Hanya melihat data<br>- Tidak dapat mengedit atau menambah |

### 2. Manajemen Anggota Keluarga (Members)

#### Data Member
Setiap anggota keluarga dapat memiliki informasi:
- **Data Dasar**:
  - Nama lengkap (wajib)
  - Gender (Laki-laki/Perempuan)
  - Status hidup (Hidup/Wafat)
  
- **Data Kelahiran & Kematian**:
  - Tanggal lahir
  - Tempat lahir
  - Tanggal wafat (jika sudah meninggal)
  
- **Kontak & Detail**:
  - Alamat
  - Pekerjaan
  - Nomor telepon
  - Email
  
- **Media & Catatan**:
  - Foto profil (URL)
  - Catatan tambahan

#### Operasi CRUD
- **Create**: Menambah anggota keluarga baru (Admin/Contributor)
- **Read**: Melihat daftar dan detail member (Semua role)
- **Update**: Mengedit informasi member (Admin/Contributor)
- **Delete**: Menghapus member (Admin only)

#### Fitur Pencarian & Filter
- **Pencarian**: Cari member berdasarkan nama
- **Filter Gender**: Tampilkan hanya laki-laki atau perempuan
- **Filter Status**: Tampilkan hanya yang hidup atau sudah wafat
- **Include Relations**: Opsi untuk load data relasi sekaligus

### 3. Manajemen Relasi Keluarga

#### Relasi Orang Tua - Anak (Parent-Child)
- Menghubungkan orang tua dengan anak
- Mendukung peran orang tua: "father" atau "mother"
- Validasi: orang tua dan anak harus berbeda
- Operasi:
  - POST: Membuat relasi baru (Admin/Contributor)
  - DELETE: Menghapus relasi (Admin only)

#### Relasi Pernikahan (Marriage)
- Menghubungkan dua pasangan suami-istri
- Data pernikahan:
  - Tanggal pernikahan
  - Tanggal perceraian (opsional)
  - Catatan
- Validasi: kedua pasangan harus berbeda
- Operasi:
  - POST: Membuat pernikahan baru (Admin/Contributor)
  - DELETE: Menghapus pernikahan (Admin only)

### 4. Multi-Family Support

#### Konsep Family
- Setiap user terikat ke satu keluarga (Family)
- Setiap member terikat ke satu keluarga
- **Data Isolation**: User hanya bisa melihat dan mengelola member dalam keluarga sendiri

#### Family Data
- Nama keluarga
- Deskripsi keluarga
- Timestamp pembuatan

### 5. Fitur Todo List (Existing)

Aplikasi juga memiliki fitur todo list sederhana untuk tracking pekerjaan:
- Buat, edit, toggle, dan hapus todo
- Integrasi dengan user (todo per user)
- Client-side caching dengan localStorage
- Server-side persistence dengan database

## 🌐 Interface & User Experience

### Halaman Utama
- **Home Page**: Landing page dengan informasi aplikasi
- **Navigation**: Header dengan menu navigasi dan status login

### Halaman Members
- **List View**: Tampilan daftar member dengan informasi ringkas
- **Search Bar**: Pencarian nama member
- **Filter Controls**: Dropdown untuk filter gender dan status
- **Add Form**: Form inline untuk menambah member baru dengan semua field
- **Member Cards**: Kartu member dengan data lengkap (alamat, pekerjaan, kontak)

### Halaman Todos (Legacy)
- List todo dengan checkbox
- Form tambah todo
- Real-time updates

## 🔒 Keamanan & Privasi

### Authentication Flow
1. User login dengan email/password
2. NextAuth membuat session
3. Session tersimpan di database
4. Setiap request divalidasi dengan session

### Authorization
- Middleware `authorize()` memeriksa role user
- Setiap endpoint API dilindungi dengan auth check
- Family scoping memastikan data isolation

### Data Protection
- Password di-hash secara otomatis
- Session token terenkripsi
- HTTPS ready (untuk production)

## 📱 Responsiveness

- Mobile-friendly dengan Tailwind CSS
- Grid responsive untuk form dan list
- Breakpoints: mobile, tablet (md), desktop (lg)

## 🌍 Internationalization (Planned)

Interface saat ini sudah menggunakan Bahasa Indonesia:
- Label form dalam Bahasa Indonesia
- Pesan error dan validasi
- UI text
- Rencana: support multi-bahasa (ID/EN) dengan next-intl

## 📊 Data Visualization (Planned)

Rencana fitur visualisasi:
- Family tree view
- Hierarchy diagram
- Timeline view
- Statistics dashboard

## 🎨 Design System

- **Color Scheme**: 
  - Primary: Blue (#3B82F6)
  - Secondary: Gray (#6B7280)
  - Background: White/Light Gray
  
- **Typography**: 
  - Font: System fonts (sans-serif)
  - Heading: Bold, 2xl-xl
  - Body: Regular, base
  
- **Components**:
  - Buttons: Rounded, dengan hover states
  - Inputs: Bordered, full-width
  - Cards: Bordered, dengan shadow

## 🔄 State Management

- **Server State**: Database dengan Prisma ORM
- **Client State**: React hooks (useState, useEffect)
- **Cache**: localStorage untuk offline-first experience
- **Form State**: Controlled components dengan React

## ⚡ Performance

- **Server-Side Rendering**: Next.js App Router
- **Code Splitting**: Automatic dengan Next.js
- **Database Indexing**: Index pada field yang sering dicari
- **Pagination**: Limit 200 records per query
- **Optimistic Updates**: UI updates sebelum server response (todo list)

## 🔮 Future Enhancements

1. **Photo Upload**: Storage dan upload foto member
2. **Document Management**: Simpan dokumen keluarga (akta, surat, dll)
3. **Timeline View**: Visualisasi kronologis events keluarga
4. **Export/Import**: Export data ke PDF/Excel, import dari GEDCOM
5. **Notifications**: Notifikasi untuk birthday, anniversary
6. **Mobile App**: Native mobile app dengan React Native
7. **AI Features**: Auto-detect relationships, photo tagging
8. **Collaboration**: Real-time editing dengan multiple users

---

**Catatan**: Dokumentasi ini menggambarkan state aplikasi per 14 Desember 2025. Fitur dapat berkembang seiring waktu.
