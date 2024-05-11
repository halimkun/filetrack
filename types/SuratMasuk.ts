export type SuratMasukData = {
  no: number;
  no_simrs: string;
  no_surat: null | string;
  pengirim: string;
  tgl_surat: string; // Anda mungkin ingin menggunakan tipe Date jika tanggal ini memiliki format yang dapat di-parse
  perihal: string;
  pelaksanaan: null | string; // Anda mungkin ingin menggunakan tipe Date jika tanggal ini memiliki format yang dapat di-parse
  pelaksanaan_end: null | string; // Anda mungkin ingin menggunakan tipe Date jika tanggal ini memiliki format yang dapat di-parse
  tempat: null | string;
  ket: string;
  berkas: string; // Ini mungkin bisa didefinisikan sebagai tipe berkas jika Anda ingin mendukung berbagai jenis berkas
  status: "0" | "1"; // Anda mungkin ingin menggunakan tipe enum jika ada lebih dari dua nilai yang mungkin
}

export type BerkasPks = {
  data?: SuratMasukData;
}

export type SuratMasukList = {
  data: SuratMasukData[];
}
