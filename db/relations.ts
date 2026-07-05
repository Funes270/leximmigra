import { relations } from "drizzle-orm";
import {
  users,
  clienti,
  pratiche,
  permessiSoggiorno,
  protezioneInternazionale,
  contenzioso,
  scadenze,
  notifiche,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  praticheCreate: many(pratiche),
  clientiCreate: many(clienti),
  notifiche: many(notifiche),
}));

export const clientiRelations = relations(clienti, ({ many, one }) => ({
  pratiche: many(pratiche),
  permessi: many(permessiSoggiorno),
  protezioni: many(protezioneInternazionale),
  contenziosi: many(contenzioso),
  scadenze: many(scadenze),
  createdByUser: one(users, {
    fields: [clienti.createdBy],
    references: [users.id],
  }),
}));

export const praticheRelations = relations(pratiche, ({ one, many }) => ({
  cliente: one(clienti, {
    fields: [pratiche.clienteId],
    references: [clienti.id],
  }),
  assegnatario: one(users, {
    fields: [pratiche.assegnatarioId],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [pratiche.createdBy],
    references: [users.id],
  }),
  permesso: one(permessiSoggiorno),
  protezione: one(protezioneInternazionale),
  contenzioso: one(contenzioso),
  scadenze: many(scadenze),
}));

export const permessiSoggiornoRelations = relations(permessiSoggiorno, ({ one }) => ({
  pratica: one(pratiche, {
    fields: [permessiSoggiorno.praticaId],
    references: [pratiche.id],
  }),
  cliente: one(clienti, {
    fields: [permessiSoggiorno.clienteId],
    references: [clienti.id],
  }),
}));

export const protezioneInternazionaleRelations = relations(protezioneInternazionale, ({ one }) => ({
  pratica: one(pratiche, {
    fields: [protezioneInternazionale.praticaId],
    references: [pratiche.id],
  }),
  cliente: one(clienti, {
    fields: [protezioneInternazionale.clienteId],
    references: [clienti.id],
  }),
}));

export const contenziosoRelations = relations(contenzioso, ({ one }) => ({
  pratica: one(pratiche, {
    fields: [contenzioso.praticaId],
    references: [pratiche.id],
  }),
  cliente: one(clienti, {
    fields: [contenzioso.clienteId],
    references: [clienti.id],
  }),
}));

export const scadenzeRelations = relations(scadenze, ({ one }) => ({
  pratica: one(pratiche, {
    fields: [scadenze.praticaId],
    references: [pratiche.id],
  }),
  cliente: one(clienti, {
    fields: [scadenze.clienteId],
    references: [clienti.id],
  }),
}));

export const notificheRelations = relations(notifiche, ({ one }) => ({
  user: one(users, {
    fields: [notifiche.userId],
    references: [users.id],
  }),
}));
