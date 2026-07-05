import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { scadenze } from "@db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export const scadenzeRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        clienteId: z.number().optional(),
        praticaId: z.number().optional(),
        tipo: z.string().optional(),
        stato: z.enum(["programmato", "completato", "annullato", "spostato"]).optional(),
        dataDa: z.string().optional(),
        dataA: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(25),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { clienteId, praticaId, tipo, stato, dataDa, dataA, page = 1, pageSize = 25 } = input || {};
      
      const conditions = [];
      if (clienteId) conditions.push(eq(scadenze.clienteId, clienteId));
      if (praticaId) conditions.push(eq(scadenze.praticaId, praticaId));
      if (tipo) conditions.push(eq(scadenze.tipo, tipo as typeof scadenze.$inferSelect.tipo));
      if (stato) conditions.push(eq(scadenze.stato, stato));
      if (dataDa) conditions.push(gte(scadenze.dataEvento, new Date(dataDa)));
      if (dataA) conditions.push(lte(scadenze.dataEvento, new Date(dataA)));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(scadenze).where(where).orderBy(scadenze.dataEvento).limit(pageSize).offset((page - 1) * pageSize),
        db.select({ count: sql<number>`count(*)` }).from(scadenze).where(where),
      ]);

      return { items, total: countResult[0]?.count ?? 0, page, pageSize };
    }),

  getProssime: publicQuery
    .input(z.object({ giorni: z.number().default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const giorni = input?.giorni ?? 30;
      const oggi = new Date();
      const futuro = new Date(oggi.getTime() + giorni * 24 * 60 * 60 * 1000);

      const items = await db
        .select()
        .from(scadenze)
        .where(
          and(
            eq(scadenze.stato, "programmato"),
            gte(scadenze.dataEvento, oggi),
            lte(scadenze.dataEvento, futuro)
          )
        )
        .orderBy(scadenze.dataEvento)
        .limit(50);

      return items;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(scadenze).where(eq(scadenze.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        praticaId: z.number().optional(),
        clienteId: z.number().optional(),
        titolo: z.string().min(1).max(255),
        descrizione: z.string().optional(),
        tipo: z.string(),
        dataEvento: z.string(),
        oraEvento: z.string().max(10).optional(),
        durata: z.number().optional(),
        luogo: z.string().max(255).optional(),
        indirizzo: z.string().max(255).optional(),
        priorita: z.enum(["bassa", "normale", "alta", "urgente"]).optional(),
        stato: z.enum(["programmato", "completato", "annullato", "spostato"]).optional(),
        notificaAnticipo: z.number().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const values: Record<string, unknown> = { ...input };
      values.tipo = input.tipo as typeof scadenze.$inferSelect.tipo;
      values.dataEvento = new Date(input.dataEvento);
      
      Object.keys(values).forEach(key => {
        if (values[key] === undefined) delete values[key];
      });
      
      const result = await db.insert(scadenze).values(values as typeof scadenze.$inferInsert);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({}).passthrough(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (updateData.dataEvento && typeof updateData.dataEvento === "string") {
        updateData.dataEvento = new Date(updateData.dataEvento);
      }

      await db.update(scadenze).set(updateData).where(eq(scadenze.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(scadenze).where(eq(scadenze.id, input.id));
      return { success: true };
    }),
});