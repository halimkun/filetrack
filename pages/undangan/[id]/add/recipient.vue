<script setup lang="ts">
import type { UndanganDataDenganSurat } from '~/types/undangan.types'

useHead({
  title: 'Detail Surat Internal ',
  meta: [{ name: 'description', content: 'Detail Surat Internal' }]
})

const route = useRoute()
const toast = useToast()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore();

const selected = ref<any>([])
const { API_V2_URL } = runtimeConfig.public

const sortedSelected = computed(() => {
  return [...selected.value].sort((a, b) => a.nama.localeCompare(b.nama))
})

const mapPenerima = (penerima: any) => {
  if (penerima) {
    const preSelected = penerima.map((item: any) => {
      return {
        nik: item.penerima,
        nama: item.detail.nama,
        jk: item.detail.jk,
        departemen: item.detail.departemen,
        bidang: item.detail.bidang,
        dep: item.detail.dep,
      }
    })

    selected.value = preSelected
  }
}

const { data: dataPenerima, error: dataPenerimaError } = useFetch<any>(`${API_V2_URL}/undangan/penerima/${route.params.id}`, {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
});

if (dataPenerimaError.value) {
  console.error('Error fetching surat internal:', dataPenerimaError.value);
}

watch(() => dataPenerima.value, (val) => {
  if (val?.data) {
    mapPenerima(val.data)
  }
}, { immediate: true })

const { data: undangan, error: undanganDataError } = useFetch<UndanganDataDenganSurat>(`${API_V2_URL}/undangan/${route.params.id}`, {
  query: { include: 'surat,penanggungJawab' },
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
});

if (undanganDataError.value) {
  console.error('Error fetching surat internal:', undanganDataError.value);
}

const onSubmit = async () => {
  const selectedNik = selected.value.map((item: any) => item.nik);
  const undangan_id = route.params.id

  let body = {
    undangan_id: undangan_id,
    penerima: selectedNik
  }

  const {data, status, error, refresh} = await useFetch(`${API_V2_URL}/undangan/penerima`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenStore.accessToken}`
    },
    body: JSON.stringify(body)
  })

  if (error.value) {
    console.error('Error fetching surat internal:', error.value);
  }

  if (status.value == 'success') {
    toast.add({
      title: 'Berhasil',
      description: 'Data penerima surat berhasil disimpan',
      color: 'green',
    })

    router.push(`/undangan/${route.params.id}`)
  }
}
</script>

<template>
  <div class="flex gap-4 flex-col xl:flex-row items-start">
    <div class="w-full xl:w-[40%] space-y-4">
      <UCard class="w-full">
        <template #header>
          <div class="flex gap-2 items-center">
            <UButton icon="i-tabler-target-arrow" color="indigo" size="xs" square variant="soft" />
            <h1 class="text-lg">Detail Surat & Undangan</h1>
          </div>
        </template>

        <div class="space-y-3">
            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Perihal</p>
              <p class="font-normal text-base">{{ undangan?.data?.surat?.perihal }}</p>
            </div> 

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="space-y-0 md:col-span-2">
                <p class="font-semibold text-sm text-indigo-500">No Surat</p>
                <p class="font-normal text-base">{{ undangan?.data?.surat?.no_surat ?? '-' }}</p>
              </div>

              <div class="space-y-0">
                <p class="font-semibold text-sm text-indigo-500">Status</p>
                <p class="font-normal text-base">
                  <UBadge :color="undangan?.data?.surat?.status == 'pengajuan' ? 'yellow' : undangan?.data?.surat?.status == 'disetujui' ? 'sky' : undangan?.data?.surat?.status == 'ditolak' ? 'red' : undangan?.data?.surat?.status == 'batal' ? 'gray' : 'gray'">
                    {{ undangan?.data?.surat?.status }}
                  </UBadge>
                </p>
              </div>
            </div>

            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Tanggal Terbit</p>
              <p class="font-normal text-base">
                <template v-if="undangan?.data?.surat?.tgl_terbit">
                  {{ new Date(undangan?.data?.surat?.tgl_terbit).toLocaleDateString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
                  }) }}
                </template>
              </p>
            </div>

            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Penanggung Jawab</p>
              <p class="font-normal text-base">{{ undangan?.data?.penanggung_jawab?.nama }}</p>
            </div>

            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Catatan</p>
              <p class="font-normal text-base">{{ undangan?.data?.surat?.catatan ?? "-" }}</p>
            </div>
            
            <template v-if="undangan?.data">
              <div class="p-3 rounded-md dark:bg-gray-800 space-y-3">
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                  Detail Undangan
                </h3>

                <UDivider class="my-2 border-t-2 border-gray-200 dark:border-gray-700" />

                <div class="space-y-0">
                  <p class="font-semibold text-sm text-indigo-500">Tanggal</p>
                  <p class="font-semibold text-base">
                    {{ new Date(undangan?.data.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
                    }) }}
                  </p>
                </div>

                <div class="space-y-0">
                  <p class="font-semibold text-sm text-indigo-500">Lokasi</p>
                  <p class="font-semibold text-base">{{ undangan?.data.lokasi }}</p>
                </div>

                <div class="space-y-0">
                  <p class="font-semibold text-sm text-indigo-500">Deskripsi</p>
                  <p class="font-semibold text-base">{{ undangan?.data.deskripsi ?? "-" }}</p>
                </div>
              </div>
            </template>
          </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex gap-2 items-center">
            <UButton icon="i-tabler-users" size="xs" color="primary" square variant="soft" />
            <h1 class="text-lg">Penerima Surat</h1>
          </div>
        </template>

        <div v-if="selected.length > 0">
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="(item, index) in sortedSelected" :key="index" color="gray">{{ item.nama }}</UBadge>
          </div>
        </div>
      </UCard>
    </div>

    
    <div class="space-y-4 w-full sticky top-4">
      <UCard class="w-full">
        <template #header>
          <div class="flex gap-2 items-center">
            <UButton icon="i-tabler-users" size="xs" color="primary" square variant="soft" />
            <h1 class="text-lg">Data Pegawai</h1>
          </div>
        </template>

        <TablePegawai v-model="selected" />
      </UCard>

      <UCard>
        <div class="flex justify-between items-center">
          <div class="text-lg text-gray-500">Anda memilih <span class="text-primary font-bold">{{ selected.length }}</span> pegawai, klik tombol simpan untuk menyimpan data penerima surat.</div>
          <UButton icon="i-tabler-send" color="primary" size="sm" square @click="onSubmit">
            Simpan
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
