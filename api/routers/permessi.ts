import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { permessiSoggiorno } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const permessiRouter = createRouter({
  list: publicQuery
    .input(z.object({
      clienteId: z.number().optional(), praticaId: z.number().optional(),
      tipologia: z.string().optional(), statoPratica: z.string().optional(),
      page: z.number().min(1).default(1), pageSize: z.number().min(1).max(100).default(25),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { clienteId, praticaId, tipologia, statoPratica, page = 1, pageSize = 25 } = input || {};
      const conditions = [];
      if (clienteId) conditions.push(eq(permessiSoggiorno.clienteId, clienteId));
      if (praticaId) conditions.push(eq(permessiSoggiorno.praticaId, praticaId));
      if (tipologia) conditions.push(eq(permessiSoggiorno.tipologia, tipologia as typeof permessiSoggiorno.$inferSelect.tipologia));
      if (statoPratica) conditions.push(eq(permessiSoggiorno.statoPratica, statoPratica as typeof permessiSoggiorno.$inferSelect.statoPratica));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const [items, countResult] = await Promise.all([
        db.select().from(permessiSoggiorno).where(where).orderBy(desc(permessiSoggiorno.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
        db.select({ count: sql<number>`count(*)` }).from(permessiSoggiorno).where(where),
      ]);
      return { items, total: countResult[0]?.count ?? 0, page, pageSize };
    }),

  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const result = await db.select().from(permessiSoggiorno).where(eq(permessiSoggiorno.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: publicQuery
    .input(z.object({
      praticaId: z.number(), clienteId: z.number(), tipologia: z.string(),
      durata: z.string().optional(), statoPratica: z.string().optional(),
      questuraCompetente: z.string().max(200).optional(), numeroSportello: z.string().max(50).optional(),
      dataPresentazione: z.string().optional(), dataRicevuta: z.string().optional(),
      dataPrevistaRitiro: z.string().optional(), dataRitiroEffettivo: z.string().optional(),
      numeroPermesso: z.string().max(50).optional(), dataRilascio: z.string().optional(),
      dataScadenza: z.string().optional(), documentazioneRichiesta: z.string().optional(),
      documentazionePresentata: z.string().optional(), requisitiSpecifici: z.string().optional(),
      note: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const values: Record<string, unknown> = { ...input };
      values.tipologia = input.tipologia as typeof permessiSoggiorno.$inferSelect.tipologia;
      if (input.durata) values.durata = input.durata as typeof permessiSoggiorno.$inferSelect.durata;
      values.statoPratica = (input.statoPratica as typeof permessiSoggiorno.$inferSelect.statoPratica) ?? "da_presentare";
      if (input.dataPresentazione) values.dataPresentazione = new Date(input.dataPresentazione);
      if (input.dataRicevuta) values.dataRicevuta = new Date(input.dataRicevuta);
      if (input.dataPrevistaRitiro) values.dataPrevistaRitiro = new Date(input.dataPrevistaRitiro);
      if (input.dataRitiroEffettivo) values.dataRitiroEffettivo = new Date(input.dataRitiroEffettivo);
      if (input.dataRilascio) values.dataRilascio = new Date(input.dataRilascio);
      if (input.dataScadenza) values.dataScadenza = new Date(input.dataScadenza);
      Object.keys(values).forEach(key => { if (values[key] === undefined) delete values[key]; });
      const result = await db.insert(permessiSoggiorno).values(values as typeof permessiSoggiorno.$inferInsert);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({ id: z.number(), data: z.object({
      tipologia: z.string().optional(), durata: z.string().optional(), statoPratica: z.string().optional(),
      questuraCompetente: z.string().max(200).optional(), numeroSportello: z.string().max(50).optional(),
      dataPresentazione: z.string().optional(), dataRicevuta: z.string().optional(),
      dataPrevistaRitiro: z.string().optional(), dataRitiroEffettivo: z.string().optional(),
      numeroPermesso: z.string().max(50).optional(), dataRilascio: z.string().optional(),
      dataScadenza: z.string().optional(), documentazioneRichiesta: z.string().optional(),
      documentazionePresentata: z.string().optional(), requisitiSpecifici: z.string().optional(),
      note: z.string().optional(),
    }) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.tipologia) updateData.tipologia = data.tipologia as typeof permessiSoggiorno.$inferSelect.tipologia;
      if (data.durata) updateData.durata = data.durata as typeof permessiSoggiorno.$inferSelect.durata;
      if (data.statoPratica) updateData.statoPratica = data.statoPratica as typeof permessiSoggiorno.$inferSelect.statoPratica;
      if (data.dataPresentazione) updateData.dataPresentazione = new Date(data.dataPresentazione);
      if (data.dataRicevuta) updateData.dataRicevuta = new Date(data.dataRicevuta);
      if (data.dataPrevistaRitiro) updateData.dataPrevistaRitiro = new Date(data.dataPrevistaRitiro);
      if (data.dataRitiroEffettivo) updateData.dataRitiroEffettivo = new Date(data.dataRitiroEffettivo);
      if (data.dataRilascio) updateData.dataRilascio = new Date(data.dataRilascio);
      if (data.dataScadenza) updateData.dataScadenza = new Date(data.dataScadenza);
      await db.update(permessiSoggiorno).set(updateData).where(eq(permessiSoggiorno.id, id));
      return { success: true };
    }),

  delete: publicQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(permessiSoggiorno).where(eq(permessiSoggiorno.id, input.id));
    return { success: true };
  }),
});