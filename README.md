# respaldo-js (proyecto code2md)

> Genera un respaldo estructurado de tu código y recursos visuales en dos archivos Markdown independientes sin dependencias externas.

---

## 📌 Descripción

Esta herramienta analiza tu proyecto y separa automáticamente el código fuente de los recursos pesados (como archivos SVG). Produce dos archivos Markdown limpios con metadatos, árbol de carpetas e índice detallado, facilitando el respaldo rápido o la alimentación de contexto limpio a modelos de Lenguaje / Inteligencia Artificial.

### ✨ Características principales

- **Sin dependencias externas**: Funciona exclusivamente con módulos nativos de Node.js.
- **División inteligente**:
  - `respaldo-codigo.md`: Contiene archivos `.html`, `.css`, `.js`, `.json`, `.txt`, etc.
  - `respaldo-iconos.md`: Contiene archivos `.svg` separados por carpeta.
- **Manejo inteligente de vallas**: Ajusta dinámicamente las delimitaciones de bloques de código (```) para prevenir rupturas sintácticas si tu código incluye archivos Markdown.
- **Árbol e índice de contenido**: Incluye metadatos de fecha, tamaño total y un árbol visual de directorios.
- **Control de tamaño**: Omite archivos que superen los 400 KB para evitar archivos excesivamente grandes o saturación de memoria.
- **Ignorado automático**: Excluye carpetas como `node_modules`, `.git`, `.vscode` y los propios archivos de respaldo.

---

## 🚀 Uso rápido

### Requisitos previos

- Tener instalado **Node.js** (versión 12 o superior recomendada).

### Ejecución

1. Coloca el archivo `respaldo.js` en la raíz de tu proyecto.
2. Abre tu terminal en esa carpeta y ejecuta:

```bash
node respaldo.js
```
