import {storage} from "@/store/devices/device_store.js";
import {invoke} from "@tauri-apps/api/core";
import {listen} from "@tauri-apps/api/event";

const sseModule = {
  state: {
    messages: [],
    isConnected: false,
    error: null,
    eventSource: null,
    maxMessages: 1000,
    connectionUnListen: null,
    dataUnListen: null,
  },
  getters: {
    recentMessages: (state) => (count = 50) => {
      return state.messages.slice(-count); // Последние N сообщений
    },
    lastMessage: state => {
      if (state.messages.length === 0) return null;
      return state.messages[state.messages.length - 1];
    }
  },
  mutations: {
    addMessage(state, message) {
      state.messages.push({
        id: Date.now(),
        data: message,
        timestamp: new Date().toLocaleString()
      });

      if (state.messages.length > state.maxMessages) {
        state.messages.shift(); // Удаляем самый старый
      }
    },
    setConnected(state, status) {
      state.isConnected = status;
    },
    setError(state, error) {
      state.error = error;
    },
    clearMessages(state) {
      state.messages = [];
    },
    setEventSource(state, source) {
      state.eventSource = source;
    }
  },
  actions: {
    async initSSE({ commit, dispatch, state }) {

      const activeDevice = await storage.getActiveDevice()
      const url =  `http://${activeDevice.ip}/sse/events`
      //const eventSource = new EventSource(url);

      await invoke('stop_sse_stream')
      setTimeout(async() => {
        await invoke('start_sse_stream', {url})
      }, 400)

      state.connectionUnListen = await listen('sse-status', data=>{
        commit('setConnected', data?.payload === 'connected')
      })

      state.dataUnListen = await listen('sse-data', data=>{
        console.log(data)
        const payload = data?.payload
        if(payload?.data){
          commit('addMessage', payload.data)
        }
      })

      // eventSource.onopen = () => {
      //   commit('setConnected', true);
      //   commit('setError', null);
      //   console.log('sse opened', url)
      // };
      //
      // eventSource.addEventListener('sensor', (event) => {
      //   try {
      //     const sensorData = JSON.parse(event.data);
      //     commit('addMessage', sensorData);
      //   } catch (error) {
      //     console.error('Error parsing sensor data:', error);
      //   }
      // });
      //
      // eventSource.onerror = (error) => {
      //   commit('setConnected', false);
      //   commit('setError', 'Ошибка соединения SSE');
      //   console.error('SSE error:', error);
      //
      //   if (eventSource.readyState === EventSource.CLOSED) {
      //     setTimeout(() => {
      //       dispatch('initSSE');
      //     }, 5000);
      //   }
      // };
      //
      // // Сохраняем в хранилище для возможности закрытия
      // commit('setEventSource', eventSource);
    },
    async closeSSE({ state, commit }) {
      commit('setConnected', false)
      await invoke('stop_sse_stream')
      if(state.connectionUnListen) state.connectionUnListen()
      if(state.dataUnListen) state.dataUnListen()
    }
  }
};

export default sseModule;
