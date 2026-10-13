// respaldo.js — Genera el respaldo y estructura de un proyecto en una carpeta de salida.
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CARPETA_SALIDA = "archivos .md creados";
const SALIDA_CODIGO = "respaldo-codigo.md";
const SALIDA_ICONOS = "respaldo-iconos.md";
const SALIDA_ESTRUCTURA = "respaldo-estructura.md";

const EXT_CODIGO = { ".html": "html", ".css": "css", ".js": "js", ".json": "json", ".md": "md", ".txt": "" };
const EXT_ICONOS = { ".svg": "svg" };
const IGNORAR_CARPETAS = new Set(["node_modules", ".git", ".vscode", ".idea", "__pycache__", CARPETA_SALIDA]);
const IGNORAR_ARCHIVOS = new Set([SALIDA_CODIGO, SALIDA_ICONOS, SALIDA_ESTRUCTURA, "package-lock.json", path.basename(__filename)]);
const MAX_BYTES = 400 * 1024; // 400 KB

function recorrer(dir, raizBase, lista = []) {
  if (!fs.existsSync(dir)) return lista;
  const entradas = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? 1 : -1;
    return a.name.localeCompare(b.name, "es", { numeric: true });
  });
  for (const e of entradas) {
    const completa = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORAR_CARPETAS.has(e.name) && !e.name.startsWith(".")) {
        recorrer(completa, raizBase, lista);
      }
    } else if (!IGNORAR_ARCHIVOS.has(e.name)) {
      lista.push(completa);
    }
  }
  return lista;
}

const rel = (p, raiz) => path.relative(raiz, p).split(path.sep).join("/");
const kb = (n) => (n / 1024).toFixed(1).replace(".", ",") + " KB";

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

function generar(titulo, extensiones, archivoSalida, todos, raiz, dirSalida) {
  const archivos = todos.filter((f) => extensiones[path.extname(f).toLowerCase()] !== undefined);
  const copiados = [];
  const omitidos = [];
  let cuerpo = "";
  
  for (const f of archivos) {
    const tam = fs.statSync(f).size;
    const rutaRelativa = rel(f, raiz);
    if (tam > MAX_BYTES) { omitidos.push({ ruta: rutaRelativa, tam }); continue; }
    const texto = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
    const v = valla(texto);
    const lenguaje = extensiones[path.extname(f).toLowerCase()];
    cuerpo += `\n## ${rutaRelativa}\n\n${v}${lenguaje}\n${texto.replace(/\n$/, "")}\n${v}\n`;
    copiados.push({ ruta: rutaRelativa, tam });
  }

  const total = copiados.reduce((s, c) => s + c.tam, 0);
  let cab = `# ${titulo}\n\nGenerado: ${new Date().toISOString()}\nArchivos incluidos: ${copiados.length} · Tamaño del contenido: ${kb(total)}\n`;
  cab += `\n## Árbol de archivos\n\n\`\`\`\n${arbol(copiados.map((c) => c.ruta))}\n\`\`\`\n`;
  cab += `\n## Índice\n\n${copiados.map((c) => `- ${c.ruta} (${kb(c.tam)})`).join("\n")}\n`;
  if (omitidos.length) cab += `\n## Omitidos por tamaño (> ${kb(MAX_BYTES)})\n\n${omitidos.map((o) => `- ${o.ruta} (${kb(o.tam)})`).join("\n")}\n`;
  
  fs.writeFileSync(path.join(dirSalida, archivoSalida), cab + cuerpo, "utf8");
  console.log(`-> ${archivoSalida}: ${copiados.length} archivos, ${kb(total)}` + (omitidos.length ? ` (omitidos: ${omitidos.length})` : ""));
}

function generarEstructura(archivoSalida, todos, raiz, dirSalida) {
  const rutasRelativas = todos.map(f => rel(f, raiz));
  let contenido = `# Estructura del Proyecto\n\nGenerado: ${new Date().toISOString()}\nTotal de archivos detectados: ${rutasRelativas.length}\n\n`;
  contenido += `## Árbol general de directorios\n\n\`\`\`\n${arbol(rutasRelativas)}\n\`\`\`\n`;
  contenido += `\n## Lista completa de rutas\n\n${rutasRelativas.map(r => `- \`${r}\``).join("\n")}\n`;
  
  fs.writeFileSync(path.join(dirSalida, archivoSalida), contenido, "utf8");
  console.log(`-> ${archivoSalida}: ${rutasRelativas.length} rutas registradas.`);
}

rl.question("Ingresa o arrastra la ruta de la carpeta raiz del proyecto: ", (inputRuta) => {
  // Limpia comillas si el usuario arrastra la carpeta a la terminal
  const raizProyecto = inputRuta.trim().replace(/^"(.*)"$/, '$1');

  if (!fs.existsSync(raizProyecto)) {
    console.log("\n[Error]: La ruta ingresada no existe o no es válida.");
    rl.close();
    return;
  }

  // Crear la carpeta "archivos creados" dentro del proyecto analizado
  const dirSalida = path.join(raizProyecto, CARPETA_SALIDA);
  if (!fs.existsSync(dirSalida)) {
    fs.mkdirSync(dirSalida, { recursive: true });
  }

  console.log(`\nAnalizando proyecto en: ${raizProyecto}`);
  const todos = recorrer(raizProyecto, raizProyecto);

  generar("Respaldo del código", EXT_CODIGO, SALIDA_CODIGO, todos, raizProyecto, dirSalida);
  generar("Respaldo de iconos SVG", EXT_ICONOS, SALIDA_ICONOS, todos, raizProyecto, dirSalida);
  generarEstructura(SALIDA_ESTRUCTURA, todos, raizProyecto, dirSalida);

  console.log(`\n¡Listo! Todos los respaldos se guardaron en la carpeta: "${CARPETA_SALIDA}"`);
  rl.close();
});