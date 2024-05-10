export type PenanggungJawab = {
  nik: string;
  nama: string;
}

export type SuratKeputusan = {
  nomor: number;
  prefix: string;
  jenis: string;
  judul: string;
  pj: string;
  tgl_terbit: string;
  berkas: string;
  status: string;
  created_at: string;
  penanggung_jawab: PenanggungJawab;
}

export type SuratKeputusanList = {
  data: SuratKeputusan[];
}