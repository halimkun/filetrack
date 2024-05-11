export type PenanggungJawab = {
  nik: string;
  nama: string;
};

export type BerkasKomiteData = {
  nomor: number;
  no_surat: string;
  prefix: string;
  pj: string;
  perihal: string;
  tgl_terbit: string;
  status: number;
  created_at: string;
  updated_at: string;
  penanggungjawab: PenanggungJawab;
};

export type BerkasKomite = {
  data: BerkasKomiteData;
};

export type BerkasKomiteList = {
  data: BerkasKomiteData[];
};