-- ============================================================================
-- PBB PROCEDURES - Consolidated Procedures for PBB Tax Assessment
-- Migration: 9002
-- Generated: 2026-01-01
-- Source: Consolidated from 0002_penetapan_massal_procedures.sql and
--          0003_jpb_valuation_procedures.sql
-- ============================================================================

-- ============================================================================
-- PENETAPAN MASSAL - Stored Procedures for PBB Tax Assessment
-- Fresh implementation based on SISMIOP reference
-- ============================================================================

-- ------------------------------------------------------------------------------
-- 1. PENENTUAN_KELAS - Determine property class from NJOP per m2
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penentuan_kelas(
  IN p_flag_jenis BIGINT,         -- 1 = land (tanah), 2 = building (bangunan)
  IN p_thn_pajak TEXT,            -- Tax year (e.g., '2024')
  IN p_nilai_per_m2 BIGINT,       -- Value per m2 in Rupiah
  INOUT p_kd_kelas TEXT,          -- Output: class code
  INOUT p_thn_awal_kls TEXT,      -- Output: class start year
  INOUT p_njop_per_m2 BIGINT      -- Output: NJOP per m2
)
LANGUAGE plpgsql AS $$
DECLARE
  v_nilai_para DECIMAL(15,2);
BEGIN
  -- Convert to thousands (table stores values in thousands)
  v_nilai_para := p_nilai_per_m2 / 1000.0;

  IF p_nilai_per_m2 > 0 THEN
    IF p_flag_jenis = 1 THEN
      -- Land class lookup
      BEGIN
        SELECT kd_kls_tanah, nilai_per_m2_tanah, thn_awal_kls_tanah
        INTO STRICT p_kd_kelas, p_njop_per_m2, p_thn_awal_kls
        FROM kelas_tanah
        WHERE thn_awal_kls_tanah <= p_thn_pajak
          AND thn_akhir_kls_tanah >= p_thn_pajak
          AND nilai_min_tanah < v_nilai_para
          AND nilai_max_tanah >= v_nilai_para
          AND kd_kls_tanah NOT IN ('XXX', '00');
      EXCEPTION
        WHEN OTHERS THEN
          p_njop_per_m2 := v_nilai_para::BIGINT;
          p_kd_kelas := 'XXX';
          p_thn_awal_kls := '1986';
      END;
    ELSIF p_flag_jenis = 2 THEN
      -- Building class lookup
      BEGIN
        SELECT kd_kls_bng, nilai_per_m2_bng, thn_awal_kls_bng
        INTO STRICT p_kd_kelas, p_njop_per_m2, p_thn_awal_kls
        FROM kelas_bangunan
        WHERE thn_awal_kls_bng <= p_thn_pajak
          AND thn_akhir_kls_bng >= p_thn_pajak
          AND nilai_min_bng < v_nilai_para
          AND nilai_max_bng >= v_nilai_para
          AND kd_kls_bng NOT IN ('XXX', '00');
      EXCEPTION
        WHEN OTHERS THEN
          p_njop_per_m2 := v_nilai_para::BIGINT;
          p_kd_kelas := 'XXX';
          p_thn_awal_kls := '1986';
      END;
    END IF;
    -- Convert back from thousands
    p_njop_per_m2 := p_njop_per_m2 * 1000;
  ELSE
    p_njop_per_m2 := 0;
    p_kd_kelas := 'XXX';
    p_thn_awal_kls := '1986';
  END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. PENILAIAN_BUMI - Calculate land value for a single land component
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penilaian_bumi(
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  IN p_no_bumi SMALLINT,
  IN p_kd_znt CHAR(2),
  IN p_luas_bumi BIGINT,
  IN p_tahun CHAR(4),
  IN p_flag_update BIGINT,        -- 1 = update dat_op_bumi, 0 = read only
  INOUT p_nilai_bumi BIGINT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_nir DECIMAL(15,2) := 0;
BEGIN
  -- For special property types (7,8), use land class directly
  IF p_kd_jns_op IN ('7', '8') THEN
    BEGIN
      SELECT COALESCE(nilai_per_m2_tanah, 0)
      INTO STRICT v_nir
      FROM kelas_tanah
      WHERE RPAD(kd_kls_tanah, 3) = RPAD(p_kd_znt, 3);
    EXCEPTION
      WHEN OTHERS THEN v_nir := 0;
    END;
  ELSE
    -- Normal case: lookup NIR from dat_nir
    BEGIN
      SELECT nir
      INTO STRICT v_nir
      FROM dat_nir
      WHERE kd_propinsi = p_kd_propinsi
        AND kd_dati2 = p_kd_dati2
        AND kd_kecamatan = p_kd_kecamatan
        AND kd_kelurahan = p_kd_kelurahan
        AND kd_znt = p_kd_znt
        AND thn_nir_znt = p_tahun;
    EXCEPTION
      WHEN OTHERS THEN v_nir := 0;
    END;
  END IF;

  -- Calculate land value: luas * NIR
  p_nilai_bumi := p_luas_bumi * COALESCE(v_nir, 0);

  -- Optionally update dat_op_bumi
  IF p_flag_update = 1 THEN
    UPDATE dat_op_bumi
    SET nilai_sistem_bumi = ROUND(p_nilai_bumi)
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
      AND no_bumi = p_no_bumi;
  END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. PENILAIAN_BNG - Calculate building value for a single building
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penilaian_bng(
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  IN p_no_bng SMALLINT,
  IN p_tahun CHAR(4),
  IN p_flag_update BIGINT,
  INOUT p_nilai_bng BIGINT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_nilai_individu BIGINT := 0;
  v_nilai_sistem BIGINT := 0;
  v_kd_jpb CHAR(2);
  v_luas_bng BIGINT;
  v_jml_lantai SMALLINT;
BEGIN
  -- Check for individual valuation first
  BEGIN
    SELECT nilai_individu
    INTO STRICT v_nilai_individu
    FROM dat_nilai_individu
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
      AND no_bng = p_no_bng;
  EXCEPTION
    WHEN OTHERS THEN v_nilai_individu := 0;
  END;

  IF v_nilai_individu > 0 THEN
    p_nilai_bng := v_nilai_individu;
    RETURN;
  END IF;

  BEGIN
    SELECT kd_jpb, COALESCE(luas_bng, 0), COALESCE(jml_lantai_bng, 1)
    INTO STRICT v_kd_jpb, v_luas_bng, v_jml_lantai
    FROM dat_op_bangunan
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
      AND no_bng = p_no_bng;
  EXCEPTION
    WHEN OTHERS THEN
      p_nilai_bng := 0;
      RETURN;
  END;

  IF v_kd_jpb IN ('02', '04', '05', '07', '09') AND (v_luas_bng > 1000 OR v_jml_lantai > 4) THEN
    CASE v_kd_jpb
      WHEN '02' THEN CALL penilaian_jpb2(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      WHEN '04' THEN CALL penilaian_jpb4(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      WHEN '05' THEN CALL penilaian_jpb5(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      WHEN '07' THEN CALL penilaian_jpb7(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      WHEN '09' THEN CALL penilaian_jpb9(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      ELSE NULL;
    END CASE;
  ELSIF v_kd_jpb = '03' THEN
    CALL penilaian_jpb3(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng::BIGINT, p_tahun, p_nilai_bng);
  ELSIF v_kd_jpb IN ('06', '08') AND (v_luas_bng > 1000 OR v_jml_lantai > 4) THEN
    CASE v_kd_jpb
      WHEN '06' THEN CALL penilaian_jpb6(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      WHEN '08' THEN CALL penilaian_jpb8(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      ELSE NULL;
    END CASE;
  ELSIF v_kd_jpb IN ('12', '13', '14', '15', '16') THEN
    CASE v_kd_jpb
      WHEN '12' THEN CALL penilaian_jpb12(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng::BIGINT, p_tahun, p_nilai_bng);
      WHEN '13' THEN CALL penilaian_jpb13(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      WHEN '14' THEN CALL penilaian_jpb14(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      WHEN '15' THEN CALL penilaian_jpb15(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      WHEN '16' THEN CALL penilaian_jpb16(p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan, p_kd_blok, p_no_urut, p_kd_jns_op, p_no_bng, p_tahun, p_nilai_bng);
      ELSE NULL;
    END CASE;
  ELSE
    BEGIN
      SELECT COALESCE(nilai_sistem_bng, 0) INTO STRICT v_nilai_sistem
      FROM dat_op_bangunan
      WHERE kd_propinsi = p_kd_propinsi AND kd_dati2 = p_kd_dati2 AND kd_kecamatan = p_kd_kecamatan
        AND kd_kelurahan = p_kd_kelurahan AND kd_blok = p_kd_blok AND no_urut = p_no_urut
        AND kd_jns_op = p_kd_jns_op AND no_bng = p_no_bng;
    EXCEPTION
      WHEN OTHERS THEN v_nilai_sistem := 0;
    END;
    p_nilai_bng := v_nilai_sistem;
  END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. PENENTUAN_NJOP_BUMI - Calculate total land NJOP for a property
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penentuan_njop_bumi(
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  IN p_tahun CHAR(4),
  INOUT p_total_luas_bumi BIGINT,
  INOUT p_total_nilai_bumi BIGINT,
  INOUT p_njop_bumi_per_m2 BIGINT,
  INOUT p_kd_kls_tanah TEXT,
  INOUT p_thn_awal_kls_tanah TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_rec RECORD;
  v_nilai_bumi BIGINT;
  v_njop_per_m2 BIGINT;
BEGIN
  p_total_luas_bumi := 0;
  p_total_nilai_bumi := 0;

  -- Loop through all land components
  FOR v_rec IN
    SELECT no_bumi, kd_znt, luas_bumi
    FROM dat_op_bumi
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
  LOOP
    v_nilai_bumi := 0;
    CALL penilaian_bumi(
      p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
      p_kd_blok, p_no_urut, p_kd_jns_op, v_rec.no_bumi,
      v_rec.kd_znt, v_rec.luas_bumi, p_tahun, 1, v_nilai_bumi
    );

    p_total_luas_bumi := p_total_luas_bumi + v_rec.luas_bumi;
    p_total_nilai_bumi := p_total_nilai_bumi + v_nilai_bumi;
  END LOOP;

  -- Calculate NJOP per m2 and determine class
  IF p_total_luas_bumi > 0 THEN
    p_njop_bumi_per_m2 := ROUND(p_total_nilai_bumi::DECIMAL / p_total_luas_bumi);
  ELSE
    p_njop_bumi_per_m2 := 0;
  END IF;

  -- Determine land class
  v_njop_per_m2 := 0;
  CALL penentuan_kelas(1, p_tahun, p_njop_bumi_per_m2, p_kd_kls_tanah, p_thn_awal_kls_tanah, v_njop_per_m2);

  -- Recalculate NJOP based on class
  p_total_nilai_bumi := p_total_luas_bumi * v_njop_per_m2;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. PENENTUAN_NJOP_BNG - Calculate total building NJOP for a property
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penentuan_njop_bng(
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  IN p_tahun CHAR(4),
  INOUT p_total_luas_bng BIGINT,
  INOUT p_total_nilai_bng BIGINT,
  INOUT p_njop_bng_per_m2 BIGINT,
  INOUT p_kd_kls_bng TEXT,
  INOUT p_thn_awal_kls_bng TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_rec RECORD;
  v_nilai_bng BIGINT;
  v_njop_per_m2 BIGINT;
BEGIN
  p_total_luas_bng := 0;
  p_total_nilai_bng := 0;

  -- Loop through all building components
  FOR v_rec IN
    SELECT no_bng, luas_bng
    FROM dat_op_bangunan
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
  LOOP
    v_nilai_bng := 0;
    CALL penilaian_bng(
      p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
      p_kd_blok, p_no_urut, p_kd_jns_op, v_rec.no_bng,
      p_tahun, 0, v_nilai_bng
    );

    p_total_luas_bng := p_total_luas_bng + v_rec.luas_bng;
    p_total_nilai_bng := p_total_nilai_bng + v_nilai_bng;
  END LOOP;

  -- Calculate NJOP per m2 and determine class
  IF p_total_luas_bng > 0 THEN
    p_njop_bng_per_m2 := ROUND(p_total_nilai_bng::DECIMAL / p_total_luas_bng);
  ELSE
    p_njop_bng_per_m2 := 0;
  END IF;

  -- Determine building class
  v_njop_per_m2 := 0;
  CALL penentuan_kelas(2, p_tahun, p_njop_bng_per_m2, p_kd_kls_bng, p_thn_awal_kls_bng, v_njop_per_m2);

  -- Recalculate NJOP based on class
  p_total_nilai_bng := p_total_luas_bng * v_njop_per_m2;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. PENETAPAN_MASSAL - Main tax assessment procedure
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE penetapan_massal(
  -- NOP parameters
  IN p_kd_propinsi CHAR(2),
  IN p_kd_dati2 CHAR(2),
  IN p_kd_kecamatan CHAR(3),
  IN p_kd_kelurahan CHAR(3),
  IN p_kd_blok CHAR(3),
  IN p_no_urut CHAR(4),
  IN p_kd_jns_op CHAR(1),
  -- Tax parameters
  IN p_thn_pajak CHAR(4),
  IN p_njoptkp BIGINT,            -- NJOPTKP value (e.g., 12000000)
  IN p_tarif DECIMAL(5,2),        -- Tax rate (e.g., 0.10 for 0.1%)
  -- Bank/payment info
  IN p_kd_kanwil CHAR(2),
  IN p_kd_kppbb CHAR(2),
  IN p_kd_bank_tunggal CHAR(2),
  IN p_kd_bank_persepsi CHAR(2),
  IN p_kd_tp CHAR(2),
  -- Due date
  IN p_tgl_jatuh_tempo TIMESTAMP,
  -- Officer info
  IN p_nip_pencetak CHAR(18)
)
LANGUAGE plpgsql AS $$
DECLARE
  -- Property data
  v_subjek_pajak_id CHAR(30);
  v_nm_wp VARCHAR(30);
  v_jln_wp VARCHAR(30);
  v_blok_kav_no_wp VARCHAR(15);
  v_rw_wp CHAR(2);
  v_rt_wp CHAR(3);
  v_kelurahan_wp VARCHAR(30);
  v_kota_wp VARCHAR(30);
  v_kd_pos_wp VARCHAR(5);
  v_npwp VARCHAR(16);
  v_no_persil VARCHAR(5);
  -- Land values
  v_luas_bumi BIGINT := 0;
  v_njop_bumi BIGINT := 0;
  v_njop_bumi_per_m2 BIGINT := 0;
  v_kd_kls_tanah TEXT := 'XXX';
  v_thn_awal_kls_tanah TEXT := '1986';
  -- Building values
  v_luas_bng BIGINT := 0;
  v_njop_bng BIGINT := 0;
  v_njop_bng_per_m2 BIGINT := 0;
  v_kd_kls_bng TEXT := 'XXX';
  v_thn_awal_kls_bng TEXT := '1986';
  -- Tax calculation
  v_njop_total BIGINT;
  v_njoptkp_applied BIGINT;
  v_njkp DECIMAL(5,2);
  v_pbb_terhutang BIGINT;
  v_pct_pengurangan DECIMAL(5,2);
  v_faktor_pengurang BIGINT;
  v_pbb_yg_harus_dibayar BIGINT;
  v_siklus SMALLINT := 1;
BEGIN
  -- Get taxpayer data
  BEGIN
    SELECT
      o.subjek_pajak_id,
      COALESCE(s.nm_wp, 'PEMILIK'),
      COALESCE(s.jalan_wp, '-'),
      s.blok_kav_no_wp,
      s.rw_wp,
      s.rt_wp,
      s.kelurahan_wp,
      s.kota_wp,
      s.kd_pos_wp,
      s.npwp,
      o.no_persil
    INTO STRICT
      v_subjek_pajak_id,
      v_nm_wp,
      v_jln_wp,
      v_blok_kav_no_wp,
      v_rw_wp,
      v_rt_wp,
      v_kelurahan_wp,
      v_kota_wp,
      v_kd_pos_wp,
      v_npwp,
      v_no_persil
    FROM dat_objek_pajak o
    LEFT JOIN dat_subjek_pajak s ON o.subjek_pajak_id = s.subjek_pajak_id
    WHERE o.kd_propinsi = p_kd_propinsi
      AND o.kd_dati2 = p_kd_dati2
      AND o.kd_kecamatan = p_kd_kecamatan
      AND o.kd_kelurahan = p_kd_kelurahan
      AND o.kd_blok = p_kd_blok
      AND o.no_urut = p_no_urut
      AND o.kd_jns_op = p_kd_jns_op;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'NOP not found: %.%.%.%.%.%.%.%',
        p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
        p_kd_blok, p_no_urut, p_kd_jns_op;
  END;

  -- Calculate land NJOP
  CALL penentuan_njop_bumi(
    p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
    p_kd_blok, p_no_urut, p_kd_jns_op, p_thn_pajak,
    v_luas_bumi, v_njop_bumi, v_njop_bumi_per_m2,
    v_kd_kls_tanah, v_thn_awal_kls_tanah
  );

  -- Calculate building NJOP
  CALL penentuan_njop_bng(
    p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
    p_kd_blok, p_no_urut, p_kd_jns_op, p_thn_pajak,
    v_luas_bng, v_njop_bng, v_njop_bng_per_m2,
    v_kd_kls_bng, v_thn_awal_kls_bng
  );

  -- Calculate total NJOP
  v_njop_total := v_njop_bumi + v_njop_bng;

  -- Apply NJOPTKP (only if NJOP > NJOPTKP)
  IF v_njop_total > p_njoptkp THEN
    v_njoptkp_applied := p_njoptkp;
  ELSE
    v_njoptkp_applied := v_njop_total;
  END IF;

  -- Calculate NJKP (taxable value)
  v_njkp := (v_njop_total - v_njoptkp_applied)::DECIMAL / v_njop_total * 100;
  IF v_njkp < 0 THEN v_njkp := 0; END IF;

  -- Calculate PBB Terhutang
  v_pbb_terhutang := ROUND((v_njop_total - v_njoptkp_applied) * p_tarif / 100);
  IF v_pbb_terhutang < 0 THEN v_pbb_terhutang := 0; END IF;

  -- Get reduction percentage
  v_pct_pengurangan := get_pengurangan(
    p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
    p_kd_blok, p_no_urut, p_kd_jns_op, p_thn_pajak
  );

  -- Calculate reduction amount
  v_faktor_pengurang := ROUND(v_pbb_terhutang * v_pct_pengurangan / 100);

  -- Calculate final PBB
  v_pbb_yg_harus_dibayar := v_pbb_terhutang - v_faktor_pengurang;
  IF v_pbb_yg_harus_dibayar < 0 THEN v_pbb_yg_harus_dibayar := 0; END IF;

  -- Get existing siklus or default to 1
  BEGIN
    SELECT COALESCE(MAX(siklus_sppt), 0) + 1
    INTO v_siklus
    FROM sppt
    WHERE kd_propinsi = p_kd_propinsi
      AND kd_dati2 = p_kd_dati2
      AND kd_kecamatan = p_kd_kecamatan
      AND kd_kelurahan = p_kd_kelurahan
      AND kd_blok = p_kd_blok
      AND no_urut = p_no_urut
      AND kd_jns_op = p_kd_jns_op
      AND thn_pajak_sppt = p_thn_pajak;
  EXCEPTION
    WHEN OTHERS THEN v_siklus := 1;
  END;

  -- Insert or update SPPT
  INSERT INTO sppt (
    kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan,
    kd_blok, no_urut, kd_jns_op, thn_pajak_sppt,
    siklus_sppt,
    kd_kanwil_bank, kd_kppbb_bank, kd_bank_tunggal, kd_bank_persepsi, kd_tp,
    nm_wp_sppt, jln_wp_sppt, blok_kav_no_wp_sppt,
    rw_wp_sppt, rt_wp_sppt, kelurahan_wp_sppt, kota_wp_sppt,
    kd_pos_wp_sppt, npwp_sppt, no_persil_sppt,
    kd_kls_tanah, thn_awal_kls_tanah, kd_kls_bng, thn_awal_kls_bng,
    tgl_jatuh_tempo_sppt,
    luas_bumi_sppt, luas_bng_sppt,
    njop_bumi_sppt, njop_bng_sppt, njop_sppt,
    njoptkp_sppt, njkp_sppt,
    pbb_terhutang_sppt, faktor_pengurang_sppt, pbb_yg_harus_dibayar_sppt,
    status_pembayaran_sppt, status_tagihan_sppt, status_cetak_sppt,
    tgl_terbit_sppt, tgl_cetak_sppt, nip_pencetak_sppt
  ) VALUES (
    p_kd_propinsi, p_kd_dati2, p_kd_kecamatan, p_kd_kelurahan,
    p_kd_blok, p_no_urut, p_kd_jns_op, p_thn_pajak,
    v_siklus,
    p_kd_kanwil, p_kd_kppbb, p_kd_bank_tunggal, p_kd_bank_persepsi, p_kd_tp,
    v_nm_wp, v_jln_wp, v_blok_kav_no_wp,
    v_rw_wp, v_rt_wp, v_kelurahan_wp, v_kota_wp,
    v_kd_pos_wp, v_npwp, v_no_persil,
    v_kd_kls_tanah, v_thn_awal_kls_tanah, v_kd_kls_bng, v_thn_awal_kls_bng,
    p_tgl_jatuh_tempo,
    v_luas_bumi, v_luas_bng,
    v_njop_bumi, v_njop_bng, v_njop_total,
    v_njoptkp_applied, v_njkp,
    v_pbb_terhutang, v_faktor_pengurang, v_pbb_yg_harus_dibayar,
    '0', '0', '0',
    NOW(), NOW(), p_nip_pencetak
  )
  ON CONFLICT (kd_propinsi, kd_dati2, kd_kecamatan, kd_kelurahan,
               kd_blok, no_urut, kd_jns_op, thn_pajak_sppt)
  DO UPDATE SET
    siklus_sppt = v_siklus,
    kd_kanwil_bank = p_kd_kanwil,
    kd_kppbb_bank = p_kd_kppbb,
    kd_bank_tunggal = p_kd_bank_tunggal,
    kd_bank_persepsi = p_kd_bank_persepsi,
    kd_tp = p_kd_tp,
    nm_wp_sppt = v_nm_wp,
    jln_wp_sppt = v_jln_wp,
    blok_kav_no_wp_sppt = v_blok_kav_no_wp,
    rw_wp_sppt = v_rw_wp,
    rt_wp_sppt = v_rt_wp,
    kelurahan_wp_sppt = v_kelurahan_wp,
    kota_wp_sppt = v_kota_wp,
    kd_pos_wp_sppt = v_kd_pos_wp,
    npwp_sppt = v_npwp,
    no_persil_sppt = v_no_persil,
    kd_kls_tanah = v_kd_kls_tanah,
    thn_awal_kls_tanah = v_thn_awal_kls_tanah,
    kd_kls_bng = v_kd_kls_bng,
    thn_awal_kls_bng = v_thn_awal_kls_bng,
    tgl_jatuh_tempo_sppt = p_tgl_jatuh_tempo,
    luas_bumi_sppt = v_luas_bumi,
    luas_bng_sppt = v_luas_bng,
    njop_bumi_sppt = v_njop_bumi,
    njop_bng_sppt = v_njop_bng,
    njop_sppt = v_njop_total,
    njoptkp_sppt = v_njoptkp_applied,
    njkp_sppt = v_njkp,
    pbb_terhutang_sppt = v_pbb_terhutang,
    faktor_pengurang_sppt = v_faktor_pengurang,
    pbb_yg_harus_dibayar_sppt = v_pbb_yg_harus_dibayar,
    tgl_terbit_sppt = NOW(),
    tgl_cetak_sppt = NOW(),
    nip_pencetak_sppt = p_nip_pencetak;

  -- Update dat_objek_pajak with calculated values
  UPDATE dat_objek_pajak
  SET total_luas_bumi = v_luas_bumi,
      total_luas_bng = v_luas_bng,
      njop_bumi = v_njop_bumi,
      njop_bng = v_njop_bng
  WHERE kd_propinsi = p_kd_propinsi
    AND kd_dati2 = p_kd_dati2
    AND kd_kecamatan = p_kd_kecamatan
    AND kd_kelurahan = p_kd_kelurahan
    AND kd_blok = p_kd_blok
    AND no_urut = p_no_urut
    AND kd_jns_op = p_kd_jns_op;

  COMMIT;
END;
$$;

-- ============================================================================
-- JPB VALUATION PROCEDURES (JPB2 - JPB16)
-- ============================================================================

-- Helper procedures for JPB valuation

-- ------------------------------------------------------------------------------
-- FASILITAS_SUSUT - Calculate facility value with depreciation
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE fasilitas_susut(
  IN vlc_kd_propinsi CHARACTER,
  IN vlc_kd_dati2 CHARACTER,
  IN vlc_kd_kecamatan CHARACTER,
  IN vlc_kd_kelurahan CHARACTER,
  IN vlc_kd_blok CHARACTER,
  IN vlc_no_urut CHARACTER,
  IN vlc_kd_jns_op CHARACTER,
  IN vln_no_bng SMALLINT,
  IN vln_jml_lantai_bng SMALLINT,
  IN vlc_tahun TEXT,
  INOUT vln_nilai_fasilitas BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $procedure$
DECLARE
  vln_jml_satuan       dat_fasilitas_bangunan.jml_satuan%type := 0;
  vlc_kd_fasilitas     fasilitas.kd_fasilitas%type;
  vlc_ketergantungan   fasilitas.ketergantungan%type;
  vln_nilai_satuan     fas_non_dep.nilai_non_dep%type := 0;

  cur_biaya_fasilitas CURSOR FOR
     SELECT kd_fasilitas, ketergantungan
     FROM   fasilitas
     WHERE  status_fasilitas = '4';

BEGIN
  vln_nilai_fasilitas := 0;
  OPEN cur_biaya_fasilitas;
  LOOP
    FETCH cur_biaya_fasilitas INTO vlc_kd_fasilitas, vlc_ketergantungan;
    EXIT WHEN NOT FOUND;

    BEGIN
      SELECT coalesce(jml_satuan, 0) INTO STRICT vln_jml_satuan
      FROM   dat_fasilitas_bangunan
      WHERE  kd_propinsi  = vlc_kd_propinsi
        AND kd_dati2     = vlc_kd_dati2
        AND kd_kecamatan = vlc_kd_kecamatan
        AND kd_kelurahan = vlc_kd_kelurahan
        AND kd_blok      = vlc_kd_blok
        AND no_urut      = vlc_no_urut
        AND kd_jns_op    = vlc_kd_jns_op
        AND no_bng       = vln_no_bng
        AND kd_fasilitas = vlc_kd_fasilitas;
    EXCEPTION
      WHEN no_data_found THEN vln_jml_satuan := 0;
    END;

    IF vlc_ketergantungan = '0' THEN
      BEGIN
        SELECT coalesce(nilai_non_dep, 0) INTO STRICT vln_nilai_satuan
        FROM   fas_non_dep
        WHERE  kd_propinsi  = vlc_kd_propinsi
          AND kd_dati2     = vlc_kd_dati2
          AND thn_non_dep  = vlc_tahun
          AND kd_fasilitas = vlc_kd_fasilitas;
      EXCEPTION
        WHEN no_data_found THEN vln_nilai_satuan := 0;
      END;
    ELSIF vlc_ketergantungan = '1' THEN
      BEGIN
        IF vlc_kd_fasilitas IN ('30','31','32') THEN
          BEGIN
            SELECT coalesce(nilai_dep_min_max, 0) INTO STRICT vln_nilai_satuan
            FROM   fas_dep_min_max
            WHERE  kd_propinsi     = vlc_kd_propinsi
              AND kd_dati2        = vlc_kd_dati2
              AND thn_dep_min_max = vlc_tahun
              AND kd_fasilitas    = vlc_kd_fasilitas
              AND kls_dep_min    <= coalesce(vln_jml_lantai_bng,0)
              AND kls_dep_max    >= coalesce(vln_jml_lantai_bng,0);
          EXCEPTION
            WHEN no_data_found THEN vln_nilai_satuan := 0;
          END;
        ELSE
          BEGIN
            SELECT coalesce(nilai_dep_min_max, 0) INTO STRICT vln_nilai_satuan
            FROM   fas_dep_min_max
            WHERE  kd_propinsi     = vlc_kd_propinsi
              AND kd_dati2        = vlc_kd_dati2
              AND thn_dep_min_max = vlc_tahun
              AND kd_fasilitas    = vlc_kd_fasilitas
              AND kls_dep_min    <= vln_jml_satuan
              AND kls_dep_max    >= vln_jml_satuan;
          EXCEPTION
            WHEN no_data_found THEN vln_nilai_satuan := 0;
          END;
        END IF;
      END;
    ELSE vln_nilai_satuan := 0;
    END IF;

    vln_nilai_fasilitas := vln_nilai_fasilitas + (vln_nilai_satuan * vln_jml_satuan);
  END LOOP;
  CLOSE cur_biaya_fasilitas;
END;
$$;

-- ------------------------------------------------------------------------------
-- FASILITAS_SUSUT_X_LUAS - Calculate facility value multiplied by area
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE fasilitas_susut_x_luas(
  IN vlc_kd_prop CHARACTER,
  IN vlc_kd_dati2 CHARACTER,
  IN vlc_kd_kec CHARACTER,
  IN vlc_kd_kel CHARACTER,
  IN vlc_kd_blok CHARACTER,
  IN vlc_no_urut CHARACTER,
  IN vlc_kd_jns_op CHARACTER,
  IN vlc_no_bng SMALLINT,
  IN vlc_kd_jpb CHARACTER,
  IN vlc_kls_bintang CHARACTER,
  IN vlc_tahun CHARACTER,
  INOUT vln_fasilitas BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $procedure$
DECLARE
  vlc_kd_fasilitas    dat_fasilitas_bangunan.kd_fasilitas%type;
  vln_jml_satuan      dat_fasilitas_bangunan.jml_satuan%type;
  vlc_kd_status       fasilitas.status_fasilitas%type;
  vlc_ketergantungan  fasilitas.ketergantungan%type;
  vln_nilai           fas_non_dep.nilai_non_dep%type;
  vln_nilai_fas    dat_op_bangunan.nilai_sistem_bng%type;

  c_fas1 CURSOR FOR
    SELECT a.kd_fasilitas     kd_fasilitas,
           a.jml_satuan      jml_satuan,
           b.status_fasilitas status_fasilitas,
           b.ketergantungan ketergantungan
    from      dat_fasilitas_bangunan a,
           fasilitas b
    where     a.kd_propinsi   = vlc_kd_prop
      AND a.kd_dati2      = vlc_kd_dati2
      AND a.kd_kecamatan   = vlc_kd_kec
      AND a.kd_kelurahan   = vlc_kd_kel
      AND a.kd_blok       = vlc_kd_blok
      AND a.no_urut       = vlc_no_urut
      AND a.kd_jns_op     = vlc_kd_jns_op
      AND a.no_bng        = vlc_no_bng
      AND b.kd_fasilitas  = a.kd_fasilitas
      AND b.status_fasilitas  = '0';

BEGIN
  vln_nilai_fas := 0;
  FOR rec_c_fas1 in c_fas1 LOOP
    IF rec_c_fas1.ketergantungan = '0' THEN
      BEGIN
        SELECT nilai_non_dep
        INTO STRICT    vln_nilai
        FROM   fas_non_dep
        WHERE  kd_propinsi  = vlc_kd_prop
          AND kd_dati2    = vlc_kd_dati2
          AND thn_non_dep  = vlc_tahun
          AND kd_fasilitas = rec_c_fas1.kd_fasilitas;

        vln_nilai_fas := vln_nilai_fas + (vln_nilai * rec_c_fas1.jml_satuan);
      EXCEPTION
        WHEN no_data_found THEN
          vln_nilai_fas := vln_nilai_fas;
      END;
    ELSIF rec_c_fas1.ketergantungan = '1' THEN
      BEGIN
        SELECT nilai_dep_min_max
        INTO STRICT    vln_nilai
        FROM   fas_dep_min_max
        WHERE  kd_propinsi     = vlc_kd_prop
          AND kd_dati2        = vlc_kd_dati2
          AND thn_dep_min_max = vlc_tahun
          AND kd_fasilitas    = rec_c_fas1.kd_fasilitas
          AND kls_dep_min    <= rec_c_fas1.jml_satuan
          AND kls_dep_max    >= rec_c_fas1.jml_satuan;

        vln_nilai_fas := vln_nilai_fas + (vln_nilai * rec_c_fas1.jml_satuan);
      EXCEPTION
        WHEN no_data_found THEN
          vln_nilai_fas := vln_nilai_fas;
      END;
    ELSIF rec_c_fas1.ketergantungan = '2' THEN
      BEGIN
        SELECT nilai_fasilitas_kls_bintang
        INTO STRICT    vln_nilai
        FROM   fas_dep_jpb_kls_bintang
        WHERE  kd_propinsi             = vlc_kd_prop
          AND kd_dati2                = vlc_kd_dati2
          AND thn_dep_jpb_kls_bintang = vlc_tahun
          AND kd_fasilitas            = rec_c_fas1.kd_fasilitas
          AND kd_jpb                  = vlc_kd_jpb
          AND kls_bintang             = vlc_kls_bintang;

        vln_nilai_fas := vln_nilai_fas + (vln_nilai * rec_c_fas1.jml_satuan);
      EXCEPTION
        WHEN no_data_found THEN
          vln_nilai_fas := vln_nilai_fas;
      END;
    END IF;
  END LOOP;

  vln_fasilitas := vln_nilai_fas;
END;
$$;

-- ------------------------------------------------------------------------------
-- FASILITAS_TDK_SUSUT - Calculate facility value without depreciation
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE fasilitas_tdk_susut(
  IN vlc_kd_propinsi CHARACTER,
  IN vlc_kd_dati2 CHARACTER,
  IN vlc_kd_kecamatan CHARACTER,
  IN vlc_kd_kelurahan CHARACTER,
  IN vlc_kd_blok CHARACTER,
  IN vlc_no_urut CHARACTER,
  IN vlc_kd_jns_op CHARACTER,
  IN vln_no_bng SMALLINT,
  IN vlc_tahun TEXT,
  INOUT vln_nilai_fasilitas BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $procedure$
DECLARE
  vln_jml_satuan       dat_fasilitas_bangunan.jml_satuan%type := 0;
  vlc_kd_fasilitas     fasilitas.kd_fasilitas%type;
  vlc_ketergantungan   fasilitas.ketergantungan%type;
  vln_nilai_satuan     fas_non_dep.nilai_non_dep%type := 0;

  cur_fas_tdk_susut CURSOR FOR
    SELECT kd_fasilitas, ketergantungan
    FROM   fasilitas
    WHERE  status_fasilitas = '5';

BEGIN
  vln_nilai_fasilitas := 0;

  OPEN cur_fas_tdk_susut;
  LOOP
    FETCH cur_fas_tdk_susut INTO vlc_kd_fasilitas, vlc_ketergantungan;
    EXIT WHEN NOT FOUND;

    BEGIN
      SELECT coalesce(nilai_non_dep, 0) INTO STRICT vln_nilai_satuan
      FROM   fas_non_dep
      WHERE  kd_propinsi  = vlc_kd_propinsi
        AND kd_dati2     = vlc_kd_dati2
        AND thn_non_dep  = vlc_tahun
        AND kd_fasilitas = vlc_kd_fasilitas;
    EXCEPTION
      WHEN no_data_found THEN vln_nilai_satuan := 0;
    END;

    BEGIN
      SELECT coalesce(jml_satuan, 0) INTO STRICT vln_jml_satuan
      FROM   dat_fasilitas_bangunan
      WHERE  kd_propinsi  = vlc_kd_propinsi
        AND kd_dati2     = vlc_kd_dati2
        AND kd_kecamatan = vlc_kd_kecamatan
        AND kd_kelurahan = vlc_kd_kelurahan
        AND kd_blok      = vlc_kd_blok
        AND no_urut      = vlc_no_urut
        AND kd_jns_op    = vlc_kd_jns_op
        AND no_bng       = vln_no_bng
        AND kd_fasilitas = vlc_kd_fasilitas;
    EXCEPTION
      WHEN no_data_found THEN vln_jml_satuan := 0;
    END;

    -- jika kode fasilitas = '44' [listrik] maka biaya fasilitas listrik / 1000
    IF vlc_kd_fasilitas = '44' THEN
      vln_nilai_fasilitas := vln_nilai_fasilitas + ((vln_nilai_satuan * vln_jml_satuan)/1000);
    ELSE
      vln_nilai_fasilitas := vln_nilai_fasilitas + (vln_nilai_satuan * vln_jml_satuan);
    END IF;

  END LOOP;
  CLOSE cur_fas_tdk_susut;
END;
$$;

-- ============================================================================
-- END OF PBB PROCEDURES
-- ============================================================================
