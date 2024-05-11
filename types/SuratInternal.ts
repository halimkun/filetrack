export type PenanggungJawab = {
  nik: string;
  nama: string;
};

export type SuratInternalData = {
  no_surat: string;
  perihal: string;
  tempat: string;
  pj: string;
  tgl_terbit: string;
  tanggal: string;
  catatan: string;
  status: 'pengajuan' | 'disetujui' | 'ditolak' | 'batal';
  created_at: string;
  model: string;
  penanggung_jawab: PenanggungJawab;
};

export type BerkasPks = {
  data?: SuratInternalData;
};

export type SuratInternalList = {
  data: SuratInternalData[];
};