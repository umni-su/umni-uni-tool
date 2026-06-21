# UMNI UNI Tool - управление контроллерами UMNI из одного места

Экосистема содержит в себе программное обеспечение для централизованного управления контроллерами. Так как контроллер UMNI создан на базе ESP32, данное программное обеспечение подойдет для управления любым совместимым контроллером ESP32. Важно помнить, что контроллер должен быть прошит оригинальным [ПО UMNI UNI](https://github.com/umni-su/umni-uni) и подключен к необходимой периферии согласно открытой документации.

[![UMNI-UNI-D-CLIMATE.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/sSWwwNiZ7WzpifKN-umni-uni-d-climate.png)](https://docs.umni.su/uploads/images/gallery/2026-06/sSWwwNiZ7WzpifKN-umni-uni-d-climate.png)

UMNI UNI TOOL - это по сути обвертка надо открытым REST HTTP API, о котором вы можете почитать [тут](https://docs.umni.su/books/prosivka-umni-uni/page/rest-api-v10).

С помощью этого приложения, вы можете централизованно управлять контроллерами UMNI:

- Настраивать порты ввода-вывода
- Управлять газовыми котлами (UMNI C1, например, содержит на борту адаптер, совместимый с Opentherm)
- Подключать и получать статус с аналоговых датчиков, встроенных NTC термисторов, ONEWIRE датчиков температуры
- Использовать OTA для обновления ПО устройства без проводов ([а можно и с проводами](https://docs.umni.su/books/prosivka-umni-uni/page/prosivka-ustroistv-umni-cerez-esp-launchpad-veb-brauzer)).
- Настраивать автоматизации (не такие вложенные и сложные, но все же).

Релиз можно скачать с официального репозитория на Github.

### Разработка и поддержка

Каждый из вас может вложить вклад в проект. [Поддержим ](https://github.com/umni-su/umni-uni-tool/blob/main/CONTRIBUTING.md)развитие отечественного опенсорса, да и опенсорса в целом!

Запуск проекта

```
npm run tauri dev

npm run tauri android dev
```

Сборка проекта

```
npm run tauri build

npm run android build
```

### Скриншоты

[![UMNI-UNI-D-HOME.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/sYjwGx5uZ3gI5InZ-umni-uni-d-home.png)](https://docs.umni.su/uploads/images/gallery/2026-06/sYjwGx5uZ3gI5InZ-umni-uni-d-home.png)

[![UMNI-UNI-D-DIO.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/af6cc74ho1rgcLD3-umni-uni-d-dio.png)](https://docs.umni.su/uploads/images/gallery/2026-06/af6cc74ho1rgcLD3-umni-uni-d-dio.png)

[![UMNI-UNI-D-OW.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/lsixv89NjoZBELMN-umni-uni-d-ow.png)](https://docs.umni.su/uploads/images/gallery/2026-06/lsixv89NjoZBELMN-umni-uni-d-ow.png)

[![UMNI-UNI-D-RF.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/JddkLAnTVL5OYYd8-umni-uni-d-rf.png)](https://docs.umni.su/uploads/images/gallery/2026-06/JddkLAnTVL5OYYd8-umni-uni-d-rf.png)

[![UMNI-UNI-0.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/IzgfVmcpQmK30Ugq-umni-uni-0.png)](https://docs.umni.su/uploads/images/gallery/2026-06/IzgfVmcpQmK30Ugq-umni-uni-0.png)

[![UMNI-UNI-1.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/SkSRURaPU5p4WTW1-umni-uni-1.png)](https://docs.umni.su/uploads/images/gallery/2026-06/SkSRURaPU5p4WTW1-umni-uni-1.png)

[![UMNI-UNI-2.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/XuHqjteJvKfcfI3D-umni-uni-2.png)](https://docs.umni.su/uploads/images/gallery/2026-06/XuHqjteJvKfcfI3D-umni-uni-2.png)

[![UMNI-UNI-3.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/jlqOgxG9wuJrQ33m-umni-uni-3.png)](https://docs.umni.su/uploads/images/gallery/2026-06/jlqOgxG9wuJrQ33m-umni-uni-3.png)

[![UMNI-UNI-4.png](https://docs.umni.su/uploads/images/gallery/2026-06/scaled-1680-/fMnjg2qJvr7PD9M6-umni-uni-4.png)](https://docs.umni.su/uploads/images/gallery/2026-06/fMnjg2qJvr7PD9M6-umni-uni-4.png)