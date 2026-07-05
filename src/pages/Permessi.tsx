import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tipologiePermesso = [
  { value: "lavoro_subordinato", label: "Lavoro Subordinato", group: "Lavoro" },
  { value: "lavoro_autonomo", label: "Lavoro Autonomo", group: "Lavoro" },
  { value: "lavoro_stagionale", label: "Lavoro Stagionale", group: "Lavoro" },
  { value: "lavoro_domestico", label: "Lavoro Domestico", group: "Lavoro" },
  { value: "lavoro_atipico", label: "Lavoro Atipico", group: "Lavoro" },
  { value: "ricerca_lavoro", label: "Ricerca Lavoro", group: "Lavoro" },
  { value: "famiglia_cittadino_italiano", label: "Famiglia Cittadino Italiano", group: "Famiglia" },
  { value: "famiglia_cittadino_ue", label: "Famiglia Cittadino UE", group: "Famiglia" },
  { value: "famiglia_accompagnamento", label: "Accompagnamento Familiare", group: "Famiglia" },
  { value: "genitori_cittadini_minori", label: "Genitori Cittadini Minori", group: "Famiglia" },
  { value: "studio", label: "Studio", group: "Studio" },
  { value: "formazione_professionale", label: "Formazione Professionale", group: "Studio" },
  { value: "tirocinio", label: "Tirocinio", group: "Studio" },
  { value: "soggiorno_ue_lungo_periodo", label: "Soggiorno UE Lungo Periodo", group: "Speciale" },
  { value: "residenza_elettiva", label: "Residenza Elettiva", group: "Speciale" },
  { value: "religioso", label: "Religioso", group: "Speciale" },
  { value: "ricongiungimento_familiare", label: "Ricongiungimento Familiare", group: "Famiglia" },
  { value: "minore_eta", label: "Minore Eta", group: "Speciale" },
  { value: "assistenza_minori", label: "Assistenza Minori", group: "Speciale" },
  { value: "cura_salute", label: "Cura Salute", group: "Speciale" },
  { value: "vittima_tratta", label: "Vittima Tratta", group: "Protezione" },
  { value: "vittima_violenza_domestica", label: "Vittima Violenza Domestica", group: "Protezione" },
  { value: "protezione_temporanea", label: "Protezione Temporanea", group: "Protezione" },
  { value: "caso_speciale", label: "Caso Speciale", group: "Speciale" },
  { value: "altro", label: "Altro", group: "Altro" },
];

const statiPratica = [
  { value: "da_presentare", label: "Da Presentare" },
  { value: "presentata", label: "Presentata" },
  { value: "in_istruttoria", label: "In Istruttoria" },
  { value: "integrazione_documenti", label: "Integrazione Documenti" },
  { value: "in_attesa_decisione", label: "In Attesa Decisione" },
  { value: "concesso", label: "Concesso" },
  { value: "negato", label: "Negato" },
  { value: "rinnovato", label: "Rinnovato" },
  { value: "scaduto", label: "Scaduto" },
  { value: "in_rinnovo", label: "In Rinnovo" },
  { value: "ricorso_presentato", label: "Ricorso Presentato" },
];

const durate = [
  { value: "6_mesi", label: "6 Mesi" },
  { value: "1_anno", label: "1 Anno" },
  { value: "2_anni", label: "2 Anni" },
  { value: "5_anni", label: "5 Anni" },
  { value: "illimitato", label: "Illimitato" },
  { value: "da_definire", label: "Da Definire" },
];

export default function Permessi() {
  const [search, setSearch] = useState("");
  const [tipologiaFilter, setTipologiaFilter] = useState("");
  const [statoFilter, setStatoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("elenco");

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.permessi.list.useQuery({
    tipologia: tipologiaFilter || undefined,
    statoPratica: statoFilter || undefined,
    page,
    pageSize: 25,
  });

  const { data: permessoDetail } = trpc.permessi.getById.useQuery(
    { id: detailId! },
    { enabled: !!detailId }
  );

  const createMutation = trpc.permessi.create.useMutation({
    onSuccess: () => {
      utils.permessi.list.invalidate();
      setIsCreateOpen(false);
    },
  });

  const deleteMutation = trpc.permessi.delete.useMutation({
    onSuccess: () => utils.permessi.list.invalidate(),
  });

  const { data: clientiList } = trpc.clienti.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: praticheList } = trpc.pratiche.list.useQuery({ page: 1, pageSize: 1000 });

  // Raggruppa tipologie per categoria
  const groupedTipologie = tipologiePermesso.reduce((acc, t) => {
    if (!acc[t.group]) acc[t.group] = [];
    acc[t.group].push(t);
    return acc;
  }, {} as Record<string, typeof tipologiePermesso>);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    createMutation.mutate({
      praticaId: Number(formData.get("praticaId")),
      clienteId: Number(formData.get("clienteId")),
      tipologia: formData.get("tipologia") as string,
      durata: (formData.get("durata") as string) || undefined,
      statoPratica: (formData.get("statoPratica") as string) || undefined,
      questuraCompetente: (formData.get("questura") as string) || undefined,
      dataPresentazione: (formData.get("dataPresentazione") as string) || undefined,
      dataScadenza: (formData.get("dataScadenza") as string) || undefined,
      note: (formData.get("note") as string) || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="elenco">Elenco Pratiche</TabsTrigger>
          <TabsTrigger value="tipologie">Tipologie Permesso</TabsTrigger>
        </TabsList>

        <TabsContent value="elenco" className="space-y-4 mt-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Cerca..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <Select value={tipologiaFilter} onValueChange={(v) => { setTipologiaFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipologia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutte</SelectItem>
                  {tipologiePermesso.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statoFilter} onValueChange={(v) => { setStatoFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutti</SelectItem>
                  {statiPratica.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Pratica Permesso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nuova Pratica Permesso di Soggiorno</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cliente *</Label>
                      <Select name="clienteId" required>
                        <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                        <SelectContent>
                          {clientiList?.items.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.cognome} {c.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Pratica *</Label>
                      <Select name="praticaId" required>
                        <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                        <SelectContent>
                          {praticheList?.items.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.numeroPratica}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipologia *</Label>
                      <Select name="tipologia" required>
                        <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(groupedTipologie).map(([group, items]) => (
                            <div key={group}>
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">{group}</div>
                              {items.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Durata</Label>
                      <Select name="durata">
                        <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                        <SelectContent>
                          {durate.map((d) => (
                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stato Pratica</Label>
                      <Select name="statoPratica" defaultValue="da_presentare">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statiPratica.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Questura Competente</Label>
                      <Input name="questura" placeholder="Es. Roma" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Presentazione</Label>
                      <Input name="dataPresentazione" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Scadenza</Label>
                      <Input name="dataScadenza" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Note</Label>
                    <textarea name="note" className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annulla</Button>
                    <Button type="submit" className="bg-[#1a365d] hover:bg-[#1a365d]/90">Salva</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">ID</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Tipologia</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Stato</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Questura</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Presentazione</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Scadenza</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                      ))
                    ) : data?.items && data.items.length > 0 ? (
                      data.items.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-900">#{p.id}</td>
                          <td className="px-5 py-3">
                            <span className="text-gray-700">
                              {tipologiePermesso.find((t) => t.value === p.tipologia)?.label || p.tipologia}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant="outline" className="text-xs capitalize">
                              {statiPratica.find((s) => s.value === p.statoPratica)?.label || p.statoPratica}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{p.questuraCompetente || "-"}</td>
                          <td className="px-5 py-3 text-gray-500 text-xs">
                            {p.dataPresentazione ? new Date(p.dataPresentazione).toLocaleDateString("it-IT") : "-"}
                          </td>
                          <td className="px-5 py-3">
                            {p.dataScadenza ? (
                              <span className={`text-xs ${
                                new Date(p.dataScadenza) < new Date() ? "text-red-600 font-bold" : "text-gray-600"
                              }`}>
                                {new Date(p.dataScadenza).toLocaleDateString("it-IT")}
                              </span>
                            ) : "-"}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDetailId(p.id)}>
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate({ id: p.id }); }}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">Nessuna pratica trovata</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {data && data.total > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">{data.total} risultati</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Precedente</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page * data.pageSize >= data.total}>Successiva</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipologie" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedTipologie).map(([group, items]) => (
              <Card key={group} className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    {group}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="space-y-1">
                    {items.map((t) => (
                      <div key={t.value} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 transition-colors">
                        <span className="text-sm text-gray-700">{t.label}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettaglio Permesso di Soggiorno</DialogTitle>
          </DialogHeader>
          {permessoDetail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Tipologia</p>
                  <p className="text-lg font-bold text-gray-900">
                    {tipologiePermesso.find((t) => t.value === permessoDetail.tipologia)?.label || permessoDetail.tipologia}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {statiPratica.find((s) => s.value === permessoDetail.statoPratica)?.label || permessoDetail.statoPratica}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Questura</p>
                  <p className="text-gray-900">{permessoDetail.questuraCompetente || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Numero Sportello</p>
                  <p className="text-gray-900">{permessoDetail.numeroSportello || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Data Presentazione</p>
                  <p className="text-gray-900">{permessoDetail.dataPresentazione ? new Date(permessoDetail.dataPresentazione).toLocaleDateString("it-IT") : "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Data Scadenza</p>
                  <p className="text-gray-900">{permessoDetail.dataScadenza ? new Date(permessoDetail.dataScadenza).toLocaleDateString("it-IT") : "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Numero Permesso</p>
                  <p className="text-gray-900">{permessoDetail.numeroPermesso || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Durata</p>
                  <p className="text-gray-900">{durate.find((d) => d.value === permessoDetail.durata)?.label || "N/D"}</p>
                </div>
              </div>
              {permessoDetail.note && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Note</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{permessoDetail.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
