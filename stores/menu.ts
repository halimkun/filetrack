import { defineStore } from "pinia";
import CryptoJS from 'crypto-js'
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
      const { API_V2_URL, clientId } = config.public;

      return $fetch<{ data: Record<string, any[]> }>(`${API_V2_URL}/user/menu/${clientId}`, {
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

  persist: {
    storage: {
      getItem: (key) => useCookie(key).value ?? null,
      setItem: (key, value) => {
        useCookie(key, { sameSite: 'strict', expires: 0 }).value = value
      },
      removeItem: (key: any) => {
        useCookie(key).value = null
      }
    },
    serializer: {
      serialize: (value) => {
        const config = useRuntimeConfig()
        return CryptoJS.AES.encrypt(JSON.stringify(value), config.public.clientSecrete).toString()
      },
      deserialize: (value) => {
        const config = useRuntimeConfig()
        try {
          const bytes = CryptoJS.AES.decrypt(value, config.public.clientSecrete)
          return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
        } catch {
          return []
        }
      }
    }
  }
});
