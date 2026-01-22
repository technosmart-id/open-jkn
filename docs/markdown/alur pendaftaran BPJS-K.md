Here is the document converted into a structured Markdown format.

---

# Alur Pendaftaran BPJS Kesehatan & Sistem Terkait

Dokumen ini merangkum alur pendaftaran pasien di fasilitas kesehatan, pendaftaran peserta mandiri, pendaftaran fasilitas kesehatan (faskes), serta struktur database OpenIMIS berdasarkan file yang diunggah.

## 1. Alur Pendaftaran Pasien di Rumah Sakit / Puskesmas

Bagian ini menjelaskan bagaimana pasien diproses saat tiba di fasilitas kesehatan, baik untuk rawat jalan maupun rawat inap.

A. Alur Pelayanan Pasien Rawat Jalan (Umum)

- **Kedatangan:** Pasien Baru/Rawat Jalan mengambil nomor antrian di mesin.

- **Verifikasi (Loket I):** Verifikasi berkas BPJS.

- **Registrasi (Loket II, III, IV):** Proses Registrasi, penerbitan SEP (Surat Eligibilitas Peserta), dan SJP (Surat Jaminan Pelayanan).

- **Poli Klinik:** Pasien menuju Poli Klinik Spesialis Rawat Jalan.

- **Tindakan Lanjutan:**
- **Pemeriksaan Penunjang:** Laboratorium, Radiologi, EEG, dll.

- **Rawat Inap:** Jika diperlukan, pasien dipindahkan ke Rawat Inap.

- **Penyelesaian (Loket VI):** Legalisir resep kacamata atau obat khusus.

- **Obat & Pulang:** Pasien menuju Apotik untuk mengambil obat, kemudian Pulang.

- **Pasien Rawat Inap Langsung:** Masuk ke Ruang Rawat Inap.

B. Alur Pendaftaran (Studi Kasus: UPTD Puskesmas I Mendoyo)

1.  **Pasien Datang:** Pasien mengambil nomor antrean.

2.  **Skrining:** Dilakukan skrining dasar sebelum menuju loket.

3.  **Loket Pendaftaran:** Cek kepemilikan jaminan kesehatan.

- **Tidak Memiliki Jaminan:** Pasien dikenakan tarif umum.

- **Memiliki Jaminan (BPJS):** Cek riwayat kunjungan.

- _Pernah Berkunjung:_ Masuk kategori Pasien Lama -> Pembuatan e-Rekam Medis.

- _Tidak Pernah Berkunjung:_ Masuk kategori Pasien Baru -> Didaftarkan di sistem e-PUS -> Pembuatan e-Rekam Medis.

4.  **Consent:** Pemberian informasi dan penandatanganan _General Consent_.

5.  **Pelayanan:** Skrining PTM (Penyakit Tidak Menular) -> Masuk Ruang Pelayanan.

---

## 2. Alur Pendaftaran Peserta BPJS Mandiri (Offline)

Proses pendaftaran bagi calon peserta yang mendaftar secara mandiri dengan datang langsung ke kantor BPJS.

1. **Persiapan & Kewajiban Keluarga:** Siapkan berkas persyaratan (KK, KTP). Semua anggota keluarga di dalam KK wajib didaftarkan.

2. **Datang ke Kantor BPJS:** Bawa berkas, datang pagi, dan ambil nomor antrean.

3. **Input Data & Terima VA:** Petugas menginput data. Peserta menerima Nomor _Virtual Account_ (VA) untuk satu keluarga.

4. **Pembayaran Iuran Pertama:**

- Bayar minimal **14 hari sampai 30 hari** setelah terima VA.

- _Penting:_ Jika lewat 30 hari, harus registrasi ulang.

5. **Ambil Kartu BPJS:** Bawa bukti bayar, KTP, dan KK ke kantor setelah bayar. Kartu langsung AKTIF dan bisa digunakan.

> **Catatan Penting:** Bayar iuran setiap bulan (min. tgl 14). Terlambat 1 bulan menyebabkan kartu NONAKTIF.

---

## 3. Alur Proses Pendaftaran Faskes (HFIS)

Proses bagi Fasilitas Kesehatan (Faskes) untuk bermitra dengan BPJS Kesehatan melalui sistem HFIS (_Health Facilities Information System_).

1.  **Pendaftaran:** Pendaftaran faskes ke Kantor Cabang dan pembuatan akun HFIS untuk faskes.

2.  **Self Assessment:** Faskes mengaktifkan akun HFIS dan mengisi data profil serta form _self assessment_.

3.  **SA (Approval Kabid):** Data profil dan _self assessment_ faskes diajukan oleh staf kepada Kabid untuk persetujuan (approval).

4.  **Kredensialing:** Setelah di-_approve_ Kabid, staf melakukan kunjungan kredensialing ke faskes yang bersangkutan.

5.  **Kredensial (Kabid):** Pengajuan hasil kredensial oleh staf ke Kabid.

6.  **Kontrak:** Faskes yang bersangkutan dinyatakan diterima dan siap untuk pembuatan surat PKS (Perjanjian Kerja Sama).

7.  **Ditolak/Diterima:** Keputusan akhir apakah faskes dinyatakan belum bisa diterima atau diterima.

8.  **Go Live:** Faskes sudah resmi menjadi mitra BPJS Kesehatan.

---

## 4. Struktur Database OpenIMIS

Gambaran relasi data dalam sistem manajemen asuransi kesehatan terbuka (OpenIMIS).

- **Entitas Utama (Insuree & Family):**
- _Family_ (Keluarga) terhubung dengan _Insuree_ (Tertanggung).

- Data _Insuree_ mencakup detail seperti _Profession, Gender, Education_, dan _Insuree Photo_.

- **Polis (Policy):**
- _Insuree_ terhubung ke _Policy_ melalui _Insuree Policy_.

- _Policy_ dikelola oleh _Enrolment Officer_ dan memiliki proses _Policy Renewal_.

- **Klaim (Claim):**
- _Claim_ terhubung dengan _Insuree_ (siapa yang sakit), _Health Facility_ (tempat berobat), dan _Claim Admin_.

- Detail klaim mencakup _Claim Items_ dan _Claim Services_.

- **Layanan & Item Medis:**
- _Items_ dan _Services_ memiliki daftar harga (_PriceList_) yang terhubung ke fasilitas kesehatan (_Health Facility_).

- **Lokasi & Fasilitas:**
- _Health Facility_ terhubung dengan _Location_.

---

**Would you like me to extract specific requirements for the "Credentialing" phase mentioned in the Health Facility registration flow?**
