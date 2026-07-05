import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { clienti, pratiche, permessiSoggiorno, protezioneInternazionale, contenzioso, scadenze } from "@db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const db = getDb();
    const oggi = new Date();
    const in7giorni = new Date(oggi.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30giorni = new Date(oggi.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalClienti, clientiAttivi, totalPratiche, praticheAperte,
      praticheUrgenti, praticheInCorso, praticheCompletate,
      totalPermessi, permessiInScadenza, totalProtezione, protezioneInCorso,
      totalContenzioso, contenziosoAttivo, scadenzeProssime7, scadenzeProssime30,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(clienti),
      db.select({ count: sql<number>`count(*)` }).from(clienti).where(eq(clienti.stato, "attivo")),
      db.select({ count: sql<number>`count(*)` }).from(pratiche),
      db.select({ count: sql<number>`count(*)` }).from(pratiche).where(eq(pratiche.stato, "aperta")),
      db.select({ count: sql<number>`count(*)` }).from(pratiche).where(eq(pratiche.priorita, "urgente")),
      db.select({ count: sql<number>`count(*)` }).from(pratiche).where(eq(pratiche.stato, "in_corso")),
      db.select({ count: sql<number>`count(*)` }).from(pratiche).where(eq(pratiche.stato, "completata")),
      db.select({ count: sql<number>`count(*)` }).from(permessiSoggiorno),
      db.select({ count: sql<number>`count(*)` }).from(permessiSoggiorno).where(
        and(gte(permessiSoggiorno.dataScadenza, oggi), lte(permessiSoggiorno.dataScadenza, in30giorni))
      ),
      db.select({ count: sql<number>`count(*)` }).from(protezioneInternazionale),
      db.select({ count: sql<number>`count(*)` }).from(protezioneInternazionale).where(eq(protezioneInternazionale.statoProcedura, "in_istruttoria_commissione")),
      db.select({ count: sql<number>`count(*)` }).from(contenzioso),
      db.select({ count: sql<number>`count(*)` }).from(contenzioso).where(eq(contenzioso.statoProcedura, "in_attesa_udienza")),
      db.select({ count: sql<number>`count(*)` }).from(scadenze).where(
        and(eq(scadenze.stato, "programmato"), gte(scadenze.dataEvento, oggi), lte(scadenze.dataEvento, in7giorni))
      ),
      db.select({ count: sql<number>`count(*)` }).from(scadenze).where(
        and(eq(scadenze.stato, "programmato"), gte(scadenze.dataEvento, oggi), lte(scadenze.dataEvento, in30giorni))
      ),
    ]);

    return {
      clienti: { total: totalClienti[0]?.count ?? 0, attivi: clientiAttivi[0]?.count ?? 0 },
      pratiche: { total: totalPratiche[0]?.count ?? 0, aperte: praticheAperte[0]?.count ?? 0, urgenti: praticheUrgenti[0]?.count ?? 0, inCorso: praticheInCorso[0]?.count ?? 0, completate: praticheCompletate[0]?.count ?? 0 },
      permessi: { total: totalPermessi[0]?.count ?? 0, inScadenza: permessiInScadenza[0]?.count ?? 0 },
      protezione: { total: totalProtezione[0]?.count ?? 0, inCorso: protezioneInCorso[0]?.count ?? 0 },
      contenzioso: { total: totalContenzioso[0]?.count ?? 0, attivo: contenziosoAttivo[0]?.count ?? 0 },
      scadenze: { prossime7: scadenzeProssime7[0]?.count ?? 0, prossime30: scadenzeProssime30[0]?.count ?? 0 },
    };
  }),

  praticheRecenti: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(pratiche).orderBy(sql`${pratiche.createdAt} DESC`).limit(10);
    return items;
  }),

  scadenzeImminenti: publicQuery.query(async () => {
    const db = getDb();
    const oggi = new Date();
    const in30giorni = new Date(oggi.getTime() + 30 * 24 * 60 * 60 * 1000);
    const items = await db.select().from(scadenze).where(
      and(eq(scadenze.stato, "programmato"), gte(scadenze.dataEvento, oggi), lte(scadenze.dataEvento, in30giorni))
    ).orderBy(scadenze.dataEvento).limit(20);
    return items;
  }),

  distribuzionePratiche: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({ categoria: pratiche.categoria, count: sql<number>`count(*)` }).from(pratiche).groupBy(pratiche.categoria);
    return result;
  }),

  andamentoMensile: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({ mese: sql<string>`DATE_FORMAT(${pratiche.createdAt}, '%Y-%m')`, count: sql<number>`count(*)` }).from(pratiche).groupBy(sql`DATE_FORMAT(${pratiche.createdAt}, '%Y-%m')`).orderBy(sql`DATE_FORMAT(${pratiche.createdAt}, '%Y-%m')`).limit(12);
    return result;
  }),
});