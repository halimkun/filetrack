export type Departemen = {
  dep_id: string;
  nama: string;
  kelompok: string | null;
  aktif: boolean | null;
  tele_id: string | null;
};

export type DepartemenData = {
  data: Departemen[];
};
