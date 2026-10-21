# Portal Rick & Morty — Aplicación de Escritorio con Electron (Ejercicio 01)

Aplicación de escritorio desarrollada mediante el framework **Electron**, adaptando una aplicación web que consume la API pública oficial de **The Rick and Morty API** para consultar y visualizar información detallada de sus personajes multiversales.

---

## 🚀 Requisitos y Pasos de Ejecución

### Prerrequisitos
- Tener instalado **Node.js** (versión 20 o superior) y **npm**.

### Instrucciones paso a paso
1. Abrir una terminal o consola de comandos en la carpeta `ejercicio_01`:
   ```bash
   cd "ejercicio_01"
   ```
2. Instalar las dependencias del proyecto (requiere conexión a Internet para descargar Electron):
   ```bash
   npm install
   ```
3. Iniciar la aplicación en modo escritorio:
   ```bash
   npm start
   ```
4. (Opcional) Comprobar la sintaxis de los archivos fuente:
   ```bash
   npm run check
   ```

> **Nota:** La aplicación se carga directamente en Electron mediante `loadFile` (`src/index.html`). No requiere Live Server, servidores locales ni localhost.

---

## 📋 Cumplimiento de Requisitos del Ejercicio

| Requisito Solicitado | Implementación |
| :--- | :--- |
| **Proyecto en Electron** | Estructura modular con `package.json`, proceso principal y renderer. |
| **Integración de JavaScript y API** | Conexión con `https://rickandmortyapi.com/api/character` con consultas dinámicas. |
| **Proceso principal (`main.js`)** | Creación y control del ciclo de vida de la ventana (`BrowserWindow`). |
| **Carga de interfaz local** | Carga directa mediante `win.loadFile(path.join(__dirname, 'src/index.html'))`. |
| **Imagen** | Fotografía oficial del personaje con lazy loading y fallback de imagen. |
| **Nombre** | Título principal de cada tarjeta. |
| **Estado** | Badge interactivo con indicador pulsante (Vivo, Muerto, Desconocido). |
| **Especie** | Campo descriptivo (Humano, Alienígena, etc.). |
| **Género** | Etiqueta con valor traducido (Femenino, Masculino, etc.). |
| **Origen** | Planeta o dimensión de procedencia del personaje (`origin.name`). |
| **Mecanismos de consulta** | Búsqueda por nombre y filtros por estado, género y especie. |
| **Navegación / Paginación** | Botones Anterior / Siguiente, contador de página y total de personajes. |
| **Nombre e Icono** | Nombre identificativo e iconos en formatos PNG e ICO en la carpeta `assets/`. |
| **Seguridad de Electron** | `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, script de `preload.js` con `contextBridge` y Content Security Policy estricta. |

---

## 📂 Estructura del Proyecto

```text
ejercicio_01/
├── package.json        # Configuración del proyecto, dependencias y scripts de inicio
├── main.js             # Proceso principal: control de ventana nativa y seguridad
├── preload.js          # Script de precarga: puente aislado y seguro (contextBridge)
├── assets/
│   ├── icon.png        # Icono de la aplicación en formato PNG
│   └── icon.ico        # Icono de la aplicación en formato ICO (Windows)
├── src/
│   ├── index.html      # Estructura semántica de la interfaz de usuario
│   ├── css/
│   │   └── styles.css  # Estilos modernos con estética sci-fi, glassmorphism y modo oscuro
│   └── js/
│       └── app.js      # Lógica de consumo de la API, renderizado seguro y paginación
└── README.md           # Documentación técnica y guía de ejecución
```

---

## 🔒 Consideraciones de Seguridad
1. **Aislamiento de contexto (`contextIsolation: true`)**: El código web que corre en el renderer no comparte contexto global con Node.js.
2. **Desactivación de Node en Renderer (`nodeIntegration: false`)**: Se previene la ejecución de comandos del sistema desde la interfaz web.
3. **Sandbox activo (`sandbox: true`)**: Se aísla el proceso de renderizado dentro de los límites del sandbox del navegador Chromium.
4. **Preload controlado (`preload.js`)**: Sólo se exponen metadatos estrictamente seguros mediante `contextBridge.exposeInMainWorld`.
5. **Content Security Policy (CSP)**: Restringe conexiones únicamente al dominio oficial `https://rickandmortyapi.com`.
6. **Prevención XSS**: Los datos de la API se insertan mediante `textContent` y creación de nodos del DOM (`createElement`), evitando `innerHTML` con datos externos.

---

## 🧪 Pruebas y Casos de Uso Recomendados
1. **Búsqueda por texto**: Ingresar *"Rick"* o *"Morty"* en el buscador y pulsar **Buscar** o la tecla **Enter**.
2. **Filtros combinados**: Seleccionar Estado *"Vivo"* y Género *"Femenino"*, y comprobar los personajes resultantes.
3. **Paginación**: Navegar entre páginas con los botones **Anterior** y **Siguiente**.
4. **Ficha completa (Modal)**: Hacer clic en *"Ver ficha completa"* en cualquier personaje para ver planeta de origen, ubicación y número de episodios.
5. **Sin resultados**: Escribir una palabra inexistente (ej. *"xyz999"*) para verificar el mensaje controlado de búsqueda vacía.
6. **Manejo sin conexión**: Desconectar el acceso a Internet temporalmente y pulsar Buscar para observar el mensaje de error controlado con instrucción para reintentar.
