import * as XLSX from "xlsx-js-style";

// Paleta tomada del theme de la app
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

const TYPE_LABELS = {
  Entry: "Entrada",
  Exit: "Salida",
  AdjustEntry: "Ajuste (+)",
  AdjustExit: "Ajuste (-)",
};

export const exportMovementsToExcel = (movements, { scope = "page", filtersSummary = "" } = {}) => {
  const headers = ["# Movimiento", "Fecha", "Tipo", "Productos", "Motivo", "Estado"];
  const now = new Date();
  const exportedAt = now.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ── Construir filas de datos ─────────────────────────────
  const dataRows = movements.map((m) => [
    m.id,
    new Date(m.date),
    TYPE_LABELS[m.type] ?? m.type,
    (m.details ?? []).map((d) => `${d.product?.name ?? d.productId} (${d.quantity})`).join(", "),
    m.reason || "—",
    m.status === "Cancelled" ? "Cancelado" : "Activo",
  ]);

  // Layout de filas:
  // 1: título
  // 2: subtítulo (filtros / alcance)
  // 3: fecha de exportación
  // 4: (vacía)
  // 5: encabezados
  // 6..N: datos
  const HEADER_ROW = 5;
  const DATA_START_ROW = HEADER_ROW + 1;

  const aoa = [
    ["Reporte de Movimientos de Inventario"],
    [scope === "all" ? "Todos los resultados filtrados" : `Página actual`],
    [`Generado el ${exportedAt}${filtersSummary ? " · " + filtersSummary : ""}`],
    [],
    headers,
    ...dataRows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ── Anchos de columna ─────────────────────────────────────
  ws["!cols"] = [{ wch: 13 }, { wch: 22 }, { wch: 14 }, { wch: 45 }, { wch: 28 }, { wch: 12 }];

  // ── Merges para título y subtítulos ──────────────────────
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
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
  for (let c = 1; c <= 5; c++) {
    setCell(0, c, { fill: { fgColor: { rgb: COLORS.primary } } });
  }

  // ── Subtítulos ────────────────────────────────────────────
  [1, 2].forEach((r) => {
    setCell(r, 0, {
      font: {
        sz: 11,
        color: { rgb: COLORS.onSurfaceVariant },
        italic: r === 2,
      },
      fill: { fgColor: { rgb: COLORS.surfaceContainerLow } },
    });
    for (let c = 1; c <= 5; c++) {
      setCell(r, c, { fill: { fgColor: { rgb: COLORS.surfaceContainerLow } } });
    }
  });

  // ── Encabezados de tabla ─────────────────────────────────
  // HEADER_ROW/DATA_START_ROW son índices "1-based" pensados para las
  // fórmulas de rango de Excel (!autofilter) más abajo. encode_cell/setCell,
  // en cambio, esperan índices 0-based -> por eso el -1 en ambos bloques.
  headers.forEach((_, c) => {
    setCell(HEADER_ROW - 1, c, {
      font: { bold: true, sz: 11, color: { rgb: COLORS.onPrimary } },
      fill: { fgColor: { rgb: COLORS.primary } },
      alignment: {
        horizontal: c === 3 || c === 4 ? "left" : "center",
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

    // # Movimiento
    setCell(r, 0, {
      font: { color: { rgb: COLORS.onSurface }, bold: true, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });

    // Fecha
    const dateRef = XLSX.utils.encode_cell({ r, c: 1 });
    ws[dateRef].z = "dd/mm/yyyy hh:mm";
    setCell(r, 1, {
      font: { color: { rgb: COLORS.onSurfaceVariant }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "left", vertical: "center" },
      border: thinBorder,
    });

    // Tipo
    setCell(r, 2, {
      font: { color: { rgb: COLORS.primary }, bold: true, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });

    // Productos
    setCell(r, 3, {
      font: { color: { rgb: COLORS.onSurface }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
      border: thinBorder,
    });

    // Motivo
    setCell(r, 4, {
      font: { color: { rgb: COLORS.onSurfaceVariant }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "left", vertical: "center" },
      border: thinBorder,
    });

    // Estado (badge de color)
    const isActive = row[5] === "Activo";
    setCell(r, 5, {
      font: {
        color: {
          rgb: isActive ? COLORS.onPrimaryFixedVariant : COLORS.onErrorContainer,
        },
        bold: true,
        sz: 10,
      },
      fill: {
        fgColor: { rgb: isActive ? COLORS.primaryFixed : COLORS.errorContainer },
      },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });
  });

  // ── Fijar encabezado y activar autofiltro ─────────────────
  ws["!freeze"] = { xSplit: 0, ySplit: HEADER_ROW };
  ws["!autofilter"] = {
    ref: `A${HEADER_ROW}:F${DATA_START_ROW + dataRows.length - 1}`,
  };
  ws["!rows"] = [{ hpt: 26 }, { hpt: 18 }, { hpt: 16 }, { hpt: 6 }, { hpt: 22 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

  const filename = scope === "all" ? "movimientos_todas_las_paginas.xlsx" : "movimientos_pagina.xlsx";
  XLSX.writeFile(wb, filename);
};
