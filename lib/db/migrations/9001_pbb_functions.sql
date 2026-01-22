-- ============================================================================
-- PBB FUNCTIONS - Consolidated Functions for PBB Tax Assessment
-- Migration: 9001
-- Generated: 2026-01-01
-- Source: Consolidated from 0002_penetapan_massal_procedures.sql and
--          0003_jpb_valuation_procedures.sql
-- ============================================================================

-- ------------------------------------------------------------------------------
-- 1. GET_PENGURANGAN - Get total reduction percentage for a property
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_pengurangan(
  p_kd_propinsi CHAR(2),
  p_kd_dati2 CHAR(2),
  p_kd_kecamatan CHAR(3),
  p_kd_kelurahan CHAR(3),
  p_kd_blok CHAR(3),
  p_no_urut CHAR(4),
  p_kd_jns_op CHAR(1),
  p_thn_pajak CHAR(4)
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_pct_pst DECIMAL(5,2) := 0;
  v_pct_permanen DECIMAL(5,2) := 0;
  v_pct_jpb DECIMAL(5,2) := 0;
BEGIN
  -- Get PST reduction
  BEGIN
    SELECT COALESCE(MAX(pct_pengurangan_pst), 0)
    INTO v_pct_pst
    FROM pengurangan_pst
    WHERE kd_propinsi_pemohon = p_kd_propinsi
      AND kd_dati2_pemohon = p_kd_dati2
      AND kd_kecamatan_pemohon = p_kd_kecamatan
      AND kd_kelurahan_pemohon = p_kd_kelurahan
      AND kd_blok_pemohon = p_kd_blok
      AND no_urut_pemohon = p_no_urut
      AND kd_jns_op_pemohon = p_kd_jns_op
      AND thn_peng_pst = p_thn_pajak
      AND status_sk_peng_pst = '1';
  EXCEPTION
    WHEN OTHERS THEN v_pct_pst := 0;
  END;

  -- Get permanent reduction
  BEGIN
    SELECT COALESCE(MAX(pct_pengurangan_permanen), 0)
    INTO v_pct_permanen
    FROM pengurangan_permanen
    WHERE kd_propinsi_pemohon = p_kd_propinsi
      AND kd_dati2_pemohon = p_kd_dati2
      AND kd_kecamatan_pemohon = p_kd_kecamatan
      AND kd_kelurahan_pemohon = p_kd_kelurahan
      AND kd_blok_pemohon = p_kd_blok
      AND no_urut_pemohon = p_no_urut
      AND kd_jns_op_pemohon = p_kd_jns_op
      AND thn_peng_permanen_awal <= p_thn_pajak
      AND thn_peng_permanen_akhir >= p_thn_pajak
      AND status_sk_peng_permanen = '1';
  EXCEPTION
    WHEN OTHERS THEN v_pct_permanen := 0;
  END;

  -- Get JPB reduction
  BEGIN
    SELECT COALESCE(MAX(pct_pengurangan_jpb), 0)
    INTO v_pct_jpb
    FROM pengurangan_pengenaan_jpb
    WHERE kd_propinsi_pemohon = p_kd_propinsi
      AND kd_dati2_pemohon = p_kd_dati2
      AND kd_kecamatan_pemohon = p_kd_kecamatan
      AND kd_kelurahan_pemohon = p_kd_kelurahan
      AND kd_blok_pemohon = p_kd_blok
      AND no_urut_pemohon = p_no_urut
      AND kd_jns_op_pemohon = p_kd_jns_op
      AND thn_pengenaan_jpb = p_thn_pajak;
  EXCEPTION
    WHEN OTHERS THEN v_pct_jpb := 0;
  END;

  -- Return highest reduction (they don't stack)
  RETURN GREATEST(v_pct_pst, v_pct_permanen, v_pct_jpb);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- JPB VALUATION HELPER FUNCTIONS
-- ============================================================================

-- ------------------------------------------------------------------------------
-- SUSUT - Calculate depreciation percentage for buildings
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION susut(
  vlc_tahun TEXT,
  vlc_tahun_dibangun TEXT,
  vlc_tahun_renovasi TEXT,
  vlc_kondisi_bng TEXT,
  vln_nilai BIGINT,
  vln_luas_bng BIGINT,
  vln_flag_standard BIGINT
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
 -- 1 = bangunan standar, 0 = non standar
DECLARE
  VLN_LUAS_BANGUNAN         bigint;
  vln_umur_efektif          smallint;
  vln_biaya_pengganti_baru bigint;
  vln_persentase_susut      smallint;
  vln_tahun                  smallint := coalesce((vlc_tahun)::numeric , 0);
  vln_tahun_dibangun        smallint := coalesce((vlc_tahun_dibangun)::numeric , 0);
  vln_tahun_renovasi        smallint := coalesce((vlc_tahun_renovasi)::numeric , 0);
  vlc_kd_range_penyusutan   range_penyusutan.kd_range_penyusutan%type;

/*-----------------------------
 DIBUAT OLEH : MADE
 TANGGAL     :
 REVISI KE   : 2
 DIREVISI    : TEGUH, RAHMAT, RUSLAN
 TGL. REVISI : 19-10-2000
*/
-----------------------------
BEGIN
  ------------------------------------------------------------
  --- mencari umur efektif
  ------------------------------------------------------------
  IF vln_flag_standard = 0 THEN
    ------------------------------------------------------------
    -- jika bangunan non standar
    ------------------------------------------------------------
    IF vln_tahun_dibangun > 0 THEN
       ------------------------------------------------------------
       -- jika tahun dibangun ada
       ------------------------------------------------------------
       IF vln_tahun_renovasi > 0 THEN
          ------------------------------------------------------------
          -- jika tahun renovasi ada
          ------------------------------------------------------------
          IF (vln_tahun - vln_tahun_renovasi) > 10 THEN
             ------------------------------------------------------------
             -- (jika tahun pajak - tahun renovasi) > 10
             ------------------------------------------------------------
             vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) + (2*10)) / 3);
          ELSE
             ------------------------------------------------------------
             -- (jika tahun pajak - tahun renovasi) <= 10
             ------------------------------------------------------------
             vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) +
                                  (2*(vln_tahun - vln_tahun_renovasi))) / 3);
          END IF;
       ELSE
          ------------------------------------------------------------
          -- tahun renovasi kosong
          ------------------------------------------------------------
          IF (vln_tahun - vln_tahun_dibangun) > 10 THEN
             vln_umur_efektif := ROUND(((vln_tahun - vln_tahun_dibangun) + (2*10)) / 3);
          ELSE
             vln_umur_efektif := vln_tahun - vln_tahun_dibangun;
          END IF;
       END IF;

    ELSE
       RETURN 0;
    END IF;
  ELSE
    ------------------------------------------------------------
    -- jika bangunan standar
    ------------------------------------------------------------
    IF vln_tahun_renovasi > 0 THEN
       vln_umur_efektif := vln_tahun - vln_tahun_renovasi;
    ELSE
       vln_umur_efektif := vln_tahun - vln_tahun_dibangun;
    END IF;
  END IF;

  IF vln_umur_efektif > 40 THEN
     vln_umur_efektif := 40;
  END IF;

    ------------------------------------------------------------
  --- mencari biaya pengganti baru / m2
    ------------------------------------------------------------
  IF vln_luas_bng = 0 THEN
     VLN_LUAS_BANGUNAN := 1;
  ELSE
     VLN_LUAS_BANGUNAN := vln_luas_bng;
  END IF;

  vln_biaya_pengganti_baru := (coalesce(vln_nilai,0) * 1000) / VLN_LUAS_BANGUNAN;

    ------------------------------------------------------------
  --- mencari kode range penyusutan
    ------------------------------------------------------------
  BEGIN
    SELECT kd_range_penyusutan
    INTO STRICT   vlc_kd_range_penyusutan
    FROM   range_penyusutan
    WHERE  nilai_min_penyusutan <  vln_biaya_pengganti_baru AND
           nilai_max_penyusutan >= vln_biaya_pengganti_baru;
  EXCEPTION
    WHEN OTHERS THEN RETURN 0;
  END;

    ------------------------------------------------------------
  --- mencari prosentase penyusutan
    ------------------------------------------------------------
  BEGIN
   SELECT coalesce(nilai_penyusutan, 0)
   INTO STRICT    vln_persentase_susut
   FROM   penyusutan
   WHERE  umur_efektif        = vln_umur_efektif        AND
          kd_range_penyusutan = vlc_kd_range_penyusutan AND
          kondisi_bng_susut   = vlc_kondisi_bng;
  EXCEPTION
    WHEN OTHERS THEN RETURN 0;
  END;

  RETURN vln_persentase_susut;
END;
$$;

-- ============================================================================
-- END OF PBB FUNCTIONS
-- ============================================================================
