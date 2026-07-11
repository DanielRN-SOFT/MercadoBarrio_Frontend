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

const currencyFmt = '"$"#,##0';

export const exportSalesToExcel = (sales, { scope = "page", filtersSummary = "" } = {}) => {
  const headers = ["# Venta", "Fecha", "Total", "Estado"];
  const now = new Date();
  const exportedAt = now.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ── Construir filas de datos ─────────────────────────────
  const dataRows = sales.map((s) => [s.id, new Date(s.date), Number(s.total), s.status === "Completed" ? "Completada" : "Cancelada"]);

  const totalGeneral = sales.filter((s) => s.status === "Completed").reduce((acc, s) => acc + Number(s.total), 0);

  // Layout de filas:
  // 1: título
  // 2: subtítulo (filtros / alcance)
  // 3: fecha de exportación
  // 4: (vacía)
  // 5: encabezados
  // 6..N: datos
  // N+1: total
  const HEADER_ROW = 4;
  const DATA_START_ROW = HEADER_ROW + 1;
  const totalRowIndex = DATA_START_ROW + dataRows.length;

  const aoa = [
    ["Reporte de Ventas"],
    [scope === "all" ? "Todos los resultados filtrados" : `Página actual`],
    [`Generado el ${exportedAt}${filtersSummary ? " · " + filtersSummary : ""}`],
    [],
    headers,
    ...dataRows,
    ["", "", "", ""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ── Anchos de columna ─────────────────────────────────────
  ws["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 16 }];

  // ── Merges para título y subtítulos ──────────────────────
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 2 } },
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
  for (let c = 1; c <= 3; c++) {
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
    for (let c = 1; c <= 3; c++) {
      setCell(r, c, { fill: { fgColor: { rgb: COLORS.surfaceContainerLow } } });
    }
  });

  // ── Encabezados de tabla ─────────────────────────────────
  headers.forEach((_, c) => {
    setCell(HEADER_ROW, c, {
      font: { bold: true, sz: 11, color: { rgb: COLORS.onPrimary } },
      fill: { fgColor: { rgb: COLORS.primary } },
      alignment: {
        horizontal: c === 1 ? "left" : "center",
        vertical: "center",
      },
      border: thinBorder,
    });
  });

  // ── Filas de datos (con cebra + formato) ─────────────────
  dataRows.forEach((row, i) => {
    const r = DATA_START_ROW + i;
    const isEven = i % 2 === 0;
    const bgColor = isEven ? COLORS.surfaceContainerLowest : COLORS.surfaceContainerLow;

    // # Venta
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

    // Total
    const totalRef = XLSX.utils.encode_cell({ r, c: 2 });
    ws[totalRef].z = currencyFmt;
    setCell(r, 2, {
      font: { color: { rgb: COLORS.primary }, bold: true, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "right", vertical: "center" },
      border: thinBorder,
    });

    // Estado (badge de color)
    const isCompleted = row[3] === "Completada";
    setCell(r, 3, {
      font: {
        color: {
          rgb: isCompleted ? COLORS.onPrimaryFixedVariant : COLORS.onErrorContainer,
        },
        bold: true,
        sz: 10,
      },
      fill: {
        fgColor: {
          rgb: isCompleted ? COLORS.primaryFixed : COLORS.errorContainer,
        },
      },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });
  });

  // ── Fila de total general ─────────────────────────────────
  setCell(totalRowIndex, 0, {
    font: { bold: true, sz: 11, color: { rgb: COLORS.onSurface } },
    fill: { fgColor: { rgb: COLORS.secondary } },
    alignment: { horizontal: "right", vertical: "center" },
  });
  ws[XLSX.utils.encode_cell({ r: totalRowIndex, c: 0 })].v = "TOTAL VENTAS COMPLETADAS";
  ws[XLSX.utils.encode_cell({ r: totalRowIndex, c: 0 })].s.font.color = {
    rgb: COLORS.onPrimary,
  };

  const totalValRef = XLSX.utils.encode_cell({ r: totalRowIndex, c: 3 });
  ws[totalValRef] = { t: "n", v: totalGeneral, z: currencyFmt };
  setCell(totalRowIndex, 3, {
    font: { bold: true, sz: 11, color: { rgb: COLORS.onPrimary } },
    fill: { fgColor: { rgb: COLORS.secondary } },
    alignment: { horizontal: "right", vertical: "center" },
  });
  setCell(totalRowIndex, 1, { fill: { fgColor: { rgb: COLORS.secondary } } });
  setCell(totalRowIndex, 2, { fill: { fgColor: { rgb: COLORS.secondary } } });

  // ── Fijar encabezado y activar autofiltro ─────────────────
  ws["!freeze"] = { xSplit: 0, ySplit: HEADER_ROW + 1 };
  ws["!autofilter"] = {
    ref: `A${HEADER_ROW + 1}:D${DATA_START_ROW + dataRows.length - 1}`,
  };
  ws["!rows"] = [{ hpt: 26 }, { hpt: 18 }, { hpt: 16 }, { hpt: 6 }, { hpt: 22 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ventas");

  const filename = scope === "all" ? "ventas_todas_las_paginas.xlsx" : `ventas_pagina.xlsx`;
  XLSX.writeFile(wb, filename);
};
