import Papa from "papaparse";
import { prisma } from "../../lib/prisma";
import { parseDateOnly } from "../../lib/dates";
import { csvRowSchema, CsvRow } from "../../schemas/csv-import.schema";

const DEFAULT_CATEGORY_COLOR = "#6b7280";
const DEFAULT_CATEGORY_ICON = "tag";

export interface CsvRowResult {
  rowNumber: number;
  raw: Record<string, string>;
  valid: boolean;
  errors?: string[];
  data?: CsvRow;
  categoryExists?: boolean;
}

function categoryKey(nombre: string, tipo: string) {
  return `${tipo}::${nombre.trim().toLowerCase()}`;
}

export async function previewCsv(userId: string, buffer: Buffer) {
  const text = buffer.toString("utf-8");
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const existingCategories = await prisma.category.findMany({ where: { userId } });
  const categorySet = new Set(existingCategories.map((c) => categoryKey(c.nombre, c.tipo)));

  const validRows: CsvRowResult[] = [];
  const errorRows: CsvRowResult[] = [];

  parsed.data.forEach((raw, index) => {
    const rowNumber = index + 2; // +1 for header row, +1 for 1-based numbering
    const result = csvRowSchema.safeParse(raw);

    if (!result.success) {
      errorRows.push({
        rowNumber,
        raw,
        valid: false,
        errors: result.error.issues.map((issue) => issue.message),
      });
      return;
    }

    const data = result.data;
    validRows.push({
      rowNumber,
      raw,
      valid: true,
      data,
      categoryExists: categorySet.has(categoryKey(data.category, data.type)),
    });
  });

  return { validRows, errorRows, totalRows: parsed.data.length };
}

export async function confirmImport(userId: string, rows: CsvRow[]) {
  return prisma.$transaction(async (tx) => {
    const categoryCache = new Map<string, string>();
    let imported = 0;

    for (const row of rows) {
      const catKey = categoryKey(row.category, row.type);
      let categoryId = categoryCache.get(catKey);
      if (!categoryId) {
        const category = await tx.category.upsert({
          where: { userId_nombre_tipo: { userId, nombre: row.category, tipo: row.type } },
          update: {},
          create: {
            userId,
            nombre: row.category,
            tipo: row.type,
            color: DEFAULT_CATEGORY_COLOR,
            icono: DEFAULT_CATEGORY_ICON,
          },
        });
        categoryId = category.id;
        categoryCache.set(catKey, categoryId);
      }

      await tx.transaction.create({
        data: {
          userId,
          type: row.type,
          categoryId,
          amount: row.amount,
          description: row.description,
          date: parseDateOnly(row.date),
        },
      });
      imported++;
    }

    return imported;
  });
}
