export type PenanggungJawab = {
  nik: string;
  nama: string;
};

export type BerkasPksData = {
  id: number;
  no_pks_internal: string;
  no_pks_eksternal: string | null | undefined;
  judul: string;
  tgl_terbit: string;
  tanggal_awal: string;
  tanggal_akhir: string | null | undefined;
  berkas: string;
  pj: string;
  status: number;
  created_at: string;
  penanggungjawab: PenanggungJawab;
};

export type BerkasPks = {
  data?: BerkasPksData;
};

export type BerkasPksList = {
  data: BerkasPksData[];
};
