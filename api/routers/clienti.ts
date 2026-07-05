import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { clienti } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const clientiRouter = createRouter({
  list: publicQuery
    .input(z.object({
      search: z.string().optional(),
      stato: z.enum(["attivo", "inattivo", "archiviato"]).optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(25),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { search, stato, page = 1, pageSize = 25 } = input || {};
      const conditions = [];
      if (search) {
        conditions.push(sql`(${clienti.cognome} LIKE ${`%${search}%`} OR ${clienti.nome} LIKE ${`%${search}%`} OR ${clienti.codiceFiscale} LIKE ${`%${search}%`})`);
      }
      if (stato) conditions.push(eq(clienti.stato, stato));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const [items, countResult] = await Promise.all([
        db.select().from(clienti).where(where).orderBy(desc(clienti.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
        db.select({ count: sql<number>`count(*)` }).from(clienti).where(where),
      ]);
      return { items, total: countResult[0]?.count ?? 0, page, pageSize };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(clienti).where(eq(clienti.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(z.object({
      cognome: z.string().min(1).max(100), nome: z.string().min(1).max(100),
      sesso: z.enum(["M", "F"]), dataNascita: z.string(),
      luogoNascita: z.string().min(1).max(100), provinciaNascita: z.string().max(10).optional(),
      statoNascita: z.string().max(100).optional(), cittadinanza: z.string().min(1).max(100),
      codiceFiscale: z.string().max(16).optional(), numeroPassaporto: z.string().max(50).optional(),
      dataScadenzaPassaporto: z.string().optional(), tipoDocumento: z.enum(["passaporto", "carta_identita", "patente", "altro"]).optional(),
      numeroDocumento: z.string().max(50).optional(), dataScadenzaDocumento: z.string().optional(),
      indirizzoResidenza: z.string().max(255).optional(), comuneResidenza: z.string().max(100).optional(),
      capResidenza: z.string().max(10).optional(), provinciaResidenza: z.string().max(10).optional(),
      telefono: z.string().max(20).optional(), cellulare: z.string().max(20).optional(),
      email: z.string().max(100).optional(), pec: z.string().max(100).optional(),
      permessoAttuale: z.string().max(100).optional(), numeroPermesso: z.string().max(50).optional(),
      dataRilascioPermesso: z.string().optional(), dataScadenzaPermesso: z.string().optional(),
      dataIngressoItalia: z.string().optional(), motivoIngresso: z.string().optional(),
      statoCivile: z.enum(["celibe_nubile", "coniugato", "divorziato", "separato", "vedovo"]).optional(),
      professione: z.string().max(100).optional(), datoreLavoro: z.string().max(200).optional(),
      titoloStudio: z.string().max(100).optional(), componentiNucleoFamiliare: z.number().optional(),
      note: z.string().optional(), stato: z.enum(["attivo", "inattivo", "archiviato"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const values: Record<string, unknown> = { ...input };
      if (input.dataNascita) values.dataNascita = new Date(input.dataNascita);
      if (input.dataScadenzaPassaporto) values.dataScadenzaPassaporto = new Date(input.dataScadenzaPassaporto);
      if (input.dataScadenzaDocumento) values.dataScadenzaDocumento = new Date(input.dataScadenzaDocumento);
      if (input.dataRilascioPermesso) values.dataRilascioPermesso = new Date(input.dataRilascioPermesso);
      if (input.dataScadenzaPermesso) values.dataScadenzaPermesso = new Date(input.dataScadenzaPermesso);
      if (input.dataIngressoItalia) values.dataIngressoItalia = new Date(input.dataIngressoItalia);
      Object.keys(values).forEach(key => { if (values[key] === undefined) delete values[key]; });
      const result = await db.insert(clienti).values(values as typeof clienti.$inferInsert);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({ id: z.number(), data: z.object({
      cognome: z.string().min(1).max(100).optional(), nome: z.string().min(1).max(100).optional(),
      sesso: z.enum(["M", "F"]).optional(), dataNascita: z.string().optional(),
      cittadinanza: z.string().min(1).max(100).optional(),
      codiceFiscale: z.string().max(16).optional(), telefono: z.string().max(20).optional(),
      cellulare: z.string().max(20).optional(), email: z.string().max(100).optional(),
      indirizzoResidenza: z.string().max(255).optional(), comuneResidenza: z.string().max(100).optional(),
      statoCivile: z.enum(["celibe_nubile", "coniugato", "divorziato", "separato", "vedovo"]).optional(),
      professione: z.string().max(100).optional(), datoreLavoro: z.string().max(200).optional(),
      note: z.string().optional(), stato: z.enum(["attivo", "inattivo", "archiviato"]).optional(),
    })) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.dataNascita) updateData.dataNascita = new Date(data.dataNascita);
      await db.update(clienti).set(updateData).where(eq(clienti.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(clienti).where(eq(clienti.id, input.id));
      return { success: true };
    }),
});