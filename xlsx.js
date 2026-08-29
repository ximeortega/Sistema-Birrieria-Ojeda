/* =========================================================================
   Birriería Ojeda · Generador de archivos de Excel (.xlsx)
   -------------------------------------------------------------------------
   Un .xlsx es un ZIP con varios XML dentro. Aquí se arma a mano, sin
   librerías, para poder entregar UN solo archivo con una hoja por reporte,
   con encabezados de color, totales resaltados e importes con formato de
   moneda. Un CSV no puede hacer nada de eso.
   ========================================================================= */

/* ---------- ZIP ---------------------------------------------------------- */
const CRC_TABLA = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLA[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Empaqueta los archivos en un ZIP sin comprimir (método "stored"), que es
 * válido y evita meter un compresor.
 */
function zipStored(archivos) {
  const enc = new TextEncoder();
  const partes = [];
  const central = [];
  let offset = 0;

  // Fecha y hora en el formato viejo de MS-DOS que usa el ZIP.
  const ahora = new Date();
  const hora = ((ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1)) & 0xffff;
  const fecha = (((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate()) & 0xffff;

  archivos.forEach(({ nombre, contenido }) => {
    const nom = enc.encode(nombre);
    const dat = enc.encode(contenido);
    const crc = crc32(dat);

    const cab = new Uint8Array(30 + nom.length);
    const v = new DataView(cab.buffer);
    v.setUint32(0, 0x04034b50, true);   // firma de archivo local
    v.setUint16(4, 20, true);           // versión necesaria
    v.setUint16(6, 0x0800, true);       // nombres en UTF-8
    v.setUint16(8, 0, true);            // sin compresión
    v.setUint16(10, hora, true);
    v.setUint16(12, fecha, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, dat.length, true);
    v.setUint32(22, dat.length, true);
    v.setUint16(26, nom.length, true);
    v.setUint16(28, 0, true);
    cab.set(nom, 30);

    partes.push(cab, dat);

    const cen = new Uint8Array(46 + nom.length);
    const w = new DataView(cen.buffer);
    w.setUint32(0, 0x02014b50, true);   // firma del índice
    w.setUint16(4, 20, true);
    w.setUint16(6, 20, true);
    w.setUint16(8, 0x0800, true);
    w.setUint16(10, 0, true);
    w.setUint16(12, hora, true);
    w.setUint16(14, fecha, true);
    w.setUint32(16, crc, true);
    w.setUint32(20, dat.length, true);
    w.setUint32(24, dat.length, true);
    w.setUint16(28, nom.length, true);
    w.setUint32(42, offset, true);
    cen.set(nom, 46);
    central.push(cen);

    offset += cab.length + dat.length;
  });

  const indice = central.reduce((n, c) => n + c.length, 0);
  const fin = new Uint8Array(22);
  const f = new DataView(fin.buffer);
  f.setUint32(0, 0x06054b50, true);     // fin del índice
  f.setUint16(8, central.length, true);
  f.setUint16(10, central.length, true);
  f.setUint32(12, indice, true);
  f.setUint32(16, offset, true);

  const todo = partes.concat(central, [fin]);
  const total = todo.reduce((n, p) => n + p.length, 0);
  const salida = new Uint8Array(total);
  let i = 0;
  todo.forEach((p) => { salida.set(p, i); i += p.length; });
  return salida;
}

/* ---------- XLSX --------------------------------------------------------- */
const xmlEsc = (t) => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');   // Excel rechaza estos caracteres

/** Nombre de hoja válido: sin signos prohibidos y de 31 caracteres o menos. */
function nombreHoja(t, usados) {
  let n = String(t || 'Hoja').replace(/[\[\]\*\?\/\\:]/g, ' ').trim().slice(0, 31) || 'Hoja';
  let base = n, i = 2;
  while (usados.includes(n)) { n = (base.slice(0, 28) + ' ' + i).trim(); i++; }
  usados.push(n);
  return n;
}

const COL = (n) => {
  let s = '';
  n++;
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
};

/**
 * hojas: [{ nombre, filas:[[...]], dinero:[índices], anchos:[números] }]
 * La primera fila de cada hoja es el encabezado.
 */
function construirXLSX(hojas) {
  const usados = [];
  const limpias = hojas.map((h) => ({ ...h, nombre: nombreHoja(h.nombre, usados) }));

  const hojaXML = (h) => {
    const filas = h.filas || [];
    const anchos = h.anchos || [];
    const cols = anchos.length
      ? `<cols>${anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
      : '';

    const cuerpo = filas.map((fila, r) => {
      const esCab = r === 0;
      const esTotal = !esCab && String(fila[0]).toUpperCase() === 'TOTAL';
      const celdas = fila.map((v, c) => {
        const ref = COL(c) + (r + 1);
        const dinero = !esCab && h.dinero && h.dinero.includes(c);
        // Todo número real entra como número, para que Excel pueda sumarlo.
        // Los textos que parecen número (folio "001") se quedan como texto,
        // porque si no Excel les come los ceros de adelante.
        const num = !esCab && typeof v === 'number' && isFinite(v);
        // 1 encabezado · 2 texto · 3 moneda · 4 total texto · 5 total moneda
        const est = esCab ? 1 : esTotal ? (dinero ? 5 : 4) : (dinero ? 3 : 2);
        if (num) return `<c r="${ref}" s="${est}"><v>${Number(v)}</v></c>`;
        if (v === '' || v === null || v === undefined) return `<c r="${ref}" s="${est}"/>`;
        return `<c r="${ref}" s="${est}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
      }).join('');
      return `<row r="${r + 1}"${esCab ? ' ht="22" customHeight="1"' : ''}>${celdas}</row>`;
    }).join('');

    const ancho = Math.max(1, (filas[0] || []).length);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
${cols}<sheetData>${cuerpo}</sheetData>
<autoFilter ref="A1:${COL(ancho - 1)}${Math.max(1, filas.length)}"/>
</worksheet>`;
  };

  const archivos = [
    { nombre:'[Content_Types].xml', contenido:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${limpias.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}
</Types>` },

    { nombre:'_rels/.rels', contenido:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>` },

    { nombre:'xl/workbook.xml', contenido:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${limpias.map((h, i) => `<sheet name="${xmlEsc(h.nombre)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
</workbook>` },

    { nombre:'xl/_rels/workbook.xml.rels', contenido:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${limpias.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}
<Relationship Id="rId${limpias.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>` },

    // Colores de la marca: encabezado vino, totales en rosa claro.
    { nombre:'xl/styles.xml', contenido:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/></numFmts>
<fonts count="4">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FF8C111C"/><name val="Calibri"/></font>
<font><sz val="11"/><color rgb="FF16161A"/><name val="Calibri"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFA51420"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFDF1F2"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top style="thin"><color rgb="FFA51420"/></top><bottom/><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="6">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="164" fontId="3" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="164" fontId="2" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
</cellXfs>
</styleSheet>` },
  ];

  limpias.forEach((h, i) => archivos.push({ nombre:`xl/worksheets/sheet${i + 1}.xml`, contenido:hojaXML(h) }));
  return zipStored(archivos);
}

/** Calcula anchos de columna según el contenido, para que nada salga cortado. */
function anchosDe(filas) {
  if (!filas.length) return [];
  const n = filas[0].length;
  const anchos = [];
  for (let c = 0; c < n; c++) {
    let max = 8;
    filas.forEach((f) => {
      const t = String(f[c] == null ? '' : f[c]);
      if (t.length > max) max = t.length;
    });
    anchos.push(Math.min(46, Math.max(9, Math.round(max * 1.15) + 2)));
  }
  return anchos;
}
