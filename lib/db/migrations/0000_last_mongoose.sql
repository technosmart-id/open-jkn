CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_persepsi" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"kd_bank_tunggal" char(2) NOT NULL,
	"kd_bank_persepsi" char(2) NOT NULL,
	"nm_bank_persepsi" varchar(30) NOT NULL,
	"al_bank_persepsi" varchar(50) NOT NULL,
	"no_rek_bank_persepsi" varchar(15),
	CONSTRAINT "bank_persepsi_kd_kanwil_kd_kppbb_kd_bank_tunggal_kd_bank_persepsi_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","kd_bank_tunggal","kd_bank_persepsi")
);
--> statement-breakpoint
CREATE TABLE "bank_tunggal" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"kd_bank_tunggal" char(2) NOT NULL,
	"nm_bank_tunggal" varchar(30) NOT NULL,
	"al_bank_tunggal" varchar(50) NOT NULL,
	"no_rek_bank_tunggal" varchar(15),
	CONSTRAINT "bank_tunggal_kd_kanwil_kd_kppbb_kd_bank_tunggal_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","kd_bank_tunggal")
);
--> statement-breakpoint
CREATE TABLE "dat_fasilitas_bangunan" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kd_fasilitas" char(2) NOT NULL,
	"jml_satuan" bigint NOT NULL,
	CONSTRAINT "dat_fasilitas_bangunan_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_kd_fasilitas_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng","kd_fasilitas")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb12" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"type_jpb12" char(1) NOT NULL,
	CONSTRAINT "dat_jpb12_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb13" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kls_jpb13" char(1) NOT NULL,
	"jml_jpb13" smallint,
	"luas_jpb13_dgn_ac_sent" bigint,
	"luas_jpb13_lain_dgn_ac_sent" bigint,
	CONSTRAINT "dat_jpb13_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb14" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"luas_kanopi_jpb14" bigint NOT NULL,
	CONSTRAINT "dat_jpb14_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb15" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"letak_tangki_jpb15" char(1) NOT NULL,
	"kapasitas_tangki_jpb15" bigint NOT NULL,
	CONSTRAINT "dat_jpb15_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb16" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kls_jpb16" char(1) NOT NULL,
	CONSTRAINT "dat_jpb16_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb2" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kls_jpb2" char(1) NOT NULL,
	CONSTRAINT "dat_jpb2_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb3" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"type_konstruksi" char(1) NOT NULL,
	"ting_kolom_jpb3" smallint NOT NULL,
	"lbr_bent_jpb3" smallint NOT NULL,
	"luas_mezzanine_jpb3" smallint,
	"keliling_dinding_jpb3" smallint,
	"daya_dukung_lantai_jpb3" bigint NOT NULL,
	CONSTRAINT "dat_jpb3_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb4" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kls_jpb4" char(1) NOT NULL,
	CONSTRAINT "dat_jpb4_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb5" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kls_jpb5" char(1) NOT NULL,
	"luas_kmr_jpb5_dgn_ac_sent" bigint,
	"luas_rng_lain_jpb5_dgn_ac_sent" bigint,
	CONSTRAINT "dat_jpb5_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb6" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kls_jpb6" char(1) NOT NULL,
	CONSTRAINT "dat_jpb6_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb7" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"jns_jpb7" char(1) NOT NULL,
	"bintang_jpb7" char(1) NOT NULL,
	"jml_kmr_jpb7" smallint NOT NULL,
	"luas_kmr_jpb7_dgn_ac_sent" bigint,
	"luas_kmr_lain_jpb7_dgn_ac_sent" bigint,
	CONSTRAINT "dat_jpb7_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb8" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"type_konstruksi" char(1) NOT NULL,
	"ting_kolom_jpb8" smallint NOT NULL,
	"lbr_bent_jpb8" smallint NOT NULL,
	"luas_mezzanine_jpb8" smallint,
	"keliling_dinding_jpb8" smallint,
	"daya_dukung_lantai_jpb8" bigint NOT NULL,
	CONSTRAINT "dat_jpb8_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_jpb9" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kls_jpb9" char(1) NOT NULL,
	CONSTRAINT "dat_jpb9_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_nilai_individu" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"no_formulir_individu" char(11) NOT NULL,
	"nilai_individu" bigint NOT NULL,
	"tgl_penilaian_individu" timestamp (0) NOT NULL,
	"nip_penilai_individu" char(18) NOT NULL,
	"tgl_pemeriksaan_individu" timestamp (0) NOT NULL,
	"nip_pemeriksa_individu" char(18) NOT NULL,
	"tgl_rekam_nilai_individu" timestamp (0) DEFAULT now() NOT NULL,
	"nip_perekam_individu" char(18) NOT NULL,
	CONSTRAINT "dat_nilai_individu_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_nir" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_znt" char(2) NOT NULL,
	"thn_nir_znt" char(4) NOT NULL,
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"jns_dokumen" char(1) NOT NULL,
	"no_dokumen" char(11) NOT NULL,
	"nir" numeric(12, 2) NOT NULL,
	CONSTRAINT "dat_nir_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_znt_thn_nir_znt_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_znt","thn_nir_znt")
);
--> statement-breakpoint
CREATE TABLE "dat_objek_pajak" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"subjek_pajak_id" char(30) NOT NULL,
	"no_formulir_spop" char(11) NOT NULL,
	"no_persil" varchar(5),
	"jalan_op" varchar(30) NOT NULL,
	"blok_kav_no_op" varchar(15),
	"rw_op" char(2),
	"rt_op" char(3),
	"kd_status_cabang" smallint DEFAULT 1 NOT NULL,
	"kd_status_wp" char(1) DEFAULT '1' NOT NULL,
	"total_luas_bumi" bigint DEFAULT 0 NOT NULL,
	"total_luas_bng" bigint DEFAULT 0 NOT NULL,
	"njop_bumi" bigint DEFAULT 0 NOT NULL,
	"njop_bng" bigint DEFAULT 0 NOT NULL,
	"status_peta_op" smallint DEFAULT 0 NOT NULL,
	"jns_transaksi_op" char(1) DEFAULT '1' NOT NULL,
	"tgl_pendataan_op" timestamp (0) NOT NULL,
	"nip_pendata" char(18) NOT NULL,
	"tgl_pemeriksaan_op" timestamp (0) NOT NULL,
	"nip_pemeriksa_op" char(18) NOT NULL,
	"tgl_perekaman_op" timestamp (0) DEFAULT now() NOT NULL,
	"nip_perekam_op" char(18) NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "dat_objek_pajak_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op")
);
--> statement-breakpoint
CREATE TABLE "dat_op_anggota" (
	"kd_propinsi_induk" char(2) NOT NULL,
	"kd_dati2_induk" char(2) NOT NULL,
	"kd_kecamatan_induk" char(3) NOT NULL,
	"kd_kelurahan_induk" char(3) NOT NULL,
	"kd_blok_induk" char(3) NOT NULL,
	"no_urut_induk" char(4) NOT NULL,
	"kd_jns_op_induk" char(1) NOT NULL,
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"luas_bumi_beban" bigint,
	"luas_bng_beban" bigint,
	"nilai_sistem_bumi_beban" bigint,
	"nilai_sistem_bng_beban" bigint,
	"njop_bumi_beban" bigint,
	"njop_bng_beban" bigint,
	CONSTRAINT "dat_op_anggota_kd_propinsi_induk_kd_dati2_induk_kd_kecamatan_induk_kd_kelurahan_induk_kd_blok_induk_no_urut_induk_kd_jns_op_induk_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_pk" PRIMARY KEY("kd_propinsi_induk","kd_dati2_induk","kd_kecamatan_induk","kd_kelurahan_induk","kd_blok_induk","no_urut_induk","kd_jns_op_induk","kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op")
);
--> statement-breakpoint
CREATE TABLE "dat_op_bangunan" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"kd_jpb" char(2) NOT NULL,
	"no_formulir_lspop" char(11) NOT NULL,
	"thn_dibangun_bng" char(4) NOT NULL,
	"thn_renovasi_bng" char(4),
	"luas_bng" bigint DEFAULT 0 NOT NULL,
	"jml_lantai_bng" smallint DEFAULT 1 NOT NULL,
	"kondisi_bng" char(1) NOT NULL,
	"jns_konstruksi_bng" char(1),
	"jns_atap_bng" char(1),
	"kd_dinding" char(1),
	"kd_lantai" char(1),
	"kd_langit_langit" char(1),
	"nilai_sistem_bng" bigint NOT NULL,
	"jns_transaksi_bng" char(1) DEFAULT '1' NOT NULL,
	"tgl_pendataan_bng" timestamp (0) NOT NULL,
	"nip_pendata_bng" char(18) NOT NULL,
	"tgl_pemeriksaan_bng" timestamp (0) NOT NULL,
	"nip_pemeriksa_bng" char(18) NOT NULL,
	"tgl_perekaman_bng" timestamp (0) DEFAULT now() NOT NULL,
	"nip_perekam_bng" char(18) NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "dat_op_bangunan_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_op_bumi" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bumi" smallint DEFAULT 1 NOT NULL,
	"kd_znt" char(2) NOT NULL,
	"luas_bumi" bigint DEFAULT 0 NOT NULL,
	"jns_bumi" char(1) DEFAULT '1' NOT NULL,
	"nilai_sistem_bumi" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "dat_op_bumi_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bumi_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bumi")
);
--> statement-breakpoint
CREATE TABLE "dat_op_induk" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	CONSTRAINT "dat_op_induk_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op")
);
--> statement-breakpoint
CREATE TABLE "dat_subjek_pajak" (
	"subjek_pajak_id" char(30) PRIMARY KEY NOT NULL,
	"nm_wp" varchar(30) DEFAULT 'PEMILIK' NOT NULL,
	"jalan_wp" varchar(30) NOT NULL,
	"blok_kav_no_wp" varchar(15),
	"rw_wp" char(2),
	"rt_wp" char(3),
	"kelurahan_wp" varchar(30),
	"kota_wp" varchar(30),
	"kd_pos_wp" varchar(5),
	"telp_wp" varchar(20),
	"npwp" varchar(16),
	"status_pekerjaan_wp" char(1) DEFAULT '0' NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "dat_subjek_pajak_njoptkp" (
	"subjek_pajak_id" char(30) PRIMARY KEY NOT NULL,
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"thn_njoptkp" char(4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dat_znt" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_znt" char(2) NOT NULL,
	CONSTRAINT "dat_znt_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_znt_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_znt")
);
--> statement-breakpoint
CREATE TABLE "dbkb_daya_dukung" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_daya_dukung" char(4) NOT NULL,
	"type_konstruksi" char(1) NOT NULL,
	"nilai_dbkb_daya_dukung" bigint NOT NULL,
	CONSTRAINT "dbkb_daya_dukung_kd_propinsi_kd_dati2_thn_dbkb_daya_dukung_type_konstruksi_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_daya_dukung","type_konstruksi")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb12" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb12" char(4) NOT NULL,
	"kls_dbkb_jpb12" char(1) NOT NULL,
	"lantai_min_jpb12" smallint NOT NULL,
	"lantai_max_jpb12" smallint NOT NULL,
	"nilai_dbkb_jpb12" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb12_kd_propinsi_kd_dati2_thn_dbkb_jpb12_kls_dbkb_jpb12_lantai_min_jpb12_lantai_max_jpb12_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb12","kls_dbkb_jpb12","lantai_min_jpb12","lantai_max_jpb12")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb13" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb13" char(4) NOT NULL,
	"kls_dbkb_jpb13" char(1) NOT NULL,
	"lantai_min_jpb13" smallint NOT NULL,
	"lantai_max_jpb13" smallint NOT NULL,
	"nilai_dbkb_jpb13" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb13_kd_propinsi_kd_dati2_thn_dbkb_jpb13_kls_dbkb_jpb13_lantai_min_jpb13_lantai_max_jpb13_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb13","kls_dbkb_jpb13","lantai_min_jpb13","lantai_max_jpb13")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb14" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb14" char(4) NOT NULL,
	"kls_dbkb_jpb14" char(1) NOT NULL,
	"lantai_min_jpb14" smallint NOT NULL,
	"lantai_max_jpb14" smallint NOT NULL,
	"nilai_dbkb_jpb14" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb14_kd_propinsi_kd_dati2_thn_dbkb_jpb14_kls_dbkb_jpb14_lantai_min_jpb14_lantai_max_jpb14_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb14","kls_dbkb_jpb14","lantai_min_jpb14","lantai_max_jpb14")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb15" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb15" char(4) NOT NULL,
	"kls_dbkb_jpb15" char(1) NOT NULL,
	"lantai_min_jpb15" smallint NOT NULL,
	"lantai_max_jpb15" smallint NOT NULL,
	"nilai_dbkb_jpb15" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb15_kd_propinsi_kd_dati2_thn_dbkb_jpb15_kls_dbkb_jpb15_lantai_min_jpb15_lantai_max_jpb15_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb15","kls_dbkb_jpb15","lantai_min_jpb15","lantai_max_jpb15")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb16" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb16" char(4) NOT NULL,
	"kls_dbkb_jpb16" char(1) NOT NULL,
	"lantai_min_jpb16" smallint NOT NULL,
	"lantai_max_jpb16" smallint NOT NULL,
	"nilai_dbkb_jpb16" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb16_kd_propinsi_kd_dati2_thn_dbkb_jpb16_kls_dbkb_jpb16_lantai_min_jpb16_lantai_max_jpb16_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb16","kls_dbkb_jpb16","lantai_min_jpb16","lantai_max_jpb16")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb2" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb2" char(4) NOT NULL,
	"kls_dbkb_jpb2" char(1) NOT NULL,
	"lantai_min_jpb2" smallint NOT NULL,
	"lantai_max_jpb2" smallint NOT NULL,
	"nilai_dbkb_jpb2" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb2_kd_propinsi_kd_dati2_thn_dbkb_jpb2_kls_dbkb_jpb2_lantai_min_jpb2_lantai_max_jpb2_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb2","kls_dbkb_jpb2","lantai_min_jpb2","lantai_max_jpb2")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb3" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb3" char(4) NOT NULL,
	"kls_dbkb_jpb3" char(1) NOT NULL,
	"lantai_min_jpb3" smallint NOT NULL,
	"lantai_max_jpb3" smallint NOT NULL,
	"nilai_dbkb_jpb3" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb3_kd_propinsi_kd_dati2_thn_dbkb_jpb3_kls_dbkb_jpb3_lantai_min_jpb3_lantai_max_jpb3_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb3","kls_dbkb_jpb3","lantai_min_jpb3","lantai_max_jpb3")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb4" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb4" char(4) NOT NULL,
	"kls_dbkb_jpb4" char(1) NOT NULL,
	"lantai_min_jpb4" smallint NOT NULL,
	"lantai_max_jpb4" smallint NOT NULL,
	"nilai_dbkb_jpb4" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb4_kd_propinsi_kd_dati2_thn_dbkb_jpb4_kls_dbkb_jpb4_lantai_min_jpb4_lantai_max_jpb4_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb4","kls_dbkb_jpb4","lantai_min_jpb4","lantai_max_jpb4")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb5" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb5" char(4) NOT NULL,
	"kls_dbkb_jpb5" char(1) NOT NULL,
	"lantai_min_jpb5" smallint NOT NULL,
	"lantai_max_jpb5" smallint NOT NULL,
	"nilai_dbkb_jpb5" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb5_kd_propinsi_kd_dati2_thn_dbkb_jpb5_kls_dbkb_jpb5_lantai_min_jpb5_lantai_max_jpb5_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb5","kls_dbkb_jpb5","lantai_min_jpb5","lantai_max_jpb5")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb6" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb6" char(4) NOT NULL,
	"kls_dbkb_jpb6" char(1) NOT NULL,
	"lantai_min_jpb6" smallint NOT NULL,
	"lantai_max_jpb6" smallint NOT NULL,
	"nilai_dbkb_jpb6" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb6_kd_propinsi_kd_dati2_thn_dbkb_jpb6_kls_dbkb_jpb6_lantai_min_jpb6_lantai_max_jpb6_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb6","kls_dbkb_jpb6","lantai_min_jpb6","lantai_max_jpb6")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb7" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb7" char(4) NOT NULL,
	"kls_dbkb_jpb7" char(1) NOT NULL,
	"lantai_min_jpb7" smallint NOT NULL,
	"lantai_max_jpb7" smallint NOT NULL,
	"nilai_dbkb_jpb7" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb7_kd_propinsi_kd_dati2_thn_dbkb_jpb7_kls_dbkb_jpb7_lantai_min_jpb7_lantai_max_jpb7_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb7","kls_dbkb_jpb7","lantai_min_jpb7","lantai_max_jpb7")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb8" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb8" char(4) NOT NULL,
	"kls_dbkb_jpb8" char(1) NOT NULL,
	"lantai_min_jpb8" smallint NOT NULL,
	"lantai_max_jpb8" smallint NOT NULL,
	"nilai_dbkb_jpb8" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb8_kd_propinsi_kd_dati2_thn_dbkb_jpb8_kls_dbkb_jpb8_lantai_min_jpb8_lantai_max_jpb8_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb8","kls_dbkb_jpb8","lantai_min_jpb8","lantai_max_jpb8")
);
--> statement-breakpoint
CREATE TABLE "dbkb_jpb9" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_jpb9" char(4) NOT NULL,
	"kls_dbkb_jpb9" char(1) NOT NULL,
	"lantai_min_jpb9" smallint NOT NULL,
	"lantai_max_jpb9" smallint NOT NULL,
	"nilai_dbkb_jpb9" bigint NOT NULL,
	CONSTRAINT "dbkb_jpb9_kd_propinsi_kd_dati2_thn_dbkb_jpb9_kls_dbkb_jpb9_lantai_min_jpb9_lantai_max_jpb9_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_jpb9","kls_dbkb_jpb9","lantai_min_jpb9","lantai_max_jpb9")
);
--> statement-breakpoint
CREATE TABLE "dbkb_material" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_material" char(4) NOT NULL,
	"kd_pekerjaan" char(2) NOT NULL,
	"kd_kegiatan" char(2) NOT NULL,
	"nilai_dbkb_material" numeric(12, 2) NOT NULL,
	CONSTRAINT "dbkb_material_kd_propinsi_kd_dati2_thn_dbkb_material_kd_pekerjaan_kd_kegiatan_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_material","kd_pekerjaan","kd_kegiatan")
);
--> statement-breakpoint
CREATE TABLE "dbkb_mezanin" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_mezanin" char(4) NOT NULL,
	"nilai_dbkb_mezanin" bigint NOT NULL,
	CONSTRAINT "dbkb_mezanin_kd_propinsi_kd_dati2_thn_dbkb_mezanin_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_mezanin")
);
--> statement-breakpoint
CREATE TABLE "dbkb_standard" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_dbkb_standard" char(4) NOT NULL,
	"kd_jpb" char(2) NOT NULL,
	"tipe_bng" char(5) NOT NULL,
	"kd_bng_lantai" char(8) NOT NULL,
	"nilai_dbkb_standard" numeric(11, 4) NOT NULL,
	CONSTRAINT "dbkb_standard_kd_propinsi_kd_dati2_thn_dbkb_standard_kd_jpb_tipe_bng_kd_bng_lantai_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_dbkb_standard","kd_jpb","tipe_bng","kd_bng_lantai")
);
--> statement-breakpoint
CREATE TABLE "fas_non_dep" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"thn_non_dep" char(4) NOT NULL,
	"kd_fasilitas" char(2) NOT NULL,
	"nilai_non_dep" numeric(10, 2) NOT NULL,
	CONSTRAINT "fas_non_dep_kd_propinsi_kd_dati2_thn_non_dep_kd_fasilitas_pk" PRIMARY KEY("kd_propinsi","kd_dati2","thn_non_dep","kd_fasilitas")
);
--> statement-breakpoint
CREATE TABLE "fasilitas" (
	"kd_fasilitas" char(2) PRIMARY KEY NOT NULL,
	"nm_fasilitas" varchar(50) NOT NULL,
	"satuan_fasilitas" varchar(10) NOT NULL,
	"status_fasilitas" char(1) NOT NULL,
	"ketergantungan" char(1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kelas_bangunan" (
	"kd_kls_bng" char(3) NOT NULL,
	"thn_awal_kls_bng" char(4) NOT NULL,
	"thn_akhir_kls_bng" char(4) NOT NULL,
	"nilai_min_bng" numeric(8, 2) NOT NULL,
	"nilai_max_bng" numeric(8, 2) NOT NULL,
	"nilai_per_m2_bng" numeric(8, 2) NOT NULL,
	CONSTRAINT "kelas_bangunan_kd_kls_bng_thn_awal_kls_bng_pk" PRIMARY KEY("kd_kls_bng","thn_awal_kls_bng")
);
--> statement-breakpoint
CREATE TABLE "kelas_tanah" (
	"kd_kls_tanah" char(3) NOT NULL,
	"thn_awal_kls_tanah" char(4) NOT NULL,
	"thn_akhir_kls_tanah" char(4) NOT NULL,
	"nilai_min_tanah" numeric(8, 2) NOT NULL,
	"nilai_max_tanah" numeric(8, 2) NOT NULL,
	"nilai_per_m2_tanah" numeric(8, 2) NOT NULL,
	CONSTRAINT "kelas_tanah_kd_kls_tanah_thn_awal_kls_tanah_pk" PRIMARY KEY("kd_kls_tanah","thn_awal_kls_tanah")
);
--> statement-breakpoint
CREATE TABLE "pembayaran_sppt" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"thn_pajak_sppt" char(4) NOT NULL,
	"pembayaran_sppt_ke" smallint NOT NULL,
	"kd_kanwil_bank" char(2) NOT NULL,
	"kd_kppbb_bank" char(2) NOT NULL,
	"kd_bank_tunggal" char(2) NOT NULL,
	"kd_bank_persepsi" char(2) NOT NULL,
	"kd_tp" char(2) NOT NULL,
	"denda_sppt" bigint,
	"jml_sppt_yg_dibayar" bigint NOT NULL,
	"tgl_pembayaran_sppt" timestamp (0) NOT NULL,
	"tgl_rekam_byr_sppt" timestamp (0) DEFAULT now() NOT NULL,
	"nip_rekam_byr_sppt" char(18) NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "pembayaran_sppt_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_thn_pajak_sppt_pembayaran_sppt_ke_kd_kanwil_bank_kd_kppbb_bank_kd_bank_tunggal_kd_bank_persepsi_kd_tp_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","thn_pajak_sppt","pembayaran_sppt_ke","kd_kanwil_bank","kd_kppbb_bank","kd_bank_tunggal","kd_bank_persepsi","kd_tp")
);
--> statement-breakpoint
CREATE TABLE "pengurangan_pengenaan_jpb" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"thn_pengenaan_jpb" char(4) NOT NULL,
	"jns_sk" char(1) NOT NULL,
	"no_sk" char(30) NOT NULL,
	"pct_pengurangan_jpb" numeric(5, 2) NOT NULL,
	CONSTRAINT "pengurangan_pengenaan_jpb_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
CREATE TABLE "pengurangan_permanen" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"thn_peng_permanen_awal" char(4) NOT NULL,
	"thn_peng_permanen_akhir" char(4) DEFAULT '9999' NOT NULL,
	"jns_sk" char(1) NOT NULL,
	"no_sk" char(30) NOT NULL,
	"status_sk_peng_permanen" char(1) NOT NULL,
	"pct_pengurangan_permanen" numeric(5, 2) NOT NULL,
	CONSTRAINT "pengurangan_permanen_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
CREATE TABLE "pengurangan_pst" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"thn_peng_pst" char(4) NOT NULL,
	"jns_sk" char(1) NOT NULL,
	"no_sk" char(30) NOT NULL,
	"status_sk_peng_pst" char(1) NOT NULL,
	"pct_pengurangan_pst" numeric(5, 2) NOT NULL,
	CONSTRAINT "pengurangan_pst_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
CREATE TABLE "pst_data_op_baru" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"nama_wp_baru" varchar(30) NOT NULL,
	"letak_op_baru" varchar(35) NOT NULL,
	CONSTRAINT "pst_data_op_baru_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
CREATE TABLE "pst_detail" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"kd_jns_pelayanan" char(2) NOT NULL,
	"thn_pajak_permohonan" char(4) NOT NULL,
	"nama_penerima" varchar(30) DEFAULT 'WAJIB PAJAK',
	"catatan_penyerahan" varchar(75),
	"status_selesai" smallint DEFAULT 0 NOT NULL,
	"tgl_selesai" timestamp (0) NOT NULL,
	"kd_seksi_berkas" char(2) NOT NULL,
	"tgl_penyerahan" timestamp (0),
	"nip_penyerah" char(18),
	"metadata" jsonb,
	CONSTRAINT "pst_detail_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
CREATE TABLE "pst_lampiran" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"l_permohonan" smallint DEFAULT 0,
	"l_surat_kuasa" smallint DEFAULT 0,
	"l_ktp_wp" smallint DEFAULT 0,
	"l_sertifikat_tanah" smallint DEFAULT 0,
	"l_sppt" smallint DEFAULT 0,
	"l_imb" smallint DEFAULT 0,
	"l_akte_jual_beli" smallint DEFAULT 0,
	"l_sk_pensiun" smallint DEFAULT 0,
	"l_sppt_stts" smallint DEFAULT 0,
	"l_stts" smallint DEFAULT 0,
	"l_sk_pengurangan" smallint DEFAULT 0,
	"l_sk_keberatan" smallint DEFAULT 0,
	"l_skkp_pbb" smallint DEFAULT 0,
	"l_spmkp_pbb" smallint DEFAULT 0,
	"l_lain_lain" smallint DEFAULT 0,
	"metadata" jsonb,
	CONSTRAINT "pst_lampiran_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan")
);
--> statement-breakpoint
CREATE TABLE "pst_permohonan" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"no_srt_permohonan" char(30),
	"tgl_surat_permohonan" timestamp (0),
	"nama_pemohon" varchar(30),
	"alamat_pemohon" varchar(40),
	"keterangan_pst" varchar(75),
	"catatan_pst" varchar(75),
	"status_kolektif" char(1) DEFAULT '0' NOT NULL,
	"tgl_terima_dokumen_wp" timestamp (0) DEFAULT now() NOT NULL,
	"tgl_perkiraan_selesai" timestamp (0) NOT NULL,
	"nip_penerima" char(18) NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "pst_permohonan_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan")
);
--> statement-breakpoint
CREATE TABLE "pst_permohonan_pengurangan" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"jns_pengurangan" char(1) NOT NULL,
	"pct_permohonan_pengurangan" numeric(5, 2) NOT NULL,
	CONSTRAINT "pst_permohonan_pengurangan_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
CREATE TABLE "range_penyusutan" (
	"kd_range_penyusutan" char(1) PRIMARY KEY NOT NULL,
	"nilai_min_penyusutan" bigint,
	"nilai_max_penyusutan" bigint
);
--> statement-breakpoint
CREATE TABLE "ref_dati2" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"nm_dati2" varchar(30) NOT NULL,
	CONSTRAINT "ref_dati2_kd_propinsi_kd_dati2_pk" PRIMARY KEY("kd_propinsi","kd_dati2")
);
--> statement-breakpoint
CREATE TABLE "ref_jns_pelayanan" (
	"kd_jns_pelayanan" char(2) PRIMARY KEY NOT NULL,
	"nm_jenis_pelayanan" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ref_jpb" (
	"kd_jpb" char(2) PRIMARY KEY NOT NULL,
	"nm_jpb" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ref_kanwil" (
	"kd_kanwil" char(2) PRIMARY KEY NOT NULL,
	"nm_kanwil" varchar(30) NOT NULL,
	"al_kanwil" varchar(50) NOT NULL,
	"kota_terbit_kanwil" varchar(30) NOT NULL,
	"no_faksimili" varchar(50),
	"no_telpon" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "ref_kecamatan" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"nm_kecamatan" varchar(30) NOT NULL,
	CONSTRAINT "ref_kecamatan_kd_propinsi_kd_dati2_kd_kecamatan_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan")
);
--> statement-breakpoint
CREATE TABLE "ref_kelurahan" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_sektor" char(2) DEFAULT '10' NOT NULL,
	"nm_kelurahan" varchar(30) NOT NULL,
	"no_kelurahan" smallint,
	"kd_pos_kelurahan" varchar(5),
	CONSTRAINT "ref_kelurahan_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan")
);
--> statement-breakpoint
CREATE TABLE "ref_kppbb" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"nm_kppbb" varchar(30) NOT NULL,
	"al_kppbb" varchar(50) NOT NULL,
	"kota_terbit_kppbb" varchar(30) NOT NULL,
	"no_faksimili" varchar(50),
	"no_telpon" varchar(50),
	CONSTRAINT "ref_kppbb_kd_kanwil_kd_kppbb_pk" PRIMARY KEY("kd_kanwil","kd_kppbb")
);
--> statement-breakpoint
CREATE TABLE "ref_propinsi" (
	"kd_propinsi" char(2) PRIMARY KEY NOT NULL,
	"nm_propinsi" varchar(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ref_seksi" (
	"kd_seksi" char(2) PRIMARY KEY NOT NULL,
	"nm_seksi" varchar(75) NOT NULL,
	"no_srt_seksi" char(2) NOT NULL,
	"kode_surat_1" varchar(5) NOT NULL,
	"kode_surat_2" varchar(5) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sppt" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"thn_pajak_sppt" char(4) NOT NULL,
	"siklus_sppt" smallint NOT NULL,
	"kd_kanwil_bank" char(2) NOT NULL,
	"kd_kppbb_bank" char(2) NOT NULL,
	"kd_bank_tunggal" char(2) NOT NULL,
	"kd_bank_persepsi" char(2) NOT NULL,
	"kd_tp" char(2) NOT NULL,
	"nm_wp_sppt" varchar(30) NOT NULL,
	"jln_wp_sppt" varchar(30) NOT NULL,
	"blok_kav_no_wp_sppt" varchar(15),
	"rw_wp_sppt" char(2),
	"rt_wp_sppt" char(3),
	"kelurahan_wp_sppt" varchar(30),
	"kota_wp_sppt" varchar(30),
	"kd_pos_wp_sppt" varchar(5),
	"npwp_sppt" varchar(16),
	"no_persil_sppt" varchar(5),
	"kd_kls_tanah" char(3) DEFAULT 'XXX' NOT NULL,
	"thn_awal_kls_tanah" char(4) DEFAULT '1986' NOT NULL,
	"kd_kls_bng" char(3) DEFAULT 'XXX' NOT NULL,
	"thn_awal_kls_bng" char(4) DEFAULT '1986' NOT NULL,
	"tgl_jatuh_tempo_sppt" timestamp (0) NOT NULL,
	"luas_bumi_sppt" bigint DEFAULT 0 NOT NULL,
	"luas_bng_sppt" bigint DEFAULT 0 NOT NULL,
	"njop_bumi_sppt" bigint DEFAULT 0 NOT NULL,
	"njop_bng_sppt" bigint DEFAULT 0 NOT NULL,
	"njop_sppt" bigint NOT NULL,
	"njoptkp_sppt" integer NOT NULL,
	"njkp_sppt" numeric(5, 2),
	"pbb_terhutang_sppt" bigint NOT NULL,
	"faktor_pengurang_sppt" bigint,
	"pbb_yg_harus_dibayar_sppt" bigint NOT NULL,
	"status_pembayaran_sppt" char(1) DEFAULT '0' NOT NULL,
	"status_tagihan_sppt" char(1) DEFAULT '0' NOT NULL,
	"status_cetak_sppt" char(1) DEFAULT '0' NOT NULL,
	"tgl_terbit_sppt" timestamp (0) NOT NULL,
	"tgl_cetak_sppt" timestamp (0) DEFAULT now() NOT NULL,
	"nip_pencetak_sppt" char(18) NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "sppt_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_thn_pajak_sppt_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","thn_pajak_sppt")
);
--> statement-breakpoint
CREATE TABLE "sppt_op_bersama" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"thn_pajak_sppt" char(4) NOT NULL,
	"kd_kls_tanah" char(3) DEFAULT 'XXX' NOT NULL,
	"thn_awal_kls_tanah" char(4) DEFAULT '1986' NOT NULL,
	"kd_kls_bng" char(3) DEFAULT 'XXX' NOT NULL,
	"thn_awal_kls_bng" char(4) DEFAULT '1986' NOT NULL,
	"luas_bumi_beban_sppt" bigint DEFAULT 0 NOT NULL,
	"luas_bng_beban_sppt" bigint DEFAULT 0 NOT NULL,
	"njop_bumi_beban_sppt" bigint DEFAULT 0 NOT NULL,
	"njop_bng_beban_sppt" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "sppt_op_bersama_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_thn_pajak_sppt_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","thn_pajak_sppt")
);
--> statement-breakpoint
CREATE TABLE "tempat_pembayaran" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"kd_bank_tunggal" char(2) NOT NULL,
	"kd_bank_persepsi" char(2) NOT NULL,
	"kd_tp" char(2) NOT NULL,
	"nm_tp" varchar(30) NOT NULL,
	"alamat_tp" varchar(50) NOT NULL,
	"no_rek_tp" varchar(15),
	CONSTRAINT "tempat_pembayaran_kd_kanwil_kd_kppbb_kd_bank_tunggal_kd_bank_persepsi_kd_tp_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","kd_bank_tunggal","kd_bank_persepsi","kd_tp")
);
--> statement-breakpoint
CREATE TABLE "tipe_bangunan" (
	"tipe_bng" char(5) PRIMARY KEY NOT NULL,
	"nm_tipe_bng" varchar(30) NOT NULL,
	"luas_min_tipe_bng" integer NOT NULL,
	"luas_max_tipe_bng" integer NOT NULL,
	"faktor_pembagi_tipe_bng" numeric(8, 4) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dat_objek_pajak" ADD CONSTRAINT "dat_objek_pajak_subjek_pajak_id_dat_subjek_pajak_subjek_pajak_id_fk" FOREIGN KEY ("subjek_pajak_id") REFERENCES "public"."dat_subjek_pajak"("subjek_pajak_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dat_nilai_individu_formulir_idx" ON "dat_nilai_individu" USING btree ("no_formulir_individu","kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng");--> statement-breakpoint
CREATE INDEX "dat_subjek_pajak_njoptkp_nop_idx" ON "dat_subjek_pajak_njoptkp" USING btree ("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op");