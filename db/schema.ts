import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  date,
  int,
  decimal,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

// ============================================================
// TABELLA UTENTI
// ============================================================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// TABELLA CLIENTI (Cittadini Stranieri)
// ============================================================
export const clienti = mysqlTable("clienti", {
  id: serial("id").primaryKey(),
  cognome: varchar("cognome", { length: 100 }).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  sesso: mysqlEnum("sesso", ["M", "F"]).notNull(),
  dataNascita: date("dataNascita").notNull(),
  luogoNascita: varchar("luogoNascita", { length: 100 }).notNull(),
  provinciaNascita: varchar("provinciaNascita", { length: 10 }),
  statoNascita: varchar("statoNascita", { length: 100 }).notNull().default("ITALIA"),
  cittadinanza: varchar("cittadinanza", { length: 100 }).notNull(),
  codiceFiscale: varchar("codiceFiscale", { length: 16 }),
  numeroPassaporto: varchar("numeroPassaporto", { length: 50 }),
  dataScadenzaPassaporto: date("dataScadenzaPassaporto"),
  tipoDocumento: mysqlEnum("tipoDocumento", ["passaporto", "carta_identita", "patente", "altro"]),
  numeroDocumento: varchar("numeroDocumento", { length: 50 }),
  dataScadenzaDocumento: date("dataScadenzaDocumento"),
  indirizzoResidenza: varchar("indirizzoResidenza", { length: 255 }),
  comuneResidenza: varchar("comuneResidenza", { length: 100 }),
  capResidenza: varchar("capResidenza", { length: 10 }),
  provinciaResidenza: varchar("provinciaResidenza", { length: 10 }),
  telefono: varchar("telefono", { length: 20 }),
  cellulare: varchar("cellulare", { length: 20 }),
  email: varchar("email", { length: 100 }),
  pec: varchar("pec", { length: 100 }),
  permessoAttuale: varchar("permessoAttuale", { length: 100 }),
  numeroPermesso: varchar("numeroPermesso", { length: 50 }),
  dataRilascioPermesso: date("dataRilascioPermesso"),
  dataScadenzaPermesso: date("dataScadenzaPermesso"),
  dataIngressoItalia: date("dataIngressoItalia"),
  motivoIngresso: text("motivoIngresso"),
  statoCivile: mysqlEnum("statoCivile", ["celibe_nubile", "coniugato", "divorziato", "separato", "vedovo"]),
  professione: varchar("professione", { length: 100 }),
  datoreLavoro: varchar("datoreLavoro", { length: 200 }),
  titoloStudio: varchar("titoloStudio", { length: 100 }),
  componentiNucleoFamiliare: int("componentiNucleoFamiliare").default(1),
  note: text("note"),
  stato: mysqlEnum("stato", ["attivo", "inattivo", "archiviato"]).default("attivo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_clienti_cognome").on(table.cognome),
  index("idx_clienti_stato").on(table.stato),
]);

export type Cliente = typeof clienti.$inferSelect;
export type InsertCliente = typeof clienti.$inferInsert;

// ============================================================
// TABELLA PRATICHE
// ============================================================
export const pratiche = mysqlTable("pratiche", {
  id: serial("id").primaryKey(),
  numeroPratica: varchar("numeroPratica", { length: 50 }).notNull().unique(),
  clienteId: bigint("clienteId", { mode: "number", unsigned: true }).notNull().references(() => clienti.id),
  categoria: mysqlEnum("categoria", [
    "permesso_soggiorno", "protezione_internazionale", "contenzioso",
    "cittadinanza", "ricongiungimento_familiare", "espulsione_allontanamento", "altro",
  ]).notNull(),
  sottocategoria: varchar("sottocategoria", { length: 100 }),
  oggetto: varchar("oggetto", { length: 255 }).notNull(),
  descrizione: text("descrizione"),
  stato: mysqlEnum("stato", [
    "aperta", "in_corso", "in_attesa_documenti", "in_attesa_ufficio",
    "completata", "archiviata", "sospesa", "annullata",
  ]).default("aperta").notNull(),
  dataApertura: date("dataApertura").notNull(),
  dataPresuntaConclusione: date("dataPresuntaConclusione"),
  dataConclusione: date("dataConclusione"),
  esito: mysqlEnum("esito", ["favorevole", "sfavorevole", "parzialmente_favorevole", "in_corso", "da_definire"]).default("in_corso"),
  motivazioneEsito: text("motivazioneEsito"),
  assegnatarioId: bigint("assegnatarioId", { mode: "number", unsigned: true }).references(() => users.id),
  priorita: mysqlEnum("priorita", ["bassa", "normale", "alta", "urgente"]).default("normale").notNull(),
  onorario: decimal("onorario", { precision: 10, scale: 2 }),
  speseSostenute: decimal("speseSostenute", { precision: 10, scale: 2 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_pratiche_cliente").on(table.clienteId),
  index("idx_pratiche_stato").on(table.stato),
  index("idx_pratiche_categoria").on(table.categoria),
  index("idx_pratiche_numero").on(table.numeroPratica),
]);

export type Pratica = typeof pratiche.$inferSelect;
export type InsertPratica = typeof pratiche.$inferInsert;

// ============================================================
// TABELLA PERMESSI DI SOGGIORNO
// ============================================================
export const permessiSoggiorno = mysqlTable("permessiSoggiorno", {
  id: serial("id").primaryKey(),
  praticaId: bigint("praticaId", { mode: "number", unsigned: true }).notNull().references(() => pratiche.id),
  clienteId: bigint("clienteId", { mode: "number", unsigned: true }).notNull().references(() => clienti.id),
  tipologia: mysqlEnum("tipologia", [
    "lavoro_subordinato", "lavoro_autonomo", "lavoro_stagionale",
    "lavoro_domestico", "lavoro_atipico", "ricerca_lavoro",
    "famiglia_cittadino_italiano", "famiglia_cittadino_ue",
    "famiglia_accompagnamento", "genitori_cittadini_minori",
    "studio", "formazione_professionale", "tirocinio",
    "asilo_politico", "protezione_sussidiaria", "protezione_umana",
    "soggiorno_ue_lungo_periodo", "residenza_elettiva", "religioso",
    "ricongiungimento_familiare", "minore_eta", "assistenza_minori",
    "cura_salute", "vittima_tratta", "vittima_violenza_domestica",
    "protezione_temporanea", "caso_speciale", "richiesta_asilo",
    "ricorso_tar", "altro",
  ]).notNull(),
  durata: mysqlEnum("durata", ["6_mesi", "1_anno", "2_anni", "5_anni", "illimitato", "da_definire"]),
  statoPratica: mysqlEnum("statoPratica", [
    "da_presentare", "presentata", "in_istruttoria",
    "integrazione_documenti", "in_attesa_decisione", "concesso",
    "negato", "revocato", "rinnovato", "scaduto", "in_rinnovo", "ricorso_presentato",
  ]).default("da_presentare").notNull(),
  questuraCompetente: varchar("questuraCompetente", { length: 200 }),
  numeroSportello: varchar("numeroSportello", { length: 50 }),
  dataPresentazione: date("dataPresentazione"),
  dataRicevuta: date("dataRicevuta"),
  dataPrevistaRitiro: date("dataPrevistaRitiro"),
  dataRitiroEffettivo: date("dataRitiroEffettivo"),
  numeroPermesso: varchar("numeroPermesso", { length: 50 }),
  dataRilascio: date("dataRilascio"),
  dataScadenza: date("dataScadenza"),
  documentazioneRichiesta: text("documentazioneRichiesta"),
  documentazionePresentata: text("documentazionePresentata"),
  requisitiSpecifici: text("requisitiSpecifici"),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_permessi_pratica").on(table.praticaId),
  index("idx_permessi_cliente").on(table.clienteId),
  index("idx_permessi_tipologia").on(table.tipologia),
  index("idx_permessi_stato").on(table.statoPratica),
]);

export type PermessoSoggiorno = typeof permessiSoggiorno.$inferSelect;
export type InsertPermessoSoggiorno = typeof permessiSoggiorno.$inferInsert;

// ============================================================
// TABELLA PROTEZIONE INTERNAZIONALE
// ============================================================
export const protezioneInternazionale = mysqlTable("protezioneInternazionale", {
  id: serial("id").primaryKey(),
  praticaId: bigint("praticaId", { mode: "number", unsigned: true }).notNull().references(() => pratiche.id),
  clienteId: bigint("clienteId", { mode: "number", unsigned: true }).notNull().references(() => clienti.id),
  tipoProtezione: mysqlEnum("tipoProtezione", [
    "asilo_politico", "protezione_sussidiaria", "protezione_umana",
    "protezione_temporanea", "status_rifugiato", "status_apolidia",
    "riconoscimento_protezione_speciale", "non_definito",
  ]).notNull(),
  statoProcedura: mysqlEnum("statoProcedura", [
    "prima_accoglienza", "domanda_da_presentare", "domanda_presentata",
    "intervista_programmata", "intervista_svolta", "in_istruttoria_commissione",
    "in_attesa_decisione", "decisione_favorevole", "decisione_sfavorevole",
    "in_appello", "appello_accoglimento", "appello_rigetto",
    "procedura_chiusa", "revoca", "cessazione",
  ]).default("domanda_da_presentare").notNull(),
  commissioneCompetente: varchar("commissioneCompetente", { length: 200 }),
  numeroProtocollo: varchar("numeroProtocollo", { length: 50 }),
  dataPresentazioneDomanda: date("dataPresentazioneDomanda"),
  dataIntervista: date("dataIntervista"),
  oraIntervista: varchar("oraIntervista", { length: 10 }),
  luogoIntervista: varchar("luogoIntervista", { length: 255 }),
  dataDecisione: date("dataDecisione"),
  esitoDecisione: mysqlEnum("esitoDecisione", ["favorevole", "sfavorevole", "parzialmente_favorevole", "non_definito"]).default("non_definito"),
  motivazioneDecisione: text("motivazioneDecisione"),
  numeroProvvedimento: varchar("numeroProvvedimento", { length: 50 }),
  dataPresentazioneAppello: date("dataPresentazioneAppello"),
  tribunaleCompetente: varchar("tribunaleCompetente", { length: 200 }),
  numeroRuolo: varchar("numeroRuolo", { length: 50 }),
  esitoAppello: mysqlEnum("esitoAppello", ["in_corso", "accoglimento", "rigetto", "non_presentato"]).default("non_presentato"),
  motivazioneAppello: text("motivazioneAppello"),
  paeseOrigine: varchar("paeseOrigine", { length: 100 }),
  etniaGruppo: varchar("etniaGruppo", { length: 100 }),
  linguaMadre: varchar("linguaMadre", { length: 50 }),
  linguaIntervista: varchar("linguaIntervista", { length: 50 }),
  interprete: varchar("interprete", { length: 200 }),
  sintesiFatti: text("sintesiFatti"),
  motiviPersecuzione: text("motiviPersecuzione"),
  percorsiMigrazione: text("percorsiMigrazione"),
  vulnerabilita: mysqlEnum("vulnerabilita", [
    "nessuna", "minore", "disabilita", "gravida", "vittima_violenza",
    "vittima_tratta", "salute_mentale", "salute_fisica", "anziano", "solo_minore", "altro",
  ]).default("nessuna"),
  dettaglioVulnerabilita: text("dettaglioVulnerabilita"),
  inAccoglienza: boolean("inAccoglienza").default(false),
  strutturaAccoglienza: varchar("strutturaAccoglienza", { length: 200 }),
  indirizzoAccoglienza: varchar("indirizzoAccoglienza", { length: 255 }),
  dataIngressoAccoglienza: date("dataIngressoAccoglienza"),
  dataUscitaAccoglienza: date("dataUscitaAccoglienza"),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_protint_pratica").on(table.praticaId),
  index("idx_protint_cliente").on(table.clienteId),
  index("idx_protint_tipo").on(table.tipoProtezione),
  index("idx_protint_stato").on(table.statoProcedura),
]);

export type ProtezioneInternazionale = typeof protezioneInternazionale.$inferSelect;
export type InsertProtezioneInternazionale = typeof protezioneInternazionale.$inferInsert;

// ============================================================
// TABELLA CONTENZIOSO
// ============================================================
export const contenzioso = mysqlTable("contenzioso", {
  id: serial("id").primaryKey(),
  praticaId: bigint("praticaId", { mode: "number", unsigned: true }).notNull().references(() => pratiche.id),
  clienteId: bigint("clienteId", { mode: "number", unsigned: true }).notNull().references(() => clienti.id),
  tipoContenzioso: mysqlEnum("tipoContenzioso", [
    "ricorso_tar", "appello_administrativo", "opposizione_sprovvedimento",
    "reclamo_prefettura", "riesame_questura", "ricorso_tribunale_civile",
    "ricorso_corte_appello", "ricorso_cassazione", "giudizio_davanti_cede",
    "procedura_arbitrato", "altro",
  ]).notNull(),
  oggettoRicorso: varchar("oggettoRicorso", { length: 255 }).notNull(),
  descrizione: text("descrizione"),
  fatti: text("fatti"),
  motiviDiritto: text("motiviDiritto"),
  petitum: text("petitum"),
  sedeGiurisdizionale: varchar("sedeGiurisdizionale", { length: 200 }),
  sezione: varchar("sezione", { length: 50 }),
  statoProcedura: mysqlEnum("statoProcedura", [
    "da_presentare", "presentato", "in_ricerca_avvocato", "procura_da_firmare",
    "in_attesa_udienza", "udienza_fissata", "udienza_svolta",
    "in_attesa_sentenza", "sentenza_emessa", "opposizione_presentata",
    "appello_presentato", "procedura_chiusa", "esecutivo",
  ]).default("da_presentare").notNull(),
  dataPresentazione: date("dataPresentazione"),
  dataNotifica: date("dataNotifica"),
  dataUdienza: date("dataUdienza"),
  oraUdienza: varchar("oraUdienza", { length: 10 }),
  aulaUdienza: varchar("aulaUdienza", { length: 100 }),
  dataProssimaUdienza: date("dataProssimaUdienza"),
  dataSentenza: date("dataSentenza"),
  dataNotificaSentenza: date("dataNotificaSentenza"),
  dataDepositoMotivazione: date("dataDepositoMotivazione"),
  termineRicorso: date("termineRicorso"),
  esito: mysqlEnum("esito", ["in_corso", "accoglimento", "rigetto", "accoglimento_parziale", "estinzione", "conciliazione", "non_definito"]).default("non_definito"),
  dispositivoSentenza: text("dispositivoSentenza"),
  motivazioneSentenza: text("motivazioneSentenza"),
  parteAttrice: varchar("parteAttrice", { length: 200 }),
  parteResistente: varchar("parteResistente", { length: 200 }),
  avvocatoPatrocinante: varchar("avvocatoPatrocinante", { length: 200 }),
  indirizzoAvvocato: varchar("indirizzoAvvocato", { length: 255 }),
  emailAvvocato: varchar("emailAvvocato", { length: 100 }),
  telefonoAvvocato: varchar("telefonoAvvocato", { length: 20 }),
  onorarioAvvocato: decimal("onorarioAvvocato", { precision: 10, scale: 2 }),
  speseGiudiziarie: decimal("speseGiudiziarie", { precision: 10, scale: 2 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_contenzioso_pratica").on(table.praticaId),
  index("idx_contenzioso_cliente").on(table.clienteId),
  index("idx_contenzioso_tipo").on(table.tipoContenzioso),
  index("idx_contenzioso_stato").on(table.statoProcedura),
]);

export type Contenzioso = typeof contenzioso.$inferSelect;
export type InsertContenzioso = typeof contenzioso.$inferInsert;

// ============================================================
// TABELLA DOCUMENTI
// ============================================================
export const documenti = mysqlTable("documenti", {
  id: serial("id").primaryKey(),
  entitaTipo: mysqlEnum("entitaTipo", ["cliente", "pratica", "permesso", "protezione", "contenzioso"]).notNull(),
  entitaId: bigint("entitaId", { mode: "number", unsigned: true }).notNull(),
  nomeFile: varchar("nomeFile", { length: 255 }).notNull(),
  nomeOriginale: varchar("nomeOriginale", { length: 255 }).notNull(),
  tipoFile: varchar("tipoFile", { length: 100 }).notNull(),
  dimensione: int("dimensione"),
  percorso: varchar("percorso", { length: 500 }).notNull(),
  categoria: mysqlEnum("categoria", [
    "documento_identita", "passaporto", "permesso_soggiorno", "contratto_lavoro",
    "bollettino_pagamento", "marca_da_bollo", "ricarica_postale", "fotografia",
    "certificato_stato_civile", "certificato_nascita", "certificato_residenza",
    "certificato_reddito", "certificato_alloggio", "polizza_assicurativa",
    "documento_istruzione", "traduzione_giurata", "atto_notarile",
    "contratto_affitto", "fattura", "ricevuta", "richiesta_asilo",
    "domanda_permesso", "sentenza", "decreto", "provvedimento", "ricorso",
    "memoria", "pareri_legali", "corrispondenza", "nota_spese", "altro",
  ]).default("altro").notNull(),
  descrizione: text("descrizione"),
  isPubblico: boolean("isPubblico").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_documenti_entita").on(table.entitaTipo, table.entitaId),
  index("idx_documenti_categoria").on(table.categoria),
]);

export type Documento = typeof documenti.$inferSelect;
export type InsertDocumento = typeof documenti.$inferInsert;

// ============================================================
// TABELLA SCADENZE
// ============================================================
export const scadenze = mysqlTable("scadenze", {
  id: serial("id").primaryKey(),
  praticaId: bigint("praticaId", { mode: "number", unsigned: true }).references(() => pratiche.id),
  clienteId: bigint("clienteId", { mode: "number", unsigned: true }).references(() => clienti.id),
  titolo: varchar("titolo", { length: 255 }).notNull(),
  descrizione: text("descrizione"),
  tipo: mysqlEnum("tipo", [
    "udienza", "intervista", "appuntamento_questura", "appuntamento_commissione",
    "appuntamento_cliente", "termine_ricorso", "termine_rinnovo_permesso",
    "termine_presentazione_domanda", "termine_integrazione",
    "termine_opposizione", "termine_appello", "data_rilascio_documento",
    "data_scadenza_permesso", "riunione", "scadenza_generica", "altro",
  ]).notNull(),
  dataEvento: date("dataEvento").notNull(),
  oraEvento: varchar("oraEvento", { length: 10 }),
  durata: int("durata").default(60),
  luogo: varchar("luogo", { length: 255 }),
  indirizzo: varchar("indirizzo", { length: 255 }),
  priorita: mysqlEnum("priorita", ["bassa", "normale", "alta", "urgente"]).default("normale").notNull(),
  stato: mysqlEnum("stato", ["programmato", "completato", "annullato", "spostato"]).default("programmato").notNull(),
  notificaAnticipo: int("notificaAnticipo").default(24),
  notificaInviata: boolean("notificaInviata").default(false),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_scadenze_pratica").on(table.praticaId),
  index("idx_scadenze_cliente").on(table.clienteId),
  index("idx_scadenze_data").on(table.dataEvento),
  index("idx_scadenze_tipo").on(table.tipo),
  index("idx_scadenze_stato").on(table.stato),
]);

export type Scadenza = typeof scadenze.$inferSelect;
export type InsertScadenza = typeof scadenze.$inferInsert;

// ============================================================
// TABELLA NOTE
// ============================================================
export const note = mysqlTable("note", {
  id: serial("id").primaryKey(),
  entitaTipo: mysqlEnum("entitaTipo", ["cliente", "pratica", "permesso", "protezione", "contenzioso"]).notNull(),
  entitaId: bigint("entitaId", { mode: "number", unsigned: true }).notNull(),
  titolo: varchar("titolo", { length: 255 }),
  contenuto: text("contenuto").notNull(),
  tipo: mysqlEnum("tipo", [
    "nota_generica", "memo", "promemoria", "azione_richiesta",
    "aggiornamento_stato", "nota_telefonata", "nota_incontro",
    "nota_legale", "nota_cliente",
  ]).default("nota_generica").notNull(),
  importante: boolean("importante").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_note_entita").on(table.entitaTipo, table.entitaId),
]);

export type Nota = typeof note.$inferSelect;
export type InsertNota = typeof note.$inferInsert;

// ============================================================
// TABELLA STORICO / AUDIT LOG
// ============================================================
export const storico = mysqlTable("storico", {
  id: serial("id").primaryKey(),
  entitaTipo: mysqlEnum("entitaTipo", ["cliente", "pratica", "permesso", "protezione", "contenzioso", "documento", "scadenza"]).notNull(),
  entitaId: bigint("entitaId", { mode: "number", unsigned: true }).notNull(),
  azione: mysqlEnum("azione", [
    "creazione", "modifica", "eliminazione", "cambio_stato",
    "assegnazione", "upload_documento", "download_documento",
    "invio_email", "invio_pec", "nota_aggiunta", "scadenza_completata",
    "stampa", "export", "login", "logout",
  ]).notNull(),
  campoModificato: varchar("campoModificato", { length: 100 }),
  valorePrecedente: text("valorePrecedente"),
  valoreNuovo: text("valoreNuovo"),
  descrizione: text("descrizione"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
}, (table) => [
  index("idx_storico_entita").on(table.entitaTipo, table.entitaId),
  index("idx_storico_azione").on(table.azione),
  index("idx_storico_data").on(table.createdAt),
]);

export type Storico = typeof storico.$inferSelect;
export type InsertStorico = typeof storico.$inferInsert;

// ============================================================
// TABELLA NOTIFICHE
// ============================================================
export const notifiche = mysqlTable("notifiche", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  titolo: varchar("titolo", { length: 255 }).notNull(),
  messaggio: text("messaggio").notNull(),
  tipo: mysqlEnum("tipo", ["info", "successo", "warning", "errore"]).default("info").notNull(),
  priorita: mysqlEnum("priorita", ["bassa", "normale", "alta", "urgente"]).default("normale").notNull(),
  link: varchar("link", { length: 500 }),
  entitaTipo: mysqlEnum("entitaTipo", ["cliente", "pratica", "permesso", "protezione", "contenzioso", "scadenza"]),
  entitaId: bigint("entitaId", { mode: "number", unsigned: true }),
  letta: boolean("letta").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_notifiche_user").on(table.userId),
  index("idx_notifiche_letta").on(table.letta),
]);

export type Notifica = typeof notifiche.$inferSelect;
export type InsertNotifica = typeof notifiche.$inferInsert;