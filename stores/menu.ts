import { defineStore } from "pinia";
import { ref } from "vue";

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menu: ref<any[]>([]),
  }),

  actions: {
    async getMenu(): Promise<any[]> {
      if (this.menu.length > 0) {
        return this.menu;
      } else {
        const rawMenu = await this.fetchMenu(); // rawMenu: Record<string, any[]> | null

        if (rawMenu) {
          const transformed = this.mapMenu(rawMenu); // this is now safe
          this.menu = transformed;
          return transformed;
        } else {
          return [];
        }
      }
    },

    async fetchMenu(): Promise<Record<string, any[]> | null> {
      const config = useRuntimeConfig();
      const token = useTokenStore();
      const { API_V2_URL, rsia } = config.public;

      return $fetch<{ data: Record<string, any[]> }>(`${API_V2_URL}/user/menu/${ rsia.clientId }`, {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`
        }
      }).then((response) => {
        return response.data;
      }).catch((error) => {
        console.error('Error fetching menu:', error);
        return null;
      });
    },

    mapMenu(menu: Record<string, any[]>): any[][] {
      return Object.values(menu).map(group =>
        group.map(item => ({
          label: item.label,
          icon: item.meta?.icon || '',
          to: item.route
        }))
      );
    },
  },

  persist: true
});
