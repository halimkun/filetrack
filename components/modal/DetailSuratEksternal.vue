<script setup lang="ts">

const emit = defineEmits<{
    (e: 'onClose'): void
}>();

const props = defineProps({
    detailData: {
        type: Object,
        default: () => ({}),
    },
});
</script>

<template>
    <UModal v-bind="$attrs">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex gap-2 items-start">
                        <UButton icon="i-tabler-mail-share" color="primary" size="xs" square variant="soft" />
                        <div>
                            <h1 class="text-lg">Detail Surat Eksternal</h1>
                            <p class="text-sm text-cool-400">Detail Surat Eksternal</p>
                        </div>
                    </div>

                    <UButton icon="i-tabler-x" size="xs" color="orange" variant="soft" square @click="emit('onClose')" />
                </div>
            </template>

            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <p class="text-sm text-primary-400">No Surat</p>
                        <UBadge color="gray" class="text-sm">
                            {{ detailData.no_surat ?? "-" }}
                        </UBadge>
                    </div>
                    <div>
                        <p class="text-sm text-primary-400">Tanggal Terbit</p>
                        <p class="text-lg">{{ detailData?.tgl_terbit ?
                            new Date(String(detailData.tgl_terbit)?.replace(' ',
                                'T').split('.')[0]).toLocaleDateString('id-ID', {
                                    weekday: 'long', year: 'numeric',
                            month: 'long', day: 'numeric'
                            }) : "-" }}</p>
                    </div>
                </div>
                <div>
                    <p class="text-sm text-primary-400">Perihal</p>
                    <p class="text-lg">{{ detailData.perihal }}</p>
                </div>
                <div>
                    <p class="text-sm text-primary-400">Alamat</p>
                    <p class="text-lg">{{ detailData.alamat }}</p>
                </div>
                <div>
                    <p class="text-sm text-primary-400">Penanggung Jawab</p>
                    <p class="text-lg">{{ detailData.penanggung_jawab.nama }}</p>
                </div>
            </div>
        </UCard>
    </UModal>
</template>