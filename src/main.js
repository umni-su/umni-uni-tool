import {setupI18n, loadLocaleMessages, plural} from './i18n'
import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from "@/store/store.js";

// main.js
import moment from "moment";
import 'moment/dist/locale/ru';

const light = {
  dark: false,
  colors: {
    primary: '#008dd2',
    'primary-lighten': '#16a0de',
    'primary-darken': '#0486c2',
    secondary: '#809098',
  },
}

const dark = {
  dark: true,
  colors: {
    primary: '#008dd2',
    'primary-lighten': '#16a0de',
    'primary-darken': '#0486c2',
    secondary: '#809098',
    'secondary-lighten': 'rgba(128,144,152,0.3)'
  },
}

const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    global: {
      rounded: 'lg',
      density: 'comfortable'
    },
    VTextField: {
      variant: 'outlined',
      hideDetails: true,
      density: 'compact',
    },
    VFileInput: {
      prependIcon: null,
      prependInnerIcon: 'mdi-paperclip',
      variant: 'outlined',
      hideDetails: true,
      density: 'compact',
    },
    VList:{
      VListItem: {
        rounded: 0
      }
    },
    VSparkline:{
      type: 'trend',
      lineWidth: 2,
      autoDraw: true,
      smooth:true
    },
    VSelect: {
      variant: 'outlined',
      hideDetails: true,
      density: 'compact',
    },
    VSwitch:{
      hideDetails: true
    },
    VAutocomplete: {
      hideDetails: true,
    },
    VContainer: {
      fluid: true
    },
    VCheckbox: {
      hideDetails: true,
      density: 'compact',
    },
    VTab:{
      rounded:0
    },
    VProgressLinear:{
      height:6,
      rounded: 'lg'
    },
    VBtn: {
      density: 'default',
      color: 'primary',
      variant: 'flat'
    }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light,
      dark
    },
  },

})


const i18n = setupI18n({
  locale: 'ru',
  pluralizationRules: {
    ru: plural
  }
})

loadLocaleMessages(i18n, i18n.global.locale).then(() => {
  const app = createApp(App)
  app.config.globalProperties.$moment = moment
  app.use(router)
  app.use(i18n)
  app.use(store)
  app.use(vuetify)
  app.mount('#app')
});
