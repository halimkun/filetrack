<template>
  <UModal v-bind="$attrs">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-heroicons-eye-20-solid" color="lime" size="xs" square variant="soft" />
            <h1 class="text-lg">Detail Berkas PKS</h1>
          </div>
        </div>
      </template>

      <div class="flex gap mb-5">
        <div class="w-full">
          <h4 class="mb-1 text-base text-lime-400 font-bold">No. PKS Internal</h4>
          <UBadge color="gray">{{ dataPks.no_pks_internal }}</UBadge>
        </div>
        <div class="w-full">
          <h4 class="mb-1 text-base text-lime-400 font-bold">No. PKS Eksternal</h4>
          <UBadge color="gray">{{ dataPks.no_pks_eksternal }}</UBadge>
        </div>
      </div>
      
      <div class="w-full mb-5">
        <h4 class="mb-1 text-base text-lime-400 font-bold">Judul</h4>
        {{ dataPks.judul }}
      </div>
      
      <div class="flex gap mb-5">
        <div class="w-full">
          <h4 class="mb-1 text-base text-lime-400 font-bold">Tanggal Awal</h4>
          {{ new Date(dataPks.tanggal_awal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </div>
        <div class="w-full">
          <h4 class="mb-1 text-base text-lime-400 font-bold">Tanggal Akhir</h4>
          {{ dataPks.tanggal_akhir && dataPks.tanggal_akhir !== '0000-00-00' ? new Date(dataPks.tanggal_akhir).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
        </div>
      </div>

      <div class="w-full mb-5">
        <h4 class="mb-1 text-base text-lime-400 font-bold">Penanggung Jawab</h4>
        {{ dataPks.penanggung_jawab.nama }}
      </div>

    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const dataPks = ref<any>(null);
const props = defineProps<{
  data: any;
}>();

watch(() => props.data, (data) => {
  dataPks.value = data;
});
</script>