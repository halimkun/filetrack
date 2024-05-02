<template>
  <UInputMenu 
    v-model="selectedPegawai" 
    :loading="loadingPegawai"
    :search="search"
    placeholder="Penanggung Jawab"
    option-attribute="nama" 
    trailing
    class="w-full"
  />
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:selectedPegawai'])
const { pj } = defineProps<{ 
  pj?: string 
}>()

type Pegawai = {
  nik: string;
  nama: string;
};

type DataPegawai = {
  data: Pegawai[];
};

const accessTokenStore = useAccessTokenStore();
const config = useRuntimeConfig()

const { API_V2_URL } = config.public
const { accessToken } = accessTokenStore

const loadingPegawai = ref(false)
const selectedPegawai = ref<Pegawai>({ nik: pj || '', nama: '' })

async function search(q: string): Promise<Pegawai[]> {
  loadingPegawai.value = true;
  
  try {
    const response = await $fetch<DataPegawai>(`${API_V2_URL}/pegawai/search?select=nik,nama&limit=500`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        search: { value: q },
        filters: [
          { field: 'stts_aktif', operator: '=', value: 'AKTIF' }
        ]
      })
    });

    loadingPegawai.value = false;
    return response.data;
  } catch (error) {
    console.error("Error fetching pegawai:", error);
    loadingPegawai.value = false;
    return [];
  }
}

watch(selectedPegawai, (value) => {
  console.log('selectedPegawai', value);
  emit('update:selectedPegawai', value.nik);
});
</script>