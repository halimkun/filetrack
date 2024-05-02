export type SuratInternal = {
  data: {
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
    penanggung_jawab: {
      nik: string;
      nama: string;
    };
  };
};

export type SuratInternalList = {
  data: SuratInternal[];
};