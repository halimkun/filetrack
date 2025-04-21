export type Pegawai = {
  nik: string;
  nama: string;
  jbtn?: string;
  departemen?: string;
  bidang?: string;
  jnj_jabatan?: string;
};

export type PegawaiList = {
  data: Pegawai[];
};