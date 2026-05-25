import {createRouter, createWebHashHistory} from 'vue-router'
import IndexLayout from "@/components/router/IndexLayout.vue";
import SettingsPage from "@/components/router/SettingsPage.vue";
import ClimatePanel from "@/components/router/panels/ClimatePanel.vue";
import HomePanel from "@/components/router/panels/HomePanel.vue";
import InputsOutputsPanel from "@/components/router/panels/InputsOutputsPanel.vue";
import OneWirePanel from "@/components/router/panels/OneWirePanel.vue";
import RfPanel from "@/components/router/panels/RfPanel.vue";
import AnalogSensorsPanel from "@/components/router/panels/AnalogSensorsPanel.vue";
import DevicesPage from "@/components/router/DevicesPage.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: IndexLayout,
      children: [
        {
          path: 'home',
          name: 'home_panel',
          component: HomePanel
        }, {
          path: 'analog',
          name: 'analog',
          component: AnalogSensorsPanel
        },
        {
          path: 'climate',
          name: 'climate_panel',
          component: ClimatePanel
        },
        {
          path: 'dio',
          name: 'dio_panel',
          component: InputsOutputsPanel
        },
        {
          path: '1wire',
          name: 'one_wire_panel',
          component: OneWirePanel
        },
        {
          path: 'rf',
          name: 'rf_panel',
          component: RfPanel
        },
      ]
    },
    {
      path: '/devices',
      component: DevicesPage,
      name: 'devices'
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsPage
    },

  ],
})

export default router
