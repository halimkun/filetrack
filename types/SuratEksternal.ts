export type SuratEksternal = {
  data: {
    no_surat: string;
    perihal: string;
    alamat: string;
    tgl_terbit: string;
    pj: string;
    tanggal: string;
    created_at: string;
    penanggung_jawab: {
      nik: string;
      nama: string;
    };
  };
};

export type SuratEksternalList = {
  data: SuratEksternal[];
};