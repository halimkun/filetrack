import type { Pegawai } from './pegawai.types';
import type { Undangan } from './undangan.types';

export type SuratInternal = {
  id: number
  no_surat?: string
  perihal: string
  tgl_terbit: string | Date
  status: 'pengajuan' | 'disetujui' | 'ditolak' | 'batal'
  pj: string
  requested_by: string
  catatan: string
  verified_at?: string | Date
  created_at?: string | Date
  updated_at?: string | Date
  deleted_at?: string | Date
  penanggung_jawab: Pegawai;
  diajukan_oleh: Pegawai;
};

export type SuratInternalDenganUndangan = SuratInternal & {
  undangan?: Undangan
}

export type SuratInternalData = {
  data: SuratInternal
}

// export type BerkasPks = {
//   data?: SuratInternal;
// };

// export type SuratInternalList = {
//   data: SuratInternal[];
// };