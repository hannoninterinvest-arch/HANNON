import { HttpError } from "./http";

type Body = Record<string, unknown>;
type Current = Record<string, unknown>;

export const DETAIL_COLUMNS = [
  "riskLevel",
  "instrument",
  "maxInvestment",
  "ticketStep",
  "closingDate",
  "payoutFrequency",
  "exitStrategy",
  "securityGuarantees",
  "useOfProceeds",
  "capitalStructure",
  "ticketTiers",
  "milestones",
  "risks",
] as const;

export const DETAIL_SELECT = DETAIL_COLUMNS.map((column) =>
  column === "closingDate"
    ? `to_char("closingDate", 'YYYY-MM-DD') AS "closingDate"`
    : `"${column}"`,
).join(", ");

const JSON_COLUMNS = new Set(["useOfProceeds", "capitalStructure", "ticketTiers", "milestones", "risks"]);

function isEmpty(value: unknown) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

function text(value: unknown, max: number, label: string) {
  if (isEmpty(value)) return null;
  const result = String(value).trim();
  if (result.length > max) throw new HttpError(400, `${label} is too long.`);
  return result;
}

function amount(value: unknown, label: string) {
  if (isEmpty(value)) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > 1e13) {
    throw new HttpError(400, `${label} is invalid.`);
  }
  return number;
}

function list(value: unknown, max: number, label: string) {
  if (value == null || value === "") return [];
  if (!Array.isArray(value)) throw new HttpError(400, `${label} must be a list.`);
  if (value.length > max) throw new HttpError(400, `${label} accepts at most ${max} rows.`);
  return value as unknown[];
}

function row(value: unknown, label: string) {
  if (!value || typeof value !== "object") throw new HttpError(400, `${label} contains an invalid row.`);
  return value as Record<string, unknown>;
}

function allocation(value: unknown, label: string) {
  const items = list(value, 10, label).map((raw) => {
    const item = row(raw, label);
    const name = String(item.label ?? "").trim();
    const percent = Number(item.percent);
    if (!name || name.length > 80) throw new HttpError(400, `${label}: each row needs a label (80 characters max).`);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw new HttpError(400, `${label}: percentages must be between 0 and 100.`);
    }
    return { label: name, percent };
  });
  const total = items.reduce((sum, item) => sum + item.percent, 0);
  if (total > 100.01) throw new HttpError(400, `${label}: the percentages add up to more than 100%.`);
  return items;
}

function tiers(value: unknown) {
  return list(value, 6, "Ticket tiers").map((raw) => {
    const item = row(raw, "Ticket tiers");
    const name = String(item.label ?? "").trim();
    const value = Number(item.amount);
    if (!name || name.length > 80) throw new HttpError(400, "Ticket tiers: each tier needs a name.");
    if (!Number.isFinite(value) || value <= 0 || value > 1e13) {
      throw new HttpError(400, "Ticket tiers: each tier needs a valid amount.");
    }
    return { label: name, amount: value, note: text(item.note, 200, "A tier description") ?? "" };
  });
}

function milestones(value: unknown) {
  return list(value, 10, "Timeline").map((raw) => {
    const item = row(raw, "Timeline");
    const name = String(item.label ?? "").trim();
    if (!name || name.length > 120) throw new HttpError(400, "Timeline: each step needs a title.");
    const status = item.status;
    if (status !== "done" && status !== "active" && status !== "upcoming") {
      throw new HttpError(400, "Timeline: invalid step status.");
    }
    return { label: name, date: text(item.date, 40, "A step date") ?? "", status };
  });
}

function risks(value: unknown) {
  return list(value, 10, "Risks")
    .map((raw) => String(raw ?? "").trim())
    .filter(Boolean)
    .map((item) => {
      if (item.length > 240) throw new HttpError(400, "A risk description is too long.");
      return item;
    });
}

function closingDate(value: unknown) {
  if (isEmpty(value)) return null;
  const raw = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw))) {
    throw new HttpError(400, "The closing date is invalid.");
  }
  return raw;
}

function readOne(column: (typeof DETAIL_COLUMNS)[number], value: unknown) {
  switch (column) {
    case "riskLevel":
      if (isEmpty(value)) return null;
      if (value !== "low" && value !== "medium" && value !== "high") {
        throw new HttpError(400, "The risk level is invalid.");
      }
      return value;
    case "instrument":
      return text(value, 120, "The instrument");
    case "payoutFrequency":
      return text(value, 60, "The payout frequency");
    case "exitStrategy":
      return text(value, 3000, "The exit strategy");
    case "securityGuarantees":
      return text(value, 3000, "The security and guarantees");
    case "maxInvestment":
      return amount(value, "The maximum ticket");
    case "ticketStep":
      return amount(value, "The ticket increment");
    case "closingDate":
      return closingDate(value);
    case "useOfProceeds":
      return allocation(value, "Use of proceeds");
    case "capitalStructure":
      return allocation(value, "Capital structure");
    case "ticketTiers":
      return tiers(value);
    case "milestones":
      return milestones(value);
    case "risks":
      return risks(value);
  }
}

export function readDetails(body: Body, current?: Current, minInvestment?: number) {
  const values: Record<string, unknown> = {};
  for (const column of DETAIL_COLUMNS) {
    values[column] =
      column in body ? readOne(column, body[column]) : current ? current[column] ?? null : readOne(column, undefined);
  }
  const max = values.maxInvestment == null ? null : Number(values.maxInvestment);
  if (max != null && minInvestment != null && max < minInvestment) {
    throw new HttpError(400, "The maximum ticket cannot be lower than the minimum ticket.");
  }
  return values;
}

export function detailParams(values: Record<string, unknown>) {
  return DETAIL_COLUMNS.map((column) =>
    JSON_COLUMNS.has(column) ? JSON.stringify(values[column] ?? []) : values[column] ?? null,
  );
}

export function detailPlaceholders(start: number) {
  return DETAIL_COLUMNS.map((column, i) =>
    `$${start + i}${JSON_COLUMNS.has(column) ? "::jsonb" : column === "closingDate" ? "::date" : ""}`,
  );
}

export function detailAssignments(start: number) {
  return DETAIL_COLUMNS.map((column, i) => {
    const placeholder = detailPlaceholders(start)[i];
    return `"${column}" = ${placeholder}`;
  });
}
