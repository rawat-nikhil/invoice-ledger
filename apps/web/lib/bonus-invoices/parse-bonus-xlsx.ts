import { read, utils } from "xlsx";

const HEADER_ALIASES: Record<string, string[]> = {
  payCode: ["pay_code", "paycode", "employee_code", "employeecode", "code"],
  name: ["name", "employee_name", "employeename"],
  totalDays: ["total_days", "totaldays", "days"],
  bonus: ["total_bonus", "totalbonus", "bonus"],
};

export type BonusImportRow = {
  payCode: string;
  name: string;
  totalDays: number;
  bonus: number;
};

export type BonusXlsxImportResult = {
  rows: BonusImportRow[];
  skippedZeroBonus: number;
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

function buildHeaderIndex(headerRow: unknown[]): Map<string, number> {
  const index = new Map<string, number>();

  headerRow.forEach((cell, columnIndex) => {
    if (typeof cell !== "string" && typeof cell !== "number") {
      return;
    }

    const normalized = normalizeHeader(String(cell));

    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(normalized) && !index.has(field)) {
        index.set(field, columnIndex);
      }
    }
  });

  return index;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function sheetHasBonusColumn(grid: unknown[][]): boolean {
  const headerRow = grid[0] ?? [];
  return buildHeaderIndex(headerRow).has("bonus");
}

export async function parseBonusXlsxFile(file: File): Promise<BonusXlsxImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: "array" });

  if (workbook.SheetNames.length === 0) {
    throw new Error("The workbook has no sheets.");
  }

  let sheetName = workbook.SheetNames.find((name) => {
    const grid = utils.sheet_to_json<unknown[]>(workbook.Sheets[name], {
      header: 1,
      blankrows: false,
    });
    return sheetHasBonusColumn(grid);
  });

  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }

  const grid = utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    blankrows: false,
  });

  if (grid.length === 0) {
    throw new Error("The sheet is empty.");
  }

  const [headerRow, ...dataRows] = grid;
  const headerIndex = buildHeaderIndex(headerRow);
  const payCodeColumn = headerIndex.get("payCode");
  const nameColumn = headerIndex.get("name");
  const bonusColumn = headerIndex.get("bonus");
  const totalDaysColumn = headerIndex.get("totalDays");

  if (
    payCodeColumn === undefined ||
    nameColumn === undefined ||
    bonusColumn === undefined
  ) {
    throw new Error(
      'Could not find bonus columns. Expected headers: pay_code, name, total_days, total_bonus.',
    );
  }

  const rows: BonusImportRow[] = [];
  let skippedZeroBonus = 0;

  for (const row of dataRows) {
    const rawName = row[nameColumn];
    const name = rawName === undefined || rawName === null ? "" : String(rawName).trim();
    const rawCode = row[payCodeColumn];
    const payCode =
      rawCode === undefined || rawCode === null ? "" : String(rawCode).trim().toUpperCase();

    if (name === "" && payCode === "") {
      continue;
    }

    if (name.toUpperCase() === "TOTAL") {
      continue;
    }

    const bonus = toNumber(row[bonusColumn]);

    if (bonus <= 0) {
      skippedZeroBonus += 1;
      continue;
    }

    if (payCode === "" || name === "") {
      throw new Error("Each bonus row needs a pay code and a name.");
    }

    rows.push({
      payCode,
      name,
      totalDays: toNumber(totalDaysColumn === undefined ? 0 : row[totalDaysColumn]),
      bonus,
    });
  }

  if (rows.length === 0) {
    throw new Error("No bonus rows found in the spreadsheet.");
  }

  return { rows, skippedZeroBonus };
}
