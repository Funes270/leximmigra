import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { pratiche } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const praticheRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        stato: z.enum([
          "aperta", "in_corso", "in_attesa_documenti", "in_attesa_ufficio",
          "completata", "archiviata", "sospesa", "annullata",
        ]).optional(),
        categoria: z.enum([
          "permesso_soggiorno", "protezione_internazionale", "contenzioso",
          "cittadinanza", "ricongiungimento_familiare", "espulsione_allontanamento", "altro",
        ]).optional(),
        clienteId: z.number().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(25),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { search, stato, categoria, clienteId, page = 1, pageSize = 25 } = input || {};
      
      const conditions = [];
      if (search) {
        conditions.push(
          sql`(${pratiche.oggetto} LIKE ${`%${search}%`} OR ${pratiche.numeroPratica} LIKE ${`%${search}%`})`
        );
      }
      if (stato) conditions.push(eq(pratiche.stato, stato));
      if (categoria) conditions.push(eq(pratiche.categoria, categoria));
      if (clienteId) conditions.push(eq(pratiche.clienteId, clienteId));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(pratiche)
          .where(where)
          .orderBy(desc(pratiche.createdAt))
          .limit(pageSize)
          .offset((page - 1) * pageSize),
        db
          .select({ count: sql<number>`count(*)` })
          .from(pratiche)
          .where(where),
      ]);

      return { items, total: countResult[0]?.count ?? 0, page, pageSize };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(pratiche).where(eq(pratiche.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        numeroPratica: z.string().min(1).max(50),
        clienteId: z.number(),
        categoria: z.enum([
          "permesso_soggiorno", "protezione_internazionale", "contenzioso",
          "cittadinanza", "ricongiungimento_familiare", "espulsione_allontanamento", "altro",
        ]),
        sottocategoria: z.string().max(100).optional(),
        oggetto: z.string().min(1).max(255),
        descrizione: z.string().optional(),
        stato: z.enum([
          "aperta", "in_corso", "in_attesa_documenti", "in_attesa_ufficio",
          "completata", "archiviata", "sospesa", "annullata",
        ]).optional(),
        dataApertura: z.string(),
        dataPresuntaConclusione: z.string().optional(),
        priorita: z.enum(["bassa", "normale", "alta", "urgente"]).optional(),
        onorario: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const values: Record<string, unknown> = { ...input };
      values.dataApertura = new Date(input.dataApertura);
      if (input.dataPresuntaConclusione) values.dataPresuntaConclusione = new Date(input.dataPresuntaConclusione);
      if (input.onorario) values.onorario = input.onorario;
      
      Object.keys(values).forEach(key => {
        if (values[key] === undefined) delete values[key];
      });
      
      const result = await db.insert(pratiche).values(values as typeof pratiche.$inferInsert);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          stato: z.enum([
            "aperta", "in_corso", "in_attesa_documenti", "in_attesa_ufficio",
            "completata", "archiviata", "sospesa", "annullata",
          ]).optional(),
          oggetto: z.string().max(255).optional(),
          descrizione: z.string().optional(),
          priorita: z.enum(["bassa", "normale", "alta", "urgente"]).optional(),
          dataPresuntaConclusione: z.string().optional(),
          dataConclusione: z.string().optional(),
          esito: z.enum(["favorevole", "sfavorevole", "parzialmente_favorevole", "in_corso", "da_definire"]).optional(),
          motivazioneEsito: z.string().optional(),
          assegnatarioId: z.number().optional(),
          onorario: z.string().optional(),
          speseSostenute: z.string().optional(),
          note: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.dataPresuntaConclusione) updateData.dataPresuntaConclusione = new Date(data.dataPresuntaConclusione);
      if (data.dataConclusione) updateData.dataConclusione = new Date(data.dataConclusione);
      if (data.onorario) updateData.onorario = data.onorario;
      if (data.speseSostenute) updateData.speseSostenute = data.speseSostenute;

      await db.update(pratiche).set(updateData).where(eq(pratiche.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(pratiche).where(eq(pratiche.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const [totalResult, perStato, perCategoria, urgenti] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(pratiche),
      db.select({ stato: pratiche.stato, count: sql<number>`count(*)` }).from(pratiche).groupBy(pratiche.stato),
      db.select({ categoria: pratiche.categoria, count: sql<number>`count(*)` }).from(pratiche).groupBy(pratiche.categoria),
      db.select({ count: sql<number>`count(*)` }).from(pratiche).where(eq(pratiche.priorita, "urgente")),
    ]);

    return {
      total: totalResult[0]?.count ?? 0,
      perStato,
      perCategoria,
      urgenti: urgenti[0]?.count ?? 0,
    };
  }),
});
