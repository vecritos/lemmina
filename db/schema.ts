import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const claims = sqliteTable("claims", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  statement: text("statement").notNull(),
  status: text("status").notNull().default("incomplete"),
  kind: text("kind").notNull().default("Claim"),
  risk: text("risk").notNull().default("Not yet reviewed."),
  evidence: integer("evidence").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_claims_updated_at").on(table.updatedAt)]);

export const claimDependencies = sqliteTable("claim_dependencies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  claimId: text("claim_id").notNull().references(() => claims.id, { onDelete: "cascade" }),
  dependencyId: text("dependency_id").notNull().references(() => claims.id, { onDelete: "cascade" }),
}, (table) => [
  index("idx_claim_dependencies_claim_id").on(table.claimId),
  uniqueIndex("idx_claim_dependencies_pair").on(table.claimId, table.dependencyId),
]);
