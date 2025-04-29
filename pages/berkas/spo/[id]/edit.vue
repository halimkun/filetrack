<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UCard>
      <template #header>
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-edit" color="primary" size="xs" square variant="soft" @click.prevent />
          <div>
            <h1 class="text-base capitalize font-semibold">Detail SPO</h1>
          </div>
        </div>
      </template>

      <div class="w-full gap-6 flex items-start flex-col xl:flex-row">
        <div class="w-full flex flex-col gap-4 items-start xl:max-w-md">
          <UFormGroup label="Judul SPO" name="judul" class="w-full">
            <UTextarea placeholder="Judul SPO" variant="outline" v-model="state.judul"/>
          </UFormGroup>

          <UFormGroup label="Unit" name="unit" class="w-full">
            <SelectDepartemen v-model="state.unit"/>
          </UFormGroup>

          <UFormGroup name="semua_unit_terkait" class="w-full px-3 py-2 rounded-lg bg-lime-100 dark:bg-lime-800">
            <UCheckbox label="Semua Unit Terkait" help="Pilih jika ingin menggunakan semua unit terkait. Unit terpilih akan diabaikan." v-model="semuaUnit" />
          </UFormGroup>

          <div :class="`${semuaUnit ? 'bg-gray-200 dark:bg-gray-800 p-3 rounded-lg cursor-not-allowed' : ''} space-y-3 transition-all duration-300 ease-in-out w-full`">
            <UFormGroup label="Unit Terkait" name="unit_terkait" class="w-full">
              <SelectMultiDepartemen v-model="selectMultiDepartemen" :disabled="semuaUnit" />
            </UFormGroup>
  
            <div class="space-y-1 w-full">
              <label for="unit_terkait_free_text" class="font-bold text-xs">Unit Terkait (Free Text)</label>
              <div class="flex items-center justify-between gap-3">
                <UInput :disabled="semuaUnit" id="unit_terkait_free_text" class="w-full" placeholder="Unit Terkait (Free Text)" size="md" variant="outline" v-model="unitTerkaitFreeText" @keydown.enter.prevent="pushUnitFreeTextToState" />
                <UButton :disabled="semuaUnit" icon="i-tabler-plus" color="primary" size="md" square @click.prevent="pushUnitFreeTextToState"/>
              </div>
            </div>
          </div>

          <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton block icon="i-heroicons-calendar-days-20-solid"
                :label="state.tgl_terbit ? format(state.tgl_terbit, 'd MMMM, yyy', { locale: id }) : 'Tanggal Terbit'"
                :color="state.tgl_terbit ? 'primary' : 'rose'" 
                :variant="state.tgl_terbit ? 'soft' : 'ghost'"
                size="md" @click.prevent />

              <template #panel="{ close }">
                <DatePicker is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>

          <UFormGroup label="Jenis" name="jenis" class="w-full">
            <URadio v-for="jenis of [
              { value: 'medis', label: 'Medis' },
              { value: 'penunjang', label: 'Penunjang' },
              { value: 'umum', label: 'Umum' },
            ]" :key="jenis.value" v-bind="jenis" v-model="state.jenis"/>
          </UFormGroup>

          <UDivider class="py-4" />

          <div class="flex flex-wrap items-center justify-start gap-2 w-full">
            <div class="flex items-center justify-between w-full mb-3">
              <p class="text-sm font-bold">Semua Unit Terpilih</p>
               <UButton variant="soft" color="red" icon="i-tabler-x" size="2xs" @click.prevent="clearUnitTerkait" />
            </div>
            
            <div class="grid grid-cols-2 gap-2 w-full">
              <template v-for="(item, index) in unitMerged" :key="index">
                <div :class="`px-3 py-1.5 w-full text-sm ${ (!item.unit && !item.nama) ? 'bg-cool-200 dark:bg-cool-800 text-gray-700 dark:text-gray-200' : 'bg-lime-200 dark:bg-lime-800 text-lime-700 dark:text-lime-200'} font-semibold rounded flex items-center justify-between`">
                  {{ item.unit?.nama ?? item.nama ?? item.unit_id }}
                  <UButton icon="i-tabler-x" color="red" size="2xs" square variant="ghost" @click.prevent="state.unit_terkait.splice(index, 1)" v-if="!item.unit && !item.nama" />
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="w-full flex flex-col gap-6 items-start">
          <div class="w-full flex flex-col gap-6">
            <ClientOnly fallback="Loading Komponen...">
              <div v-for="(section, index) in sections" :key="index" class="flex flex-col">
                <label :for="section.id" class="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">{{ section?.label }}</label>
                <div :id="section.id" class="py-3 rounded-b-lg bg-white dark:bg-cool-800 transition-all duration-200 focus-within:ring-2ring-blue-500 dark:focus-within:ring-blue-500 shadow-sm"></div>
              </div>
            </ClientOnly>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 mt-10">
        <UButton color="rose" variant="soft" icon="i-tabler-x" type="button" label="Batalkan" @click.prevent="$router.back()" />
        <UButton color="primary" variant="solid" icon="i-tabler-check" type="submit" label="Simpan" />
      </div>
    </UCard>
  </UForm>
</template>

<script lang="ts" setup>
import { z } from 'zod'
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { logEvent } from '~/utils/firebase'

import type { FormSubmitEvent } from '#ui/types'

const route = useRoute()
const toasts = useToast()
const router = useRouter()
const config = useRuntimeConfig()
const tokenStore = useTokenStore();

const unitMerged = ref<any[]>([]);
const unitTerkaitFreeText = ref<string>("")

const semuaUnit = ref<boolean>(false)
const isLoading = ref(false)

const { API_V2_URL } = config.public

const quillContent = ref<any>({})
const sections = [
  { id: 'pengertian-textarea', label: 'Pengertian' },
  { id: 'tujuan-textarea', label: 'Tujuan' },
  { id: 'kebijakan-textarea', label: 'Kebijakan' },
  { id: 'prosedur-textarea', label: 'Prosedur' },
];

const clearUnitTerkait = () => {
  selectMultiDepartemen.value = []
  state.unit_terkait = []
}

const identifier = route.params.id as string
const { data: spo, error, status } = await useFetch<any>(`${API_V2_URL}/berkas/spo/${identifier}`, {
  query: { include: 'units.unit,unit' },
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
})

if (error.value) {
  toasts.add({
    title: 'Error',
    description: 'ERROR SPO DATA : ' + error.value.statusMessage,
    color: 'red'
  })

  console.error(error.value.statusMessage)
}

const unitSchema = z.object({
  dep_id: z.string(),
  nama: z.string(),
  kelompok: z.string().nullable(),
  aktif: z.string().nullable(),
  tele_id: z.string().nullable(),
});

const schema = z.object({
  judul: z.string().min(5, 'Pengertian harus harus diisi').max(255, 'Judul terlalu panjang'),
  unit: unitSchema,
  tgl_terbit: z.date(),
  jenis: z.enum(['umum', 'penunjang', 'medis']),
  // pengertian: z.string().min(5, 'Pengertian harus harus diisi'),
  // tujuan: z.string().min(5, 'Pengertian harus harus diisi'),
  // kebijakan: z.string().min(5, 'Pengertian harus harus diisi'),
  // prosedur: z.string().min(5, 'Pengertian harus harus diisi'),

  // unit_terkait: z.array(unitSchema).min(1, 'Unit terkait harus diisi'),
});

type Schema = z.output<typeof schema>

const selectMultiDepartemen = ref<any>(spo.value.data.units.filter((item: any) => item.unit !== null).map((item: any) => item.unit))
const state = reactive({
  judul: spo?.value?.data.judul,
  unit: spo?.value?.data.unit,
  tgl_terbit: spo?.value?.data.tgl_terbit ? new Date(spo?.value?.data.tgl_terbit) : new Date(),
  jenis: spo?.value?.data.jenis,
  pengertian: spo?.value?.data?.pengertian ?? "",
  tujuan: spo?.value?.data?.tujuan ?? "",
  kebijakan: spo?.value?.data?.kebijakan ?? "",
  prosedur: spo?.value?.data?.prosedur ?? "",
  unit_terkait: spo?.value?.data?.units ?? [],
  // unit_terkait: Array.isArray(spo?.value?.data?.units)
  //   ? spo.value.data.units.map((item: any) => item.unit)
  //   : [],
})

watch(
  [selectMultiDepartemen, () => state.unit_terkait],
  ([selectUnits, currentUnits]) => {
    const tempMerged = [...currentUnits];

    selectUnits.forEach((newUnit: any) => {
      const exists = tempMerged.some((existing: any) => existing.unit_id === newUnit.dep_id);
      if (!exists) {
        tempMerged.push(newUnit);
      }
    });

    if (tempMerged.length !== unitMerged.value.length) {
      unitMerged.value = tempMerged;
    }
  },
  { deep: true, immediate: true }
);

const pushUnitFreeTextToState = () => {
  if (unitTerkaitFreeText.value) {
    const newUnit = {
      unit_id: unitTerkaitFreeText.value,
      unit: null,
    };
    state.unit_terkait.push(newUnit);
    unitTerkaitFreeText.value = "";
  }
}

onMounted(async () => {
  const Quill = (await import('quill'))?.default

  const sectionIds = sections.map(section => section.id);
  sectionIds.forEach(id => {
    const key = id.split('-')[0];
    const quill = new Quill(`#${id}`, {
      theme: 'snow',
      placeholder: `Tulis ${key.toLowerCase()} di sini...`,
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
        ],
      },
    });

    quillContent.value[key] = unescapeHtml(spo.value.data[key]) ?? "";
    
    quill.setContents(quill.clipboard.convert({ html: unescapeHtml(spo.value.data[key]) ?? "" }));
    quill.on('text-change', () => {
      quillContent.value[key] = quill.root.innerHTML;
      console.log(quillContent.value);
    });
  });
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  
  const finalData: any = {
    ...event.data,
    semua_unit_terkait: semuaUnit.value,
    unit: (event.data.unit as any).dep_id,
    units: unitMerged.value.map((unit) => unit.dep_id ?? unit.unit_id),
    tgl_terbit: format(event.data.tgl_terbit, 'yyyy-MM-dd'),
  };

  sections.forEach(section => {
    const key = section.id.split('-')[0];
    finalData[key] = escapeHtml(nestListFromIndent(quillContent.value[key]), {
      removeDangerousTags: true,
    });
  });

  const { data, error, refresh, status } = await useFetch(`${API_V2_URL}/berkas/spo/${identifier}`,{
    method: 'POST',
    query: { _method: 'PUT' },
    body: JSON.stringify(finalData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenStore.accessToken}`,
    },
  })

  if (error.value) {
    logEvent('create_spo_error', error.value)
    toasts.add({
      title: 'Gagal',
      description: error.value.message,
      color: 'red',
    })

    isLoading.value = false;
  }

  if (status.value == 'success') {
    logEvent('create_spo_success', data)
    toasts.add({
      title: 'Berhasil',
      description: 'SPO berhasil disimpan',
      color: 'green',
    })
    
    isLoading.value = false;
    router.push('/berkas/spo')
  }
}
</script>