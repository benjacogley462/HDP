# H.D.P. — Hasta Dónde Podés (versión web comunitaria)

Juego de cartas web inspirado en la estructura que compartiste, con **mazo original propio** de humor negro argentino. No incluye una copia íntegra del mazo comercial original.

## Incluye
- Pasa y juega local para 3–8 personas en un mismo dispositivo.
- Online real por salas/código mediante WebSocket.
- Frontend estático compatible con GitHub Pages.
- Backend Node.js desplegable en Render, Railway, Fly.io o un servidor propio.
- 10 cartas blancas por jugador, sin reposición.
- Cantora rotativa, respuestas ocultas hasta completar la ronda, lectura, votación sin votar la propia carta y 1 punto por ronda ganada.
- Editor sencillo de mazos propios en el navegador (se guardan en ese dispositivo).

## Requisitos
- Node.js 20 o superior para ejecutar el servidor.
- Un navegador moderno.
- Para jugar online: desplegar el backend y configurar la URL WebSocket en la pantalla inicial.

## 1. Probar localmente (frontend + servidor)
En una terminal, dentro de `server/`:

```bash
npm install
npm start
```

Abrí `http://localhost:8080`. El servidor también sirve el frontend para que la prueba local sea simple.

Para probar online desde otros dispositivos en la misma Wi-Fi, abrí `http://IP-LOCAL-DE-TU-PC:8080` y usá el modo online. Permití el puerto 8080 en el firewall si hace falta.

## 2. Publicar frontend en GitHub Pages
1. Creá un repositorio en GitHub.
2. Subí el contenido de `public/` a la raíz del repositorio (o configurá Pages para usar esa carpeta si tu flujo lo permite).
3. En GitHub: **Settings → Pages**, elegí la rama y carpeta correspondientes.
4. Abrí la URL publicada.
5. En el menú del juego, pegá la URL `wss://...` del backend desplegado. GitHub Pages no ejecuta el backend: son dos servicios separados.

## 3. Desplegar el backend en Render (ejemplo)
1. Subí todo el proyecto a un repositorio.
2. En Render, creá un **Web Service** desde ese repositorio.
3. `Root Directory`: `server`
4. `Build Command`: `npm install`
5. `Start Command`: `npm start`
6. Render asignará una URL HTTPS. La URL WebSocket suele ser la misma cambiando `https://` por `wss://`, por ejemplo `wss://tu-servicio.onrender.com`.
7. Pegá esa URL en el campo **Servidor online** de la pantalla inicial.

También podés desplegar el directorio `server/` en Railway o en tu propia infraestructura. El servidor escucha el puerto indicado por `PORT`.

## 4. Cómo se juega
1. Se necesitan entre 3 y 8 jugadores.
2. Cada jugador recibe 10 cartas blancas; no se reponen.
3. La Cantora rota en cada ronda y se muestra una consigna negra.
4. Cada jugador elige una carta blanca en secreto.
5. Al completar las jugadas, se mezclan y la Cantora las lee una por una.
6. Todos votan su respuesta favorita; no se puede votar la propia.
7. La respuesta con más votos gana 1 punto. En empate, el punto se comparte entre las respuestas empatadas.
8. La partida termina cuando todos se quedan sin cartas. Gana quien tenga más puntos.

## Seguridad y límites
- El servidor controla las fases, las cartas y los votos para que el cliente no decida el resultado por su cuenta.
- Este es un proyecto comunitario: las salas se mantienen en memoria y se pierden si se reinicia el servidor. Para una publicación grande conviene añadir persistencia, límites de uso y moderación.
- No se envían las manos de otros jugadores a cada cliente.
- Para online, el host debe crear la sala y compartir el código. Cada participante se conecta al mismo backend.
