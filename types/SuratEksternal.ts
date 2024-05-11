export type PenanggungJawab = {
  nik: string;
  nama: string;
};

export type SuratEksternalData = {
  no_surat: string;
  perihal: string;
  alamat: string;
  tgl_terbit: string;
  pj: string;
  tanggal: string;
  created_at: string;
  penanggung_jawab: PenanggungJawab;
};

export type BerkasPks = {
  data?: SuratEksternalData;
};

export type SuratEksternalList = {
  data: SuratEksternalData[];
};