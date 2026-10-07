import bcrypt from "bcryptjs";
import type { PoolClient } from "pg";
import { normalizeName, slugify } from "./slug";

const CLOUD = "https://res.cloudinary.com/dbzweuzla/image/upload";

const HANNON_SERVICES = [
  "HANNON Finance",
  "HANNON Tech",
  "HANNON Artisanal",
  "HANNON Prod",
  "HANNON Affichage Urbain — Publicité de rue",
  "HANNON Investissement et Management Transitoire",
  "HANNON Education Tech",
  "HANNON Recherche et Développement",
  "HANNON Healthcare",
  "HANNON Énergie",
  "HANNON Startups",
  "HANNON Commerce International",
  "HANNON IA",
  "HANNON Agriculture",
];

type Sample = {
  title: string;
  slug: string;
  sector: string;
  location: string;
  summary: string;
  description: string;
  imageUrl: string;
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  expectedReturn: number;
  durationMonths: number;
  highlights: string[];
};

const PROJECTS: Sample[] = [
  {
    title: "West Africa Solar Corridor",
    slug: "west-africa-solar-corridor",
    sector: "Energy",
    location: "Ghana · Côte d'Ivoire",
    summary: "Utility-scale solar generation and grid interconnection serving industrial corridors.",
    description:
      "A 420 MW solar corridor with storage support, structured as a blended-finance vehicle for institutional and family-office capital. The platform combines sovereign offtake, DFI guarantees, and senior project debt to deliver contracted cash flows with a target net IRR of 11.5%.",
    imageUrl: `${CLOUD}/v1786386096/630292ea-2558-499a-b414-3180fabd058b.jfif_2K_202608101920_asse86.jpg`,
    targetAmount: 85000000,
    raisedAmount: 41200000,
    minInvestment: 250000,
    expectedReturn: 11.5,
    durationMonths: 84,
    highlights: ["Sovereign offtake agreements", "DFI first-loss tranche", "Grid interconnection secured"],
  },
  {
    title: "Tunis Logistics Gateway",
    slug: "tunis-logistics-gateway",
    sector: "Infrastructure",
    location: "Tunis, Tunisia",
    summary: "Modern logistics and cold-chain platform serving North African trade routes.",
    description:
      "Development of a bonded logistics park with cold storage, last-mile distribution, and customs-integrated warehousing. Capital is deployed into income-producing assets with contracted occupancy from regional distributors and agri-exporters.",
    imageUrl: `${CLOUD}/v1786403692/footer_dyjgmz.webp`,
    targetAmount: 42000000,
    raisedAmount: 18600000,
    minInvestment: 100000,
    expectedReturn: 9.8,
    durationMonths: 60,
    highlights: ["Pre-leased occupancy 62%", "Free-zone tax framework", "Export corridor access"],
  },
  {
    title: "Maghreb Green Hydrogen Hub",
    slug: "maghreb-green-hydrogen-hub",
    sector: "Energy Transition",
    location: "Morocco · Mauritania",
    summary: "Early-stage hydrogen and derivative fuels platform for European offtake.",
    description:
      "A phased green hydrogen development anchored by renewable generation, desalination, and ammonia conversion. The investment thesis is built on European import demand, concessional climate finance, and long-dated offtake discussions with industrial buyers.",
    imageUrl: `${CLOUD}/v1786386096/630292ea-2558-499a-b414-3180fabd058b.jfif_2K_202608101920_asse86.jpg`,
    targetAmount: 120000000,
    raisedAmount: 27500000,
    minInvestment: 500000,
    expectedReturn: 13.2,
    durationMonths: 96,
    highlights: ["Climate-aligned capital stack", "Phased construction risk", "EU industrial offtake path"],
  },
  {
    title: "Affordable Housing Tunisia",
    slug: "affordable-housing-tunisia",
    sector: "Real Estate",
    location: "Grand Tunis",
    summary: "Mid-market residential programme with institutional co-investment.",
    description:
      "A multi-phase residential programme delivering 1,200 units with a mix of home-ownership and yield-bearing rental stock. Structuring includes local bank financing, a mezzanine sleeve, and an equity vehicle for qualified investors.",
    imageUrl: `${CLOUD}/v1786403136/WhatsApp_Image_2026-08-07_at_10.32.35_kzawur.jpg`,
    targetAmount: 28000000,
    raisedAmount: 15400000,
    minInvestment: 75000,
    expectedReturn: 8.4,
    durationMonths: 48,
    highlights: ["Bankable local demand", "Staged land release", "Rental yield overlay"],
  },
];

export async function seed(client: PoolClient) {
  await ensureAdmin(client);
  await ensureDemoInvestors(client);
  await ensureProjects(client);
  await ensureHannonServices(client);
}

async function ensureAdmin(client: PoolClient) {
  const email = (process.env.ADMIN_EMAIL || "admin@hannoninterinvest.com").toLowerCase();
  const existing = await client.query(
    `SELECT id, password, role::text AS role, status::text AS status
     FROM users WHERE lower(email) = $1`,
    [email],
  );
  if (existing.rowCount) {
    const row = existing.rows[0] as { id: string; password: string | null; role: string | null; status: string | null };
    if (row.password && row.role && row.status) return;
    const password = row.password || (await bcrypt.hash(process.env.ADMIN_PASSWORD || "HannonAdmin2026!", 12));
    await client.query(
      `UPDATE users
          SET password = COALESCE(NULLIF(password, ''), $2),
              role = COALESCE(role, 'admin'),
              status = COALESCE(status, 'approved'),
              "updatedAt" = now()
        WHERE id = $1`,
      [row.id, password],
    );
    return;
  }
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "HannonAdmin2026!", 12);
  await client.query(
    `INSERT INTO users (email, password, "firstName", "lastName", company, role, status)
     SELECT $1::text, $2::text, 'HANNON', 'Administrator', 'HANNON International Investments Ltd', 'admin', 'approved'
     WHERE NOT EXISTS (SELECT 1 FROM users WHERE lower(email::text) = lower($1::text))`,
    [email, password],
  );
}

async function ensureDemoInvestors(client: PoolClient) {
  const existing = await client.query(`SELECT id FROM users WHERE email = $1`, [
    "investor@hannoninterinvest.com",
  ]);
  if (existing.rowCount) return;
  const password = await bcrypt.hash("Investor2026!", 12);
  await client.query(
    `INSERT INTO users (email, password, "firstName", "lastName", company, phone, role, status)
     SELECT $1::text, $2::text, 'Amine', 'Ben Salah', 'Atlas Capital Partners', '+216 20 000 000', 'investor', 'approved'
     WHERE NOT EXISTS (SELECT 1 FROM users WHERE lower(email::text) = lower($1::text))`,
    ["investor@hannoninterinvest.com", password],
  );
  await client.query(
    `INSERT INTO users (email, password, "firstName", "lastName", company, role, status)
     SELECT $1::text, $2::text, 'Leila', 'Mansour', 'Medina Family Office', 'investor', 'pending'
     WHERE NOT EXISTS (SELECT 1 FROM users WHERE lower(email::text) = lower($1::text))`,
    ["pending@hannoninterinvest.com", password],
  );
}

async function ensureProjects(client: PoolClient) {
  const count = await client.query(`SELECT COUNT(*)::int AS count FROM projects`);
  if (Number(count.rows[0]?.count) > 0) return;
  for (const sample of PROJECTS) {
    const inserted = await client.query(
      `INSERT INTO projects
        (title, slug, description, summary, sector, location, "imageUrl",
         "targetAmount", "raisedAmount", "minInvestment", "expectedReturn",
         "durationMonths", status, visible, highlights)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'open',true,$13)
       RETURNING id`,
      [
        sample.title,
        sample.slug,
        sample.description,
        sample.summary,
        sample.sector,
        sample.location,
        sample.imageUrl,
        sample.targetAmount,
        sample.raisedAmount,
        sample.minInvestment,
        sample.expectedReturn,
        sample.durationMonths,
        sample.highlights.join(","),
      ],
    );
    const projectId = inserted.rows[0].id as string;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    for (let i = 0; i < months.length; i += 1) {
      const progress = (i + 1) / months.length;
      await client.query(
        `INSERT INTO project_stats
          (label, "sortOrder", "capitalRaised", "investorsCount", "projectedReturn", "projectId")
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          `${months[i]} 2026`,
          i,
          Math.round(sample.raisedAmount * (0.35 + progress * 0.65)),
          Math.max(2, Math.round(progress * 22)),
          Number((sample.expectedReturn * (0.4 + progress * 0.6)).toFixed(2)),
          projectId,
        ],
      );
    }
  }
}

async function ensureHannonServices(client: PoolClient) {
  const existing = await client.query(`SELECT name, slug, "sortOrder" FROM services`);
  const knownNames = new Set(existing.rows.map((row) => normalizeName(String(row.name))));
  const knownSlugs = new Set(existing.rows.map((row) => String(row.slug)));
  let order =
    existing.rows.reduce((max, row) => Math.max(max, Number(row.sortOrder)), -1) + 1;

  for (const name of HANNON_SERVICES) {
    const slug = slugify(name);
    if (knownNames.has(normalizeName(name)) || knownSlugs.has(slug)) continue;
    await client.query(
      `INSERT INTO services (name, slug, description, "sortOrder", status, "placeholdersPrepared")
       VALUES ($1, $2, '', $3, 'draft', false)
       ON CONFLICT (slug) DO NOTHING`,
      [name, slug, order],
    );
    knownNames.add(normalizeName(name));
    knownSlugs.add(slug);
    order += 1;
  }
  await ensureFinancePlaceholders(client);
}

async function ensureFinancePlaceholders(client: PoolClient) {
  const services = await client.query(
    `SELECT id, name, "placeholdersPrepared" FROM services`,
  );
  const finance = services.rows.find(
    (row) => normalizeName(String(row.name)) === normalizeName("HANNON Finance"),
  );
  if (!finance || finance.placeholdersPrepared) return;

  const platforms = await client.query(
    `SELECT id FROM service_platforms WHERE "serviceId" = $1`,
    [finance.id],
  );
  if (!platforms.rowCount) {
    for (let index = 0; index < 3; index += 1) {
      await client.query(
        `INSERT INTO service_platforms
          ("serviceId", name, description, link, "imageUrl", "imagePublicId",
           "secondImageUrl", "secondImagePublicId", "sortOrder", status)
         VALUES ($1, '', '', NULL, NULL, NULL, NULL, NULL, $2, 'draft')`,
        [finance.id, index],
      );
    }
  }
  await client.query(`UPDATE services SET "placeholdersPrepared" = true WHERE id = $1`, [
    finance.id,
  ]);
}
