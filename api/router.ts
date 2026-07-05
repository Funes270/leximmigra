import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { clientiRouter } from "./routers/clienti";
import { praticheRouter } from "./routers/pratiche";
import { permessiRouter } from "./routers/permessi";
import { protezioneRouter } from "./routers/protezione";
import { contenziosoRouter } from "./routers/contenzioso";
import { scadenzeRouter } from "./routers/scadenze";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  clienti: clientiRouter,
  pratiche: praticheRouter,
  permessi: permessiRouter,
  protezione: protezioneRouter,
  contenzioso: contenziosoRouter,
  scadenze: scadenzeRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
