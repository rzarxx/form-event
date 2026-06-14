PRODUCT REQUIREMENTS DOCUMENT (PRD)
Nama Produk: CampusTicketing / Enabler Event (Update V3)
Platform: Web Application (Responsive B2B & B2C)
Tech Stack: Next.js (Fullstack), Prisma ORM, Tailwind CSS, MPWA (WhatsApp API)

---

1. SKEMA BISNIS (BUSINESS MODEL & STRATEGY)
Platform ini bertindak murni sebagai Penyedia Infrastruktur (Enabler) bagi promotor dan panitia acara. Seluruh alur bisnis, penetapan harga, dan kebijakan platform dapat dikontrol sepenuhnya secara dinamis oleh Super Admin.

A. Target Pengguna
- B2B (Promotor/Kepanitiaan): Himpunan mahasiswa, BEM, EO lokal.
- B2C (End-User/Peserta): Mahasiswa atau masyarakat umum pembeli tiket.
- Affiliate/Mitra: Pihak yang mereferensikan platform ke panitia lain.

B. Arus Pendapatan (Monetisasi) & Referral System
- Convenience Fee: Biaya layanan tambahan saat checkout event berbayar (ditanggung pembeli). Besaran fee ini dapat diatur sepenuhnya oleh Super Admin.
- Freemium Model: Event gratis dengan batas kuota peserta tertentu (misal: 150 peserta). Batas kuota gratis ini dan biaya sewa jika melebihi kuota sepenuhnya dikontrol oleh Super Admin.
- Premium B2B Add-ons: Whitelabel Custom Subdomain, Auto-Blast WA, Auto-Sertifikat.
- Sistem Referral (Win-Win Solution): 
  * Mitra/Teman yang membagikan kode referral akan mendapatkan komisi tunai (ditentukan oleh Super Admin) dari setiap event berbayar yang sukses diselenggarakan oleh panitia yang diajak.
  * Panitia yang mendaftar menggunakan kode referral otomatis mendapatkan akses Fitur PRO (Kapasitas besar / Whitelabel) secara GRATIS untuk event pertama mereka.

---

2. MANAJEMEN AKSES, ROLES & PANELS (RBAC)
Sistem memiliki 3 panel/antarmuka terpisah untuk menjaga keamanan dan fokus kerja:

A. Super Admin Panel (Hak Akses Penuh)
- Pemantauan global (Transaksi, GMV, Event Aktif).
- Manajemen Sistem & Bisnis Global: Mengontrol seluruh alur bisnis platform, mengatur besaran biaya layanan (platform fee), menentukan batas kuota gratis untuk event (freemium), serta melakukan sinkronisasi otomatis metode pembayaran dari Tripay (Super Admin dapat melihat semua channel Tripay yang tersedia dan secara fleksibel mengaktifkan atau menonaktifkan channel pembayaran tertentu).
- Manajemen Referral: Membuat kode referral, menetapkan mitra, memantau penggunaan kode, dan menyetujui pencairan komisi (payout) ke mitra.
- Dynamic Pricing & User Management (termasuk membuat akun Panitia atau Scanner).

B. Panitia Panel (Event Organizer Dashboard)
- Halaman Pendaftaran Khusus Panitia (Landing Page B2B): Alur onboarding panitia baru untuk membuat akun, mengisi profil organisasi, dan memasukkan Kode Referral.
- Manajemen Event: Membuat form dinamis, mengatur kuota, harga, dan whitelabel.
- Manajemen Akses Scanner: Panitia dapat membuat akun login khusus ber-role "SCANNER" yang akan digunakan oleh relawan penjaga pintu (Gatekeeper) untuk memindai tiket tanpa memiliki hak akses ke data keuangan/edit event.

C. Dedicated Scanner Panel (Web-App Khusus Penjaga Pintu)
- URL Akses Login (contoh: domainmu.com/scan).
- Relawan harus login menggunakan akun "SCANNER" yang telah dibuatkan oleh Panitia atau Super Admin.
- Antarmuka sangat ringan (hanya membuka kamera/HTML5 QR Code Scanner).
- Tidak memiliki akses untuk melihat data keuangan atau mengedit event.
- Memberikan feedback instan: Suara "BEEP" hijau (Berhasil) atau suara "TETOT" merah (Gagal/Sudah Dipindai).

---

3. KEAMANAN SISTEM (SECURITY ARCHITECTURE)
- Anti-Tamper QR Code: QR code menggunakan HMAC-SHA256. Mencegah manipulasi ID tiket.
- Anti-Replay & Sync Realtime: Scanner panel terkoneksi langsung ke database. Jika 2 gatekeeper memindai tiket yang sama di detik yang sama, hanya 1 yang berhasil.
- Backend Pricing Validation: Mencegah parameter tampering (hacker mengubah harga di frontend).
- Magic Link Anti-Bypass (Online Event): Link Zoom disembunyikan di balik routing Next.js dengan token khusus.

---

4. RANCANGAN FITUR UTAMA (CORE FEATURES)
- Landing Page Pendaftaran Mitra & Panitia: Halaman konversi khusus untuk menjelaskan benefit platform dan pendaftaran organizer.
- Dynamic Form (JSON): Form registrasi fleksibel (Text, Select, Upload).
- Whitelabel CMS: Kustomisasi landing page event (Warna, Banner, Guest Star).
- Checkout & Bypass Rp0: Tiket gratis langsung terbit, tiket berbayar via Payment Gateway (dengan sinkronisasi dan seleksi metode pembayaran Tripay yang diatur oleh Super Admin).
- MPWA Integration: Pengiriman tiket dan notifikasi otomatis via WhatsApp.

---

5. SKEMA KODE & ARSITEKTUR DATABASE (PRISMA SCHEMA UPDATE)

model User {
  id             String      @id @default(uuid())
  role           String      // "SUPER_ADMIN" | "PANITIA" | "MITRA" | "SCANNER"
  email          String      @unique
  password       String
  name           String?
  referredByCode String?     // Menyimpan kode referral saat mendaftar
  
  // Hubungan antara Scanner dan Panitia
  panitiaId      String?
  panitia        User?       @relation("ScannerToPanitia", fields: [panitiaId], references: [id])
  scanners       User[]      @relation("ScannerToPanitia")
  
  events         Event[]
  referrals      Referral[]  // Jika user ini adalah MITRA
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model Referral {
  id             String   @id @default(uuid())
  code           String   @unique // Contoh: "BEMJAGO2026"
  ownerId        String   // FK ke User (MITRA)
  owner          User     @relation(fields: [ownerId], references: [id])
  commission     Decimal  @default(0) // Total komisi terkumpul
  usageCount     Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Event {
  id               String        @id @default(uuid())
  userId           String        // Panitia
  user             User          @relation(fields: [userId], references: [id])
  title            String
  description      String?
  bannerUrl        String?
  subdomain        String?       @unique
  isProFree        Boolean       @default(false) // True jika pakai kode referral
  formSchema       Json?    
  tickets          Ticket[]
  transactions     Transaction[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model SystemSetting {
  id               String   @id @default("GLOBAL")
  platformFee      Decimal  @default(0) // Convenience Fee global
  freeQuotaLimit   Int      @default(150) // Batas peserta event gratis
  paymentMethods   Json?    // Konfigurasi metode pembayaran dari sync Tripay (aktif/nonaktif)
  updatedAt        DateTime @updatedAt
}

model Ticket {
  id               String        @id @default(uuid())
  eventId          String
  event            Event         @relation(fields: [eventId], references: [id])
  name             String
  price            Decimal       @default(0)
  quota            Int           @default(0)
  sold             Int           @default(0)
  transactions     Transaction[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model Transaction {
  id               String   @id @default(uuid())
  eventId          String
  event            Event    @relation(fields: [eventId], references: [id])
  ticketId         String
  ticket           Ticket   @relation(fields: [ticketId], references: [id])
  buyerName        String
  buyerEmail       String
  buyerPhone       String?
  paymentStatus    String   // "PENDING" | "SUCCESS" | "FAILED"
  paymentMethod    String?
  paymentRef       String?  // Tripay Reference
  ticketCode       String   @unique
  qrSignature      String   @unique // Anti-Tamper HMAC
  checkInStatus    Boolean  @default(false)
  formData         Json?    // Data formulir kustom
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

---

6. UI/UX & DESIGN SYSTEM
- Tipografi: Poppins & Inter.
- Scanner UI Khusus: Layar dominan hitam/gelap untuk menghemat baterai HP relawan saat hari H, area kamera besar di tengah, indikator status scanning besar.
- Palet Warna: Indigo (#4F46E5) untuk B2B, Emerald (#10B981) untuk success state.
