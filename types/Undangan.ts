export type PenanggungJawab = {
  nik: string;
  nama: string;
};

export type Undangan = {
  no_surat: string;
  perihal: string;
  tempat: string;
  pj: string;
  tgl_terbit: string;
  tanggal: string;
  catatan: string | null;
  status: string;
  created_at: string;
};

export type SuratUndangan = {
  no_surat: string;
  penerima_count: number;
  tipe: string;
  undangan: Undangan;
};

export type SuratUndanganList = {
  data: SuratUndangan[];
};
