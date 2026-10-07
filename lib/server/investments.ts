import { one, query } from "./db";
import { HttpError, isUuid } from "./http";
import { getProject } from "./projects";

const REQUEST_COLUMNS = `id, amount, message, status, "createdAt", "updatedAt", "investorId", "projectId"`;

function shape(row: Record<string, any>, project: Record<string, any> | null, investor: Record<string, any> | null) {
  return {
    id: row.id,
    amount: row.amount,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    project,
    investor: investor
      ? {
          id: investor.id,
          email: investor.email,
          firstName: investor.firstName,
          lastName: investor.lastName,
          company: investor.company,
          phone: investor.phone,
          role: investor.role,
          status: investor.status,
          createdAt: investor.createdAt,
        }
      : undefined,
  };
}

async function hydrate(rows: Record<string, any>[]) {
  return Promise.all(
    rows.map(async (row) => {
      const project = row.projectId ? await getProject(String(row.projectId), false).catch(() => null) : null;
      const investor = row.investorId
        ? await one(
            `SELECT id, email, "firstName", "lastName", company, phone, role, status, "createdAt"
             FROM users WHERE id = $1`,
            [row.investorId],
          )
        : null;
      return shape(row, project, investor);
    }),
  );
}

export async function listInvestments() {
  const rows = await query(`SELECT ${REQUEST_COLUMNS} FROM investment_requests ORDER BY "createdAt" DESC`);
  return hydrate(rows);
}

export async function listMyInvestments(userId: string) {
  const rows = await query(
    `SELECT ${REQUEST_COLUMNS} FROM investment_requests WHERE "investorId" = $1 ORDER BY "createdAt" DESC`,
    [userId],
  );
  return hydrate(rows);
}

export async function createInvestment(userId: string, body: Record<string, unknown>) {
  const projectId = String(body.projectId || "");
  if (!isUuid(projectId)) throw new HttpError(400, "projectId is invalid");
  const project = await getProject(projectId, true);
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 1) throw new HttpError(400, "amount is invalid");
  const min = Number(project.minInvestment);
  if (amount < min) {
    throw new HttpError(400, `Minimum investment for this project is ${min.toLocaleString()} USD`);
  }
  const pending = await one(
    `SELECT id FROM investment_requests
     WHERE "investorId" = $1 AND "projectId" = $2 AND status = 'pending'`,
    [userId, projectId],
  );
  if (pending) throw new HttpError(400, "You already have a pending request on this project");
  const message = body.message == null || body.message === "" ? null : String(body.message);
  const inserted = await one(
    `INSERT INTO investment_requests (amount, message, status, "investorId", "projectId")
     VALUES ($1,$2,'pending',$3,$4) RETURNING ${REQUEST_COLUMNS}`,
    [amount, message, userId, projectId],
  );
  const [request] = await hydrate([inserted as Record<string, any>]);
  return request;
}

export async function updateInvestmentStatus(id: string, body: Record<string, unknown>) {
  if (!isUuid(id)) throw new HttpError(404, "Investment request not found");
  const status = body.status;
  if (status !== "pending" && status !== "accepted" && status !== "rejected") {
    throw new HttpError(400, "status is invalid");
  }
  const request = await one(`SELECT ${REQUEST_COLUMNS} FROM investment_requests WHERE id = $1`, [id]);
  if (!request) throw new HttpError(404, "Investment request not found");
  if (request.status !== "pending") {
    throw new HttpError(400, "This request has already been reviewed");
  }
  if (status === "accepted" && request.projectId) {
    await query(
      `UPDATE projects SET "raisedAmount" = "raisedAmount" + $2, "updatedAt" = now() WHERE id = $1`,
      [request.projectId, request.amount],
    );
  }
  const updated = await one(
    `UPDATE investment_requests SET status = $2, "updatedAt" = now() WHERE id = $1 RETURNING ${REQUEST_COLUMNS}`,
    [id, status],
  );
  const [shaped] = await hydrate([updated as Record<string, any>]);
  return shaped;
}
