# OpenJKN: Comprehensive Step-by-Step Example Cases

This document provides a detailed walkthrough of the major user journeys within OpenJKN, mapped directly to the UI elements and the underlying application logic.

---

## Case 1: The Newcomer (Full Registration Lifecycle)
**Objective**: Successfully register a new participant, generate a Virtual Account, and sync to openIMIS/SatuSehat.

### Step 1: Initiating Registration
1.  **Sidebar**: Click on the **"Pendaftaran"** menu.
2.  **UI**: On the registration list page, click the **"Pendaftaran Baru"** button (top right).
3.  **UI**: You are navigated to `/pendaftaran/baru`.

### Step 2: Form Input (The Three Pillars)
*   **Section 1: Pilih Peserta**
    *   **Action**: Type a name or NIK into the **"Cari Peserta"** input field.
    *   **Logic**: The system calls `orpc.jkn.participant.list` to filter local participants.
    *   **Action**: Click on one of the search results (e.g., "Budi Santoso"). The card highlights in primary color.
*   **Section 2: Segmen & Kelas Rawat**
    *   **Action**: Click the **"Segmen Peserta"** dropdown. Select **"PBPU"** (Pekerja Bukan Penerima Upah).
    *   **Action**: Click the **"Kelas Rawat"** dropdown. Select **"Kelas 1"**.
*   **Section 3: Dokumen Pendukung**
    *   **Action**: Click **"Upload"** on **"Kartu Keluarga (KK)"** and **"Kartu Tanda Penduduk (KTP)"**.
    *   **Logic**: Files are uploaded to the `/uploads` directory, and the URL is stored in the local state.

### Step 3: Submission & Status Change
1.  **Action**: Click the **"Simpan Pendaftaran"** button.
2.  **Logic**: `orpc.jkn.registration.create` is triggered.
    *   `registration_application` table: New record created with status `DRAFT`.
    *   `participant` table: `isActive` remains `false`.
3.  **UI**: Success screen appears. Click **"Kembali ke Daftar"**.

### Step 4: Admin Verification & Payment
1.  **UI**: In the registration list, click **"Detail"** on the new application.
2.  **Action**: Admin clicks **"Verify"**.
3.  **Logic**: Status -> `VIRTUAL_ACCOUNT_DIBUAT`. A `virtualAccountNumber` is generated in the `bank_information` table.
4.  **UI**: Navigate to **"Pembayaran"** menu. Select the participant and click **"Input Pembayaran"**.
5.  **Logic**: Upon payment, status -> `AKTIF`.
    *   **Trigger**: `SyncService.syncParticipant(id)` is called.
    *   **OpenIMIS**: `tblInsuree` and `tblPolicy` records are created.
    *   **SatuSehat**: A FHIR `Patient` resource is registered.

---

## Case 2: The Chameleon (Data Mutation/Change Request)
**Scenario**: A participant needs to update their address and Primary Health Facility (Faskes).

### Step 1: Locating the Participant
1.  **Sidebar**: Click on **"Peserta"**.
2.  **UI**: Use the search bar to find the participant by BPJS Number. Click the participant row.
3.  **UI**: In the Participant Detail page, click the **"Ubah Data"** button.

### Step 2: Requesting Changes
1.  **UI**: You are navigated to `/peserta/[id]/edit`.
2.  **Action**: Update the **"Alamat Jalan"**, **"Kelurahan"**, and **"Kecamatan"** fields.
3.  **Action**: Click **"Simpan Perubahan"**.
4.  **Logic**: This updates the `participant` record directly for non-sensitive data.
5.  **Sensitive Note**: For "Faskes" or "NIK", the UI prompts you to click **"Permohonan Perubahan Data"** (Form 3B).
6.  **Action**: Navigate to **"Perubahan Data"** sidebar -> **"Permohonan Baru"**.
7.  **Input**: Select **"FASKES"** as Change Type. Select a new facility from the searchable dropdown.

### Step 3: Approval Lifecycle
1.  **Sidebar**: Click **"Perubahan Data"**.
2.  **UI**: Click **"Detail"** on the `PENDING` request.
3.  **Comparison**: The UI shows a side-by-side view: **"Data Sebelumnya"** (Red) vs **"Data Baru"** (Green).
4.  **Action**: Admin clicks **"Verifikasi"** and enters notes.
5.  **Action**: Admin clicks **"Setujui & Terapkan"**.
6.  **Logic**:
    *   `participant` table: Updated with new faskes ID.
    *   `data_change_request` status -> `APPROVED`.
    *   **Sync**: SyncService pushes the update to OpenIMIS `tblInsuree.address`.

---

## 9. Menu SatuSehat: Trigger Encounter (Proof of Concept)
**Tujuan**: Mendaftarkan kunjungan pasien (Encounter) ke SatuSehat IHS tanpa menyentuh rekam medis, cukup status "Arrived".

### Langkah-langkah UI:
1.  **Navigasi**: Klik menu **"Integrasi SatuSehat"** (Halaman POC).
2.  **Input**:
    *   **Pilih Peserta**: Masukkan nama peserta yang sudah terdaftar.
    *   **Pilih Faskes**: Pilih klinik/RS tempat kunjungan.
    *   **NIK Dokter**: Masukkan NIK dokter yang bertugas.
    *   **Poli/Ruangan**: Masukkan nama poli (contoh: "Poli Gigi").
3.  **Aksi**: Klik tombol **"Trigger Encounter POC"**.

### Logika Sistem (The 4+1 Prep):
*   **Step 1 (Organization)**: Sistem mengambil `satusehatId` Klinik dari database.
*   **Step 2 (Location)**: Sistem melakukan **POST** ke `/Location` untuk mendaftarkan nama poli di bawah organisasi klinik.
*   **Step 3 (Patient)**: Sistem melakukan **GET** ke `/Patient` menggunakan NIK peserta untuk mendapatkan IHS Number.
*   **Step 4 (Practitioner)**: Sistem melakukan **GET** ke `/Practitioner` menggunakan NIK dokter untuk mendapatkan IHS Number dokter.
*   **Final Step (Encounter)**: Sistem mengirimkan payload **POST** `/Encounter` dengan status `arrived`, menghubungkan keempat ID di atas.

### Hasil:
*   Pasien tercatat sudah "Hadir" di sistem SatuSehat Nasional untuk kunjungan tersebut.
*   Record sinkronisasi tersimpan di tabel `satusehat_sync` dengan resource type `Encounter`.

---

## Case 3: The Guardian (Payment & Financial Sync)
**Scenario**: Handling a manual payment for a participant who is currently inactive.

### Step 1: Identifying Arrears
1.  **Sidebar**: Click on **"Pembayaran"**.
2.  **UI**: Use the **"Status"** filter and select **"Pending"**.
3.  **UI**: Identify the participant and check the **"Total"** column (includes Amount + Admin Fee + Penalty).

### Step 2: Recording Payment
1.  **Action**: Click **"Input Pembayaran"** (top right).
2.  **Input**: Search for Participant ID, select **"Metode: Manual"**, and select **"Bank: MANDIRI"**.
3.  **Action**: Click **"Simpan Pembayaran"**.
4.  **Logic**: 
    *   `contribution_payment` status -> `PAID`.
    *   If this is the first payment, the linked `registration_application` status -> `AKTIF`.
    *   Participant `isActive` flag -> `true`.

### Step 3: Verification in Sync
1.  **Sidebar**: Click **"Sync openIMIS"**.
2.  **UI**: You see a log of recent synchronizations.
3.  **Check**: Look for the participant's `CHFID` (e.g., `JKN-12345678`).
4.  **Verification**: Status should show **"Success"**. If failed, click **"Retry Sync"** to re-trigger the `SyncService`.

---

## System Summary: Logic Flow
1.  **User Input** -> Validated by Zod/Drizzle Schema.
2.  **Local DB** -> `open-jkn` PostgreSQL updated.
3.  **Background Worker** -> `SyncService` connects to `OPENIMIS_DATABASE_URL`.
4.  **Mapping Logic** -> JKN Enums mapped to openIMIS Codes (e.g., `PBPU` -> `4`).
5.  **External DB** -> openIMIS PostgreSQL updated (`tblInsuree`, `tblFamilies`, `tblPolicy`).
6.  **API Integration** -> SatuSehat FHIR API creates/updates Patient resources.
