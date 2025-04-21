import type { Pegawai } from './pegawai.types';

export type SuratEksternal = {
    id: number
    no_surat?: string
    perihal: string
    alamat: string
    tgl_terbit: string | Date
    pj: string
    status: 'pengajuan' | 'disetujui' | 'ditolak' | 'batal'
    verified_at?: string | Date
    created_at?: string | Date
    updated_at?: string | Date
    deleted_at?: string | Date
    penanggung_jawab?: Pegawai
    requested_by?: Pegawai
}

export type SuratEksternalData = {
    data: SuratEksternal
}