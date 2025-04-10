import type { Pegawai } from './pegawai.types';

export type Undangan = {
  id: number;
  surat_id: number;
  model: string;
  perihal: string;
  tanggal: string | Date;
  lokasi?: string;
  deskripsi?: string;
  catatan?: string;
  pj: string;
  penanggung_jawab?: Pegawai;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
}
