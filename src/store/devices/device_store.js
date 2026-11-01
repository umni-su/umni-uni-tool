import { LazyStore } from '@tauri-apps/plugin-store';

const deviceStore = new LazyStore('devices.json');

export const storage = {
  // 1. Сохранение или обновление устройства
  async saveDevice(device, active = false) {
    // Если помечаем как активное, сначала сбрасываем флаг у всех остальных
    if (active) {
      await this.resetActiveStatus();
    }

    await deviceStore.set(device.hostname, {
      name: device.name,
      title: device.title ?? null,
      ip: device.ip,
      hostname: device.hostname,
      lastSeen: Date.now(),
      active: active,
      online: device.online,
      token: device.token
    });

    await deviceStore.save();
    //console.log(`Устройство ${device.hostname} сохранено. Активно: ${active}`);
  },

  // 2. Установка активного устройства по ID
  async setActive(hostname) {
    const all = await deviceStore.entries();

    for (const [id, data] of all) {
      const isTarget = id === hostname;
      await deviceStore.set(id, { ...data, active: isTarget });
    }

    await deviceStore.save();
    console.log(`Устройство ${hostname} теперь активное, остальные сброшены.`);
  },

  // 3. Вспомогательный метод: сброс всех активных статусов
  async resetActiveStatus() {
    const all = await deviceStore.entries();
    for (const [id, data] of all) {
      if (data.active) {
        await deviceStore.set(id, { ...data, active: false });
      }
    }
    // save() вызовем в основном методе
  },

  // 4. Получить активное устройство
  async getActiveDevice() {
    const all = await deviceStore.entries();
    const activeEntry = all.find(([id, data]) => data.active === true);
    return activeEntry ? { hostname: activeEntry[0], ...activeEntry[1] } : null;
  },

  // 5. Загрузка всех сохраненных устройств
  async loadSavedDevices() {
    const entries = await deviceStore.entries();
    return entries.map(([id, info]) => ({ hostname: id, ...info }));
  },

  // 6. Обновление только конкретных полей (например, только IP или lastSeen)
  async updateDevice(hostname, newData) {
    const existing = await deviceStore.get(hostname);
    if (existing) {
      newData.lastSeen = Date.now()
      newData.online = true
      await deviceStore.set(hostname, { ...existing, ...newData });
      await deviceStore.save();
    }
  },

  // 7. Удаление
  async forgetDevice(hostname) {
    await deviceStore.delete(hostname);
    await deviceStore.save();
    return await this.loadSavedDevices();
  }
};
