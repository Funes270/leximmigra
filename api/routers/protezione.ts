import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { protezioneInternazionale } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const protezioneRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        clienteId: z.number().optional(),
        praticaId: z.number().optional(),
        tipoProtezione: z.string().optional(),
        statoProcedura: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(25),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { clienteId, praticaId, tipoProtezione, statoProcedura, page = 1, pageSize = 25 } = input || {};
      
      const conditions = [];
      if (clienteId) conditions.push(eq(protezioneInternazionale.clienteId, clienteId));
      if (praticaId) conditions.push(eq(protezioneInternazionale.praticaId, praticaId));
      if (tipoProtezione) conditions.push(eq(protezioneInternazionale.tipoProtezione, tipoProtezione as typeof protezioneInternazionale.$inferSelect.tipoProtezione));
      if (statoProcedura) conditions.push(eq(protezioneInternazionale.statoProcedura, statoProcedura as typeof protezioneInternazionale.$inferSelect.statoProcedura));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(protezioneInternazionale).where(where).orderBy(desc(protezioneInternazionale.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
        db.select({ count: sql<number>`count(*)` }).from(protezioneInternazionale).where(where),
      ]);

      return { items, total: countResult[0]?.count ?? 0, page, pageSize };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(protezioneInternazionale).where(eq(protezioneInternazionale.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        praticaId: z.number(),
        clienteId: z.number(),
        tipoProtezione: z.string(),
        statoProcedura: z.string().optional(),
        commissioneCompetente: z.string().max(200).optional(),
        numeroProtocollo: z.string().max(50).optional(),
        dataPresentazioneDomanda: z.string().optional(),
        dataIntervista: z.string().optional(),
        oraIntervista: z.string().max(10).optional(),
        luogoIntervista: z.string().max(255).optional(),
        paeseOrigine: z.string().max(100).optional(),
        etniaGruppo: z.string().max(100).optional(),
        linguaMadre: z.string().max(50).optional(),
        linguaIntervista: z.string().max(50).optional(),
        interprete: z.string().max(200).optional(),
        sintesiFatti: z.string().optional(),
        motiviPersecuzione: z.string().optional(),
        percorsiMigrazione: z.string().optional(),
        vulnerabilita: z.string().optional(),
        dettaglioVulnerabilita: z.string().optional(),
        inAccoglienza: z.boolean().optional(),
        strutturaAccoglienza: z.string().max(200).optional(),
        indirizzoAccoglienza: z.string().max(255).optional(),
        dataIngressoAccoglienza: z.string().optional(),
        dataUscitaAccoglienza: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const values: Record<string, unknown> = { ...input };
      values.tipoProtezione = input.tipoProtezione as typeof protezioneInternazionale.$inferSelect.tipoProtezione;
      values.statoProcedura = (input.statoProcedura as typeof protezioneInternazionale.$inferSelect.statoProcedura) ?? "domanda_da_presentare";
      if (input.dataPresentazioneDomanda) values.dataPresentazioneDomanda = new Date(input.dataPresentazioneDomanda);
      if (input.dataIntervista) values.dataIntervista = new Date(input.dataIntervista);
      if (input.dataIngressoAccoglienza) values.dataIngressoAccoglienza = new Date(input.dataIngressoAccoglienza);
      if (input.dataUscitaAccoglienza) values.dataUscitaAccoglienza = new Date(input.dataUscitaAccoglienza);
      if (input.vulnerabilita) values.vulnerabilita = input.vulnerabilita as typeof protezioneInternazionale.$inferSelect.vulnerabilita;
      
      Object.keys(values).forEach(key => {
        if (values[key] === undefined) delete values[key];
      });
      
      const result = await db.insert(protezioneInternazionale).values(values as typeof protezioneInternazionale.$inferInsert);
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
      const updateData = { ...data };
      
      const dateFields = ["dataPresentazioneDomanda", "dataIntervista", "dataDecisione", "dataPresentazioneAppello",
        "dataIngressoAccoglienza", "dataUscitaAccoglienza"];
      for (const field of dateFields) {
        if (updateData[field] && typeof updateData[field] === "string") {
          (updateData as Record<string, unknown>)[field] = new Date(updateData[field] as string);
        }
      }

      await db.update(protezioneInternazionale).set(updateData).where(eq(protezioneInternazionale.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(protezioneInternazionale).where(eq(protezioneInternazionale.id, input.id));
      return { success: true };
    }),
});