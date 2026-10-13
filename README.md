# 📂 ProyecCode2MD

Una utilidad ligera y robusta basada en **Node.js (módulos nativos)** diseñada para automatizar la documentación de proyectos de software. Convierte el código fuente, los recursos y la estructura general de cualquier repositorio en archivos Markdown limpios, estructurados y **optimizados para Modelos de Lenguaje (LLMs/IA)**.

---

## 🚀 Características Principales

- **Cero Dependencias Externas:** Utiliza únicamente módulos nativos de Node.js (`fs`, `path`, `readline`).
- **Optimizado para IA:** Inyecta automáticamente instrucciones de contexto, metadatos, stack tecnológico (leyendo el `package.json`) y estimación de tokens para que las IA procesen el código con máxima eficiencia.
- **Separación Inteligente de Contenido:**
  - `respaldo-codigo.md`: Lógica del proyecto (HTML, CSS, JS, JSON, MD) con árboles de archivos e índice con conteo de tokens.
  - `respaldo-iconos.md`: Concentrado exclusivo de recursos SVG.
  - `respaldo-estructura.md`: Mapa jerárquico completo de directorios y rutas.
- **Filtros Automáticos:** Omite directorios pesados (`node_modules`, `.git`, `.vscode`, etc.), archivos de bloqueo y la propia carpeta de salida.
- **Ejecución con 1 Clic:** Incluye un script por lotes (`.bat`) interactivo para seleccionar cualquier proyecto mediante la ruta.

---

## 🛠️ Cómo Utilizarlo

1. Asegúrate de tener instalado **Node.js** en tu equipo.
2. Coloca el script `respaldo.js` y el archivo ejecutable `ejecutar.bat` en tu directorio de trabajo.
3. Haz doble clic en **`ejecutar.bat`** (o ejecuta `node respaldo.js` en tu terminal).
4. Ingresa o arrastra la ruta de la carpeta raíz del proyecto que deseas respaldar.
5. Se creará automáticamente una carpeta llamada **`archivos .md creados`** dentro del proyecto analizado con los tres archivos de respaldo listos.

---

## 📂 Estructura de Salida

Los archivos generados dentro de `archivos .md creados/` siguen esta estructura:

- **`respaldo-codigo.md`** → Código fuente con metadatos, árbol y bloques formateados.
- **`respaldo-iconos.md`** → Inventario de archivos vectoriales (SVG).
- **`respaldo-estructura.md`** → Árbol general y listado completo de rutas.

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
