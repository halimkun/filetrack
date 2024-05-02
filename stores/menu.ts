import { defineStore } from "pinia";
import { ref } from "vue";

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menu: ref<any[]>([]),
  }),

  actions: {
    setMenuFromArray(menu: any[]) {
      this.menu = menu;
    },

    getMenu(): any[] {
      return this.menu;
    }

    // TODO : fetch menu from API
  },

  persist: true
});