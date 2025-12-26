### Запуск в консоли
Установить зависимости:

`npm i`

Запустить приложение:

`npm start`


### Запуск в Docker
Для сборки запустить:

`docker build -t websocket-node-server-docker .`

Для запуска (примерная конфигурация):

`docker run -m 1g --cpus=1 --storage-opt size=1G -d -p 8484:8484 --name game-server websocket-node-server-docker --restart=always`

Для сохранения образа:

`docker save websocket-node-server-docker > game-server.tar`

### Использование с Nginx
В конфиге Nginx нужно внести настройки. Пример:

```
    # websockets
    location /socket.io/ {  # изменить под свои нужды
        proxy_pass          http://127.0.0.1:8484; # изменить под свои нужды
        proxy_http_version  1.1;
        proxy_set_header    Upgrade $http_upgrade;
        proxy_set_header    Connection upgrade;
        proxy_set_header    Host $host;
        proxy_set_header    X-Real-IP $remote_addr;
        proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;
    }
```