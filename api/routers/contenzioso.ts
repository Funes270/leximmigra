import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { contenzioso } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const contenziosoRouter = createRouter({
  list: publicQuery
    .input(z.object({
      clienteId: z.number().optional(), praticaId: z.number().optional(),
      tipoContenzioso: z.string().optional(), statoProcedura: z.string().optional(),
      page: z.number().min(1).default(1), pageSize: z.number().min(1).max(100).default(25),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { clienteId, praticaId, tipoContenzioso, statoProcedura, page = 1, pageSize = 25 } = input || {};
      const conditions = [];
      if (clienteId) conditions.push(eq(contenzioso.clienteId, clienteId));
      if (praticaId) conditions.push(eq(contenzioso.praticaId, praticaId));
      if (tipoContenzioso) conditions.push(eq(contenzioso.tipoContenzioso, tipoContenzioso as typeof contenzioso.$inferSelect.tipoContenzioso));
      if (statoProcedura) conditions.push(eq(contenzioso.statoProcedura, statoProcedura as typeof contenzioso.$inferSelect.statoProcedura));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const [items, countResult] = await Promise.all([
        db.select().from(contenzioso).where(where).orderBy(desc(contenzioso.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
        db.select({ count: sql<number>`count(*)` }).from(contenzioso).where(where),
      ]);
      return { items, total: countResult[0]?.count ?? 0, page, pageSize };
    }),

  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const result = await db.select().from(contenzioso).where(eq(contenzioso.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: publicQuery
    .input(z.object({
      praticaId: z.number(), clienteId: z.number(), tipoContenzioso: z.string(),
      oggettoRicorso: z.string().min(1).max(255), descrizione: z.string().optional(),
      fatti: z.string().optional(), motiviDiritto: z.string().optional(), petitum: z.string().optional(),
      statoProcedura: z.string().optional(), sedeGiurisdizionale: z.string().max(200).optional(),
      sezione: z.string().max(50).optional(), dataPresentazione: z.string().optional(),
      dataNotifica: z.string().optional(), dataUdienza: z.string().optional(),
      oraUdienza: z.string().max(10).optional(), aulaUdienza: z.string().max(100).optional(),
      parteAttrice: z.string().max(200).optional(), parteResistente: z.string().max(200).optional(),
      avvocatoPatrocinante: z.string().max(200).optional(), indirizzoAvvocato: z.string().max(255).optional(),
      emailAvvocato: z.string().max(100).optional(), telefonoAvvocato: z.string().max(20).optional(),
      onorarioAvvocato: z.string().optional(), speseGiudiziarie: z.string().optional(),
      note: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const values: Record<string, unknown> = { ...input };
      values.tipoContenzioso = input.tipoContenzioso as typeof contenzioso.$inferSelect.tipoContenzioso;
      values.statoProcedura = (input.statoProcedura as typeof contenzioso.$inferSelect.statoProcedura) ?? "da_presentare";
      if (input.dataPresentazione) values.dataPresentazione = new Date(input.dataPresentazione);
      if (input.dataNotifica) values.dataNotifica = new Date(input.dataNotifica);
      if (input.dataUdienza) values.dataUdienza = new Date(input.dataUdienza);
      if (input.onorarioAvvocato) values.onorarioAvvocato = input.onorarioAvvocato;
      if (input.speseGiudiziarie) values.speseGiudiziarie = input.speseGiudiziarie;
      Object.keys(values).forEach(key => { if (values[key] === undefined) delete values[key]; });
      const result = await db.insert(contenzioso).values(values as typeof contenzioso.$inferInsert);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({ id: z.number(), data: z.object({}).passthrough() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, data } = input;
      const updateData = { ...data };
      const dateFields = ["dataPresentazione", "dataNotifica", "dataUdienza", "dataProssimaUdienza", "dataSentenza", "dataNotificaSentenza", "dataDepositoMotivazione", "termineRicorso"];
      for (const field of dateFields) {
        if (updateData[field] && typeof updateData[field] === "string") {
          (updateData as Record<string, unknown>)[field] = new Date(updateData[field] as string);
        }
      }
      await db.update(contenzioso).set(updateData).where(eq(contenzioso.id, id));
      return { success: true };
    }),

  delete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(contenzioso).where(eq(contenzioso.id, input.id));
    return { success: true };
  }),
});