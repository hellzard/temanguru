# Master Feature Blueprint

## North star

**Teman Guru mengubah satu aktivitas sekolah menjadi banyak keluaran yang rapi tanpa mengisi data yang sama berulang kali.**

## Modul 1 — Mengajar

### Dashboard Hari Ini
- Kelas berikutnya, agenda, pekerjaan belum selesai, status sinkronisasi, dan aksi cepat.
- Tidak memakai grafik dekoratif; setiap insight harus menghasilkan tindakan.

### Catat Kelas 60 Detik
- Jadwal dan identitas kelas terisi otomatis.
- Presensi, materi, aktivitas, pemahaman kelas, kendala, dan tindak lanjut.
- Menghasilkan jurnal, progres materi, daftar remedial, dan ringkasan mingguan.

### Presensi
- Default semua hadir, lalu ubah pengecualian.
- Draft/final, penguncian sesi, koreksi berizin, rekap bulanan, CSV/XLSX/PDF.

### Nilai dan capaian
- Assessment, rubrik, bobot, nilai kosong, remedial yang mempertahankan histori.
- Peta penguasaan kelas dan rekomendasi berbasis aturan, bukan AI.

### Classroom Focus Mode
- Tombol besar untuk presensi, timer, catatan cepat, pemilih murid, kelompok, dan exit ticket.
- Setelah kelas ditutup, data masuk ke jurnal.

### Seating Planner dan Group Builder
- Drag-and-drop denah kelas.
- Kelompok acak atau seimbang memakai algoritma deterministik.

### Substitute Teacher Pack
- Paket kelas untuk guru pengganti: jadwal, daftar murid, materi terakhir, instruksi, presensi, dan laporan balik.

## Modul 2 — Teman Guru Docs

### Brand Kit Sekolah
- Identitas sekolah, warna, logo, logo yayasan/pemerintah, pejabat penandatangan.
- Crop, resize, lock aspect ratio, versi warna/hitam-putih.

### Kop Surat Visual
- Editor terbatas berbasis komponen aman: logo, teks, garis, header, footer.
- A4/F4/Letter, portrait/landscape, margin custom, preview print.

### Template Dinamis
- Variabel standar dan variabel custom seperti `{{nama_sekolah}}`.
- Validasi variabel kosong sebelum ekspor.

### Generator Dokumen
- Surat tugas, undangan, keterangan, pemberitahuan, berita acara, notulen, sertifikat.
- SK dengan bagian Menimbang/Mengingat/Memutuskan dan lampiran.

### Tanda Tangan Visual & Stempel
- Upload/gambar tanda tangan, upload stempel, resize, position, opacity.
- Aset privat, usage approval, audit log, tidak dapat diunduh mentah oleh role biasa.

### Ekspor
- PDF, DOCX, XLSX, CSV, ZIP massal.
- QR verifikasi aplikasi dan document hash.
- QR verifikasi tidak boleh diklaim sebagai TTE tersertifikasi.

### Smart Document Checker
- Mendeteksi field kosong, nomor duplikat, gambar terlalu kecil, tabel overflow, tanda tangan belum disetujui.

### Arsip
- Klasifikasi, hak akses, versi, status aktif/dicabut, tag, pencarian, masa simpan configurable.

## Modul 3 — Workflow

### Form Builder Terbatas
- Field text, textarea, number, date, select, checkbox, file, user, class, room, asset.
- Schema tervalidasi dan versioned.

### Workflow Builder
- Draft → submit → review → revise/approve → finalize → archive.
- Persetujuan satu/bertingkat, SLA/tenggat, komentar, assignment, audit event.

### Use cases
- Surat tugas, izin, penggunaan ruang, kegiatan, pembelian, perbaikan, persetujuan dokumen.

## Modul 4 — Events & Meetings

### Event OS
- Proposal, SK panitia, struktur panitia, task, RAB, realisasi, surat, presensi QR, dokumentasi, sertifikat, LPJ.
- Nama kegiatan dan panitia reusable ke semua dokumen.

### Meeting & Decision Tracker
- Agenda, undangan, peserta, notulen, keputusan, PIC, tenggat, bukti penyelesaian.
- Keputusan muncul pada dashboard sampai ditutup.

## Modul 5 — School Operations

### Inventory
- Asset register, QR, lokasi, kondisi, peminjaman, pengembalian, maintenance history.

### Room & Equipment Booking
- Kalender, conflict detection, approval, capacity, linked asset.

### Maintenance Ticket
- Foto, lokasi, prioritas, assignment, biaya, before/after, status.

### Duty & Substitute Scheduling
- Piket, pengawas, guru pengganti, deteksi bentrok, pertukaran dan approval.

## Modul 6 — Connect & Portfolio

### Parent Meeting Pack
- Kehadiran, nilai, kekuatan, dukungan, hasil pertemuan, kesepakatan, tindak lanjut.

### Communication Composer
- Satu pengumuman menjadi versi WhatsApp copy, surat resmi, dan PDF.
- Versi awal tidak mengirim otomatis melalui API berbayar.

### Student Evidence Portfolio
- Bukti karya minimum, rubrik, tanggal, mata pelajaran, status perkembangan.
- Default private; publikasi hanya opt-in dan tanpa identitas sensitif.

### Teacher Professional Portfolio
- Sertifikat, perangkat ajar, karya, kegiatan, supervisi, CV dan ekspor portofolio.

## Modul 7 — Knowledge & Archive

- SOP, tata tertib, template aktif, version history, effective date, owner, approver.
- Dokumen lama diberi status tidak berlaku, tidak dihapus diam-diam.

## Modul 8 — Platform Foundation

- Multi-school tenancy, role/permission, audit log, notification center.
- PWA installable, IndexedDB draft/outbox, conservative caching.
- Search/command palette.
- Responsive navigation: sidebar/rail/bottom navigation.
- Accessibility WCAG 2.2 AA sebagai target.

## Fitur yang ditunda

- AI generatif.
- TTE tersertifikasi/PSrE.
- Integrasi tidak resmi dengan sistem pemerintah.
- WhatsApp Business API.
- Face recognition.
- LMS siswa lengkap dan video conference.
