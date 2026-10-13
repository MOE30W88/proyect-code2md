// respaldo.js — Genera el respaldo del proyecto en archivos .md para enviarlo completo.
// Uso: coloca este archivo en la carpeta raíz del proyecto (donde está index.html) y ejecuta:  node respaldo.js
// Crea dos archivos junto a este script:
//   respaldo-codigo.md   HTML, CSS, JS, JSON y MD (con índice y árbol de carpetas)
//   respaldo-iconos.md   SVG (con la carpeta de cada uno)
// Solo necesita Node.js (sin instalar nada más). No modifica ningún archivo del proyecto.

const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const SALIDA_CODIGO = "respaldo-codigo.md";
const SALIDA_ICONOS = "respaldo-iconos.md";

const EXT_CODIGO = { ".html": "html", ".css": "css", ".js": "js", ".json": "json", ".md": "md", ".txt": "" };
const EXT_ICONOS = { ".svg": "svg" };
const IGNORAR_CARPETAS = new Set(["node_modules", ".git", ".vscode", ".idea", "__pycache__"]);
const IGNORAR_ARCHIVOS = new Set([SALIDA_CODIGO, SALIDA_ICONOS, "package-lock.json", path.basename(__filename)]);
const MAX_BYTES = 400 * 1024; // un archivo más grande se lista pero no se copia (evita respaldos gigantes)

function recorrer(dir, lista = []) {
  const entradas = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? 1 : -1; // archivos antes que carpetas
    return a.name.localeCompare(b.name, "es", { numeric: true });
  });
  for (const e of entradas) {
    const completa = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORAR_CARPETAS.has(e.name) && !e.name.startsWith(".")) recorrer(completa, lista);
    } else if (!IGNORAR_ARCHIVOS.has(e.name)) {
      lista.push(completa);
    }
  }
  return lista;
}

const rel = (p) => path.relative(RAIZ, p).split(path.sep).join("/");
const kb = (n) => (n / 1024).toFixed(1).replace(".", ",") + " KB";

// Valla de código más larga que cualquier racha de ``` dentro del contenido (los .md pueden traer bloques)
function valla(texto) {
  const rachas = texto.match(/`{3,}/g) || [];
  return "`".repeat(Math.max(3, ...rachas.map((r) => r.length + 1)));
}

function arbol(rutas) {
  const lineas = [];
  const vistos = new Set();
  rutas.forEach((r) => {
    const partes = r.split("/");
    partes.forEach((parte, i) => {
      const clave = partes.slice(0, i + 1).join("/");
      if (vistos.has(clave)) return;
      vistos.add(clave);
      lineas.push("  ".repeat(i) + (i === partes.length - 1 ? parte : parte + "/"));
    });
  });
  return lineas.join("\n");
}

function generar(titulo, extensiones, archivoSalida, todos) {
  const archivos = todos.filter((f) => extensiones[path.extname(f).toLowerCase()] !== undefined);
  const copiados = [];
  const omitidos = [];
  let cuerpo = "";
  for (const f of archivos) {
    const tam = fs.statSync(f).size;
    if (tam > MAX_BYTES) { omitidos.push({ ruta: rel(f), tam }); continue; }
    const texto = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
    const v = valla(texto);
    const lenguaje = extensiones[path.extname(f).toLowerCase()];
    cuerpo += `\n## ${rel(f)}\n\n${v}${lenguaje}\n${texto.replace(/\n$/, "")}\n${v}\n`;
    copiados.push({ ruta: rel(f), tam });
  }
  const total = copiados.reduce((s, c) => s + c.tam, 0);
  let cab = `# ${titulo}\n\nGenerado: ${new Date().toISOString()}\nArchivos incluidos: ${copiados.length} · Tamaño del contenido: ${kb(total)}\n`;
  cab += `\n## Árbol de archivos\n\n\`\`\`\n${arbol(copiados.map((c) => c.ruta))}\n\`\`\`\n`;
  cab += `\n## Índice\n\n${copiados.map((c) => `- ${c.ruta} (${kb(c.tam)})`).join("\n")}\n`;
  if (omitidos.length) cab += `\n## Omitidos por tamaño (> ${kb(MAX_BYTES)})\n\n${omitidos.map((o) => `- ${o.ruta} (${kb(o.tam)})`).join("\n")}\n`;
  fs.writeFileSync(path.join(RAIZ, archivoSalida), cab + cuerpo, "utf8");
  console.log(`${archivoSalida}: ${copiados.length} archivos, ${kb(total)}` + (omitidos.length ? ` (omitidos: ${omitidos.length})` : ""));
}

const todos = recorrer(RAIZ);
generar("Respaldo del código — AD ASTRA", EXT_CODIGO, SALIDA_CODIGO, todos);
generar("Respaldo de iconos SVG — AD ASTRA", EXT_ICONOS, SALIDA_ICONOS, todos);
