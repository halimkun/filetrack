<template>
  <!-- pegawai: { nik: string, nama: string }[], -->
  <FormSuratInternal 
    :no_surat="suratInternal?.data.no_surat" :tgl_terbit="new Date((suratInternal?.data.tgl_terbit || new Date()))"
    :tanggal="new Date((suratInternal?.data.tanggal || new Date()))" :tempat="suratInternal?.data.tempat"
    :pj="suratInternal?.data.pj" :perihal="suratInternal?.data.perihal" :catatan="suratInternal?.data.catatan"
    :actionUrl="actionUrl" 
  />
</template>

<script lang="ts" setup>
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()

type SuratInternalDetail = {
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

type Pegawai = {
  nik: string;
  nama: string;
};

type DataPegawai = {
  data: Pegawai[];
};

const { API_V2_URL } = runtimeConfig.public
const noSurat = route.params.no_surat as string
const accessToken = accessTokenStore.accessToken
const actionUrl = `${API_V2_URL}/surat/internal/${noSurat}?_method=PUT`

const { data: suratInternal, error } = await useFetch<SuratInternalDetail>(`${API_V2_URL}/surat/internal/${noSurat}`, {
  headers: { Authorization: `Bearer ${accessToken}` }
})

if (error.value) {
  console.error('Error fetching surat internal:', error.value);
}
</script>