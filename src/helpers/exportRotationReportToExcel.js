import * as XLSX from "xlsx-js-style";

// Paleta tomada del theme de la app (misma que exportMovementsToExcel.js)
const COLORS = {
  primary: "004782",
  onPrimary: "FFFFFF",
  primaryFixed: "D4E3FF",
  onPrimaryFixedVariant: "004883",
  errorContainer: "FFDAD6",
  onErrorContainer: "93000A",
  surfaceContainerLow: "EFF4FF",
  surfaceContainerLowest: "FFFFFF",
  outlineVariant: "C2C6D2",
  onSurface: "121C2A",
  onSurfaceVariant: "424751",
  secondary: "555F6D",
};

const thinBorder = {
  top: { style: "thin", color: { rgb: COLORS.outlineVariant } },
  bottom: { style: "thin", color: { rgb: COLORS.outlineVariant } },
  left: { style: "thin", color: { rgb: COLORS.outlineVariant } },
  right: { style: "thin", color: { rgb: COLORS.outlineVariant } },
};

const COL_COUNT = 8; // A..H

/**
 * Exporta el reporte de rotación de productos (RF-24) a un archivo Excel.
 *
 * @param {object} report - Respuesta completa de GET /movements/reporte-resumen
 * @param {object} range  - { startDate, endDate } en formato YYYY-MM-DD
 */
export const exportRotationReportToExcel = (report, { startDate, endDate } = {}) => {
  const headers = [
    "Producto",
    "Entradas",
    "Salidas",
    "% del total",
    "Nivel de rotación",
    "Stock actual",
    "Requiere reabastecimiento",
    "Sugerencia de compra",
  ];

  const now = new Date();
  const exportedAt = now.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = report.reporteCompletoPorProducto ?? [];

  const dataRows = rows.map((p) => [
    p.name,
    p.entradas,
    p.salidas,
    p.porcentajeRotacion,
    p.nivelRotacion,
    p.currentStock,
    p.requiereReabastecimiento ? "Sí" : "No",
    p.sugerenciaCompra > 0 ? p.sugerenciaCompra : 0,
  ]);

  // Layout de filas:
  // 1: título
  // 2: período
  // 3: resumen general
  // 4: fecha de exportación
  // 5: (vacía)
  // 6: encabezados
  // 7..N: datos
  const HEADER_ROW = 6;
  const DATA_START_ROW = HEADER_ROW + 1;

  const resumen = report.resumenGeneral ?? {};

  const aoa = [
    ["Reporte de Rotación de Productos"],
    [`Período: ${startDate ?? "—"} a ${endDate ?? "—"}`],
    [
      `Productos con movimiento: ${resumen.totalProductosConMovimiento ?? 0}  ·  ` +
        `Unidades entrantes: ${resumen.totalUnidadesEntrantes ?? 0}  ·  ` +
        `Unidades salientes: ${resumen.totalUnidadesSalientes ?? 0}`,
    ],
    [`Generado el ${exportedAt}`],
    [],
    headers,
    ...dataRows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ── Anchos de columna ─────────────────────────────────────
  ws["!cols"] = [
    { wch: 32 },
    { wch: 11 },
    { wch: 11 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
  ];

  // ── Merges para título y subtítulos ──────────────────────
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: COL_COUNT - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: COL_COUNT - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: COL_COUNT - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: COL_COUNT - 1 } },
  ];

  const setCell = (r, c, style) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    if (!ws[ref]) ws[ref] = { t: "s", v: "" };
    ws[ref].s = { ...(ws[ref].s || {}), ...style };
  };

  // ── Estilo título ─────────────────────────────────────────
  setCell(0, 0, {
    font: { bold: true, sz: 16, color: { rgb: COLORS.onPrimary } },
    fill: { fgColor: { rgb: COLORS.primary } },
    alignment: { horizontal: "left", vertical: "center" },
  });
  for (let c = 1; c < COL_COUNT; c++) {
    setCell(0, c, { fill: { fgColor: { rgb: COLORS.primary } } });
  }

  // ── Subtítulos ────────────────────────────────────────────
  [1, 2, 3].forEach((r) => {
    setCell(r, 0, {
      font: {
        sz: 11,
        color: { rgb: COLORS.onSurfaceVariant },
        italic: r === 3,
      },
      fill: { fgColor: { rgb: COLORS.surfaceContainerLow } },
    });
    for (let c = 1; c < COL_COUNT; c++) {
      setCell(r, c, { fill: { fgColor: { rgb: COLORS.surfaceContainerLow } } });
    }
  });

  // ── Encabezados de tabla ─────────────────────────────────
  headers.forEach((_, c) => {
    setCell(HEADER_ROW - 1, c, {
      font: { bold: true, sz: 11, color: { rgb: COLORS.onPrimary } },
      fill: { fgColor: { rgb: COLORS.primary } },
      alignment: {
        horizontal: c === 0 ? "left" : "center",
        vertical: "center",
      },
      border: thinBorder,
    });
  });

  // ── Filas de datos (con cebra + formato) ─────────────────
  dataRows.forEach((row, i) => {
    const r = DATA_START_ROW - 1 + i;
    const isEven = i % 2 === 0;
    const bgColor = isEven ? COLORS.surfaceContainerLowest : COLORS.surfaceContainerLow;

    // Producto
    setCell(r, 0, {
      font: { color: { rgb: COLORS.onSurface }, bold: true, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "left", vertical: "center" },
      border: thinBorder,
    });

    // Entradas / Salidas / % del total / Stock actual
    [1, 2, 3, 5].forEach((c) => {
      setCell(r, c, {
        font: { color: { rgb: COLORS.onSurfaceVariant }, sz: 10 },
        fill: { fgColor: { rgb: bgColor } },
        alignment: { horizontal: "center", vertical: "center" },
        border: thinBorder,
      });
    });

    // Nivel de rotación (color según nivel)
    const nivel = row[4];
    const nivelColors =
      nivel === "Alta"
        ? { bg: "C4EED0", fg: "0C6B2E" }
        : nivel === "Media"
          ? { bg: "FFE8B0", fg: "7A5200" }
          : { bg: COLORS.surfaceContainerLow, fg: COLORS.onSurfaceVariant };
    setCell(r, 4, {
      font: { color: { rgb: nivelColors.fg }, bold: true, sz: 10 },
      fill: { fgColor: { rgb: nivelColors.bg } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });

    // Requiere reabastecimiento
    const requiere = row[6] === "Sí";
    setCell(r, 6, {
      font: {
        color: { rgb: requiere ? COLORS.onErrorContainer : COLORS.onSurfaceVariant },
        bold: requiere,
        sz: 10,
      },
      fill: { fgColor: { rgb: requiere ? COLORS.errorContainer : bgColor } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });

    // Sugerencia de compra
    setCell(r, 7, {
      font: { color: { rgb: COLORS.onPrimaryFixedVariant }, bold: true, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });
  });

  // ── Fijar encabezado y activar autofiltro ─────────────────
  ws["!freeze"] = { xSplit: 0, ySplit: HEADER_ROW };
  ws["!autofilter"] = {
    ref: `A${HEADER_ROW}:H${DATA_START_ROW + dataRows.length - 1}`,
  };
  ws["!rows"] = [{ hpt: 26 }, { hpt: 16 }, { hpt: 16 }, { hpt: 16 }, { hpt: 6 }, { hpt: 22 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rotación de productos");

  XLSX.writeFile(wb, `reporte_rotacion_${startDate ?? "inicio"}_a_${endDate ?? "fin"}.xlsx`);
};
