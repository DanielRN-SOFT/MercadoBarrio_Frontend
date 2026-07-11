import * as XLSX from "xlsx-js-style";

// Misma paleta que exportSalesToExcel.js, para que ambos reportes se vean
// consistentes con el theme de la app.
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

// Aplana cada venta a una fila por línea de producto. Los valores a nivel
// de venta (# venta, fecha, total, estado) se repiten a propósito en cada
// fila de producto: es la forma correcta para que el contador pueda filtrar
// o hacer tablas dinámicas en Excel sin que celdas combinadas rompan esas
// funciones.
const flattenSales = (sales) => {
  const rows = [];
  sales.forEach((sale) => {
    const details = sale.details ?? [];
    if (details.length === 0) {
      // Venta sin detalle (no debería pasar, pero se exporta igual para no perder el registro)
      rows.push({
        saleId: sale.id,
        date: sale.date,
        productName: "—",
        categoryName: "—",
        unitName: "—",
        quantity: 0,
        unitPrice: 0,
        subtotal: 0,
        saleTotal: Number(sale.total),
        status: sale.status,
        isFirstOfSale: true,
      });
      return;
    }
    details.forEach((d, i) => {
      rows.push({
        saleId: sale.id,
        date: sale.date,
        productName: d.product?.name ?? "—",
        categoryName: d.product?.productCategory?.name ?? "—",
        unitName: d.product?.unitOfMeasure?.name ?? "—",
        quantity: Number(d.quantity),
        unitPrice: Number(d.unitPrice),
        subtotal: Number(d.subtotal),
        saleTotal: Number(sale.total),
        status: sale.status,
        isFirstOfSale: i === 0,
      });
    });
  });
  return rows;
};

export const exportSalesDetailedToExcel = (sales, { scope = "page", filtersSummary = "" } = {}) => {
  const headers = [
    "# Venta",
    "Fecha",
    "Producto",
    "Categoría",
    "Unidad",
    "Cantidad",
    "Precio unitario",
    "Subtotal",
    "Total venta",
    "Estado",
  ];
  const now = new Date();
  const exportedAt = now.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const flatRows = flattenSales(sales);

  const dataRows = flatRows.map((r) => [
    r.saleId,
    new Date(r.date),
    r.productName,
    r.categoryName,
    r.unitName,
    r.quantity,
    r.unitPrice,
    r.subtotal,
    r.saleTotal,
    r.status === "Completed" ? "Completada" : "Cancelada",
  ]);

  // Total general recalculado a nivel de línea de producto (solo ventas completadas)
  const totalGeneral = flatRows.filter((r) => r.status === "Completed").reduce((acc, r) => acc + r.subtotal, 0);

  // Layout de filas:
  // 1: título
  // 2: subtítulo (alcance)
  // 3: fecha de exportación
  // 4: (vacía)
  // 5: encabezados
  // 6..N: datos
  // N+1: total
  const HEADER_ROW = 4;
  const DATA_START_ROW = HEADER_ROW + 1;
  const totalRowIndex = DATA_START_ROW + dataRows.length;

  const aoa = [
    ["Reporte de Ventas — Detalle por producto"],
    [scope === "all" ? "Todos los resultados filtrados" : `Página actual`],
    [`Generado el ${exportedAt}${filtersSummary ? " · " + filtersSummary : ""}`],
    [],
    headers,
    ...dataRows,
    Array(headers.length).fill(""),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ── Anchos de columna ─────────────────────────────────────
  ws["!cols"] = [
    { wch: 10 },
    { wch: 20 },
    { wch: 28 },
    { wch: 16 },
    { wch: 12 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];

  const lastCol = headers.length - 1;

  // ── Merges para título y subtítulos ──────────────────────
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } },
    { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: lastCol - 1 } },
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
  for (let c = 1; c <= lastCol; c++) {
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
    for (let c = 1; c <= lastCol; c++) {
      setCell(r, c, { fill: { fgColor: { rgb: COLORS.surfaceContainerLow } } });
    }
  });

  // ── Encabezados de tabla ─────────────────────────────────
  headers.forEach((_, c) => {
    setCell(HEADER_ROW, c, {
      font: { bold: true, sz: 11, color: { rgb: COLORS.onPrimary } },
      fill: { fgColor: { rgb: COLORS.primary } },
      alignment: {
        horizontal: c === 2 ? "left" : "center",
        vertical: "center",
      },
      border: thinBorder,
    });
  });

  // ── Filas de datos (cebra agrupada por venta, no por fila) ───
  // El color alterna solo cuando cambia el # de venta, así las líneas de
  // una misma transacción se leen juntas.
  let groupIndex = 0;
  let lastSaleId = null;
  flatRows.forEach((row, i) => {
    if (row.saleId !== lastSaleId) {
      groupIndex += 1;
      lastSaleId = row.saleId;
    }
    const r = DATA_START_ROW + i;
    const isEven = groupIndex % 2 === 0;
    const bgColor = isEven ? COLORS.surfaceContainerLowest : COLORS.surfaceContainerLow;

    // # Venta (solo se resalta en negrita en la primera línea de cada venta)
    setCell(r, 0, {
      font: {
        color: { rgb: COLORS.onSurface },
        bold: row.isFirstOfSale,
        sz: 10,
      },
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

    // Producto
    setCell(r, 2, {
      font: { color: { rgb: COLORS.onSurface }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "left", vertical: "center" },
      border: thinBorder,
    });

    // Categoría
    setCell(r, 3, {
      font: { color: { rgb: COLORS.onSurfaceVariant }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });

    // Unidad
    setCell(r, 4, {
      font: { color: { rgb: COLORS.onSurfaceVariant }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });

    // Cantidad
    setCell(r, 5, {
      font: { color: { rgb: COLORS.onSurface }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    });

    // Precio unitario
    const unitPriceRef = XLSX.utils.encode_cell({ r, c: 6 });
    ws[unitPriceRef].z = currencyFmt;
    setCell(r, 6, {
      font: { color: { rgb: COLORS.onSurfaceVariant }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "right", vertical: "center" },
      border: thinBorder,
    });

    // Subtotal
    const subtotalRef = XLSX.utils.encode_cell({ r, c: 7 });
    ws[subtotalRef].z = currencyFmt;
    setCell(r, 7, {
      font: { color: { rgb: COLORS.primary }, bold: true, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "right", vertical: "center" },
      border: thinBorder,
    });

    // Total venta (repetido en cada línea a propósito)
    const saleTotalRef = XLSX.utils.encode_cell({ r, c: 8 });
    ws[saleTotalRef].z = currencyFmt;
    setCell(r, 8, {
      font: { color: { rgb: COLORS.onSurfaceVariant }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: "right", vertical: "center" },
      border: thinBorder,
    });

    // Estado (badge de color)
    const isCompleted = row.status === "Completed";
    setCell(r, 9, {
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
    font: { bold: true, sz: 11, color: { rgb: COLORS.onPrimary } },
    fill: { fgColor: { rgb: COLORS.secondary } },
    alignment: { horizontal: "right", vertical: "center" },
  });
  ws[XLSX.utils.encode_cell({ r: totalRowIndex, c: 0 })].v = "TOTAL (líneas de producto, ventas completadas)";

  for (let c = 1; c < lastCol; c++) {
    setCell(totalRowIndex, c, {
      fill: { fgColor: { rgb: COLORS.secondary } },
    });
  }

  const totalValRef = XLSX.utils.encode_cell({ r: totalRowIndex, c: lastCol });
  ws[totalValRef] = { t: "n", v: totalGeneral, z: currencyFmt };
  setCell(totalRowIndex, lastCol, {
    font: { bold: true, sz: 11, color: { rgb: COLORS.onPrimary } },
    fill: { fgColor: { rgb: COLORS.secondary } },
    alignment: { horizontal: "right", vertical: "center" },
  });

  // ── Fijar encabezado y activar autofiltro ─────────────────
  ws["!freeze"] = { xSplit: 0, ySplit: HEADER_ROW + 1 };
  ws["!autofilter"] = {
    ref: `A${HEADER_ROW + 1}:${XLSX.utils.encode_col(lastCol)}${DATA_START_ROW + dataRows.length - 1}`,
  };
  ws["!rows"] = [{ hpt: 26 }, { hpt: 18 }, { hpt: 16 }, { hpt: 6 }, { hpt: 22 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ventas por producto");

  const filename = scope === "all" ? "ventas_detalle_producto_todas_las_paginas.xlsx" : "ventas_detalle_producto_pagina.xlsx";
  XLSX.writeFile(wb, filename);
};
