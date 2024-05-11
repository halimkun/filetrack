export type PenanggungJawab = {
  nik: string;
  nama: string;
};

export type BerkasLainnyaData = {
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

export type BerkasLainnya = {
  data: BerkasLainnyaData;
};

export type BerkasLainnyaList = {
  data: BerkasLainnyaData[];
}
