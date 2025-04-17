import type { Pegawai } from './pegawai.types';
import type { SuratInternal } from './surat-internal.types';

export type Undangan = {
  id: number;
  surat_id: number;
  model: string;
  tipe: string;
  tanggal: string | Date;
  perihal: string;
  lokasi?: string;
  deskripsi?: string;
  catatan?: string;
  pj: string;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;

  penanggung_jawab?: Pegawai;
}

export type UndanganData = {
  data: Undangan;
}

export type UndanganDataDenganSurat = {
  data: Undangan & {
    surat?: SuratInternal
  }
}

export type UndanganWithDeganQr = {
  data: Undangan & {
    qr?: {
      content: string;
    }
  }
}