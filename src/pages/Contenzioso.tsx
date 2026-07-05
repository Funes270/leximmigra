import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tipiContenzioso = [
  { value: "ricorso_tar", label: "Ricorso TAR" },
  { value: "appello_administrativo", label: "Appello Amministrativo" },
  { value: "opposizione_sprovvedimento", label: "Opposizione a Sprovvedimento" },
  { value: "reclamo_prefettura", label: "Reclamo in Prefettura" },
  { value: "riesame_questura", label: "Riesame in Questura" },
  { value: "ricorso_tribunale_civile", label: "Ricorso Tribunale Civile" },
  { value: "ricorso_corte_appello", label: "Ricorso Corte d'Appello" },
  { value: "ricorso_cassazione", label: "Ricorso Cassazione" },
  { value: "giudizio_davanti_cede", label: "Giudizio davanti al CEDE" },
  { value: "procedura_arbitrato", label: "Procedura Arbitrato" },
  { value: "altro", label: "Altro" },
];

const statiContenzioso = [
  { value: "da_presentare", label: "Da Presentare" },
  { value: "presentato", label: "Presentato" },
  { value: "in_ricerca_avvocato", label: "Ricerca Avvocato" },
  { value: "procura_da_firmare", label: "Procura da Firmare" },
  { value: "in_attesa_udienza", label: "Attesa Udienza" },
  { value: "udienza_fissata", label: "Udienza Fissata" },
  { value: "udienza_svolta", label: "Udienza Svolta" },
  { value: "in_attesa_sentenza", label: "Attesa Sentenza" },
  { value: "sentenza_emessa", label: "Sentenza Emessa" },
  { value: "opposizione_presentata", label: "Opposizione Presentata" },
  { value: "appello_presentato", label: "Appello Presentato" },
  { value: "procedura_chiusa", label: "Procedura Chiusa" },
  { value: "esecutivo", label: "Esecutivo" },
];

const esiti = [
  { value: "in_corso", label: "In Corso" },
  { value: "accoglimento", label: "Accoglimento" },
  { value: "rigetto", label: "Rigetto" },
  { value: "accoglimento_parziale", label: "Accoglimento Parziale" },
  { value: "estinzione", label: "Estinzione" },
  { value: "conciliazione", label: "Conciliazione" },
  { value: "non_definito", label: "Non Definito" },
];

export default function ContenziosoPage() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [statoFilter, setStatoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.contenzioso.list.useQuery({
    tipoContenzioso: tipoFilter || undefined,
    statoProcedura: statoFilter || undefined,
    page,
    pageSize: 25,
  });

  const { data: detail } = trpc.contenzioso.getById.useQuery(
    { id: detailId! },
    { enabled: !!detailId }
  );

  const createMutation = trpc.contenzioso.create.useMutation({
    onSuccess: () => {
      utils.contenzioso.list.invalidate();
      setIsCreateOpen(false);
    },
  });

  const deleteMutation = trpc.contenzioso.delete.useMutation({
    onSuccess: () => utils.contenzioso.list.invalidate(),
  });

  const { data: clientiList } = trpc.clienti.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: praticheList } = trpc.pratiche.list.useQuery({ page: 1, pageSize: 1000 });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    createMutation.mutate({
      praticaId: Number(formData.get("praticaId")),
      clienteId: Number(formData.get("clienteId")),
      tipoContenzioso: formData.get("tipoContenzioso") as string,
      oggettoRicorso: formData.get("oggetto") as string,
      descrizione: (formData.get("descrizione") as string) || undefined,
      fatti: (formData.get("fatti") as string) || undefined,
      motiviDiritto: (formData.get("motiviDiritto") as string) || undefined,
      petitum: (formData.get("petitum") as string) || undefined,
      statoProcedura: (formData.get("statoProcedura") as string) || undefined,
      sedeGiurisdizionale: (formData.get("sede") as string) || undefined,
      avvocatoPatrocinante: (formData.get("avvocato") as string) || undefined,
      dataUdienza: (formData.get("dataUdienza") as string) || undefined,
      note: (formData.get("note") as string) || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Gavel className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-amber-900">Contenzioso in Materia di Immigrazione</h3>
          <p className="text-xs text-amber-700 mt-1">
            Gestione ricorsi al TAR, appelli, opposizioni a provvedimenti amministrativi e tutte le procedure giurisdizionali
            in materia di diritto dell'immigrazione.
          </p>
        </div>
      </div>

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
          <Select value={tipoFilter} onValueChange={(v) => { setTipoFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutti</SelectItem>
              {tipiContenzioso.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statoFilter} onValueChange={(v) => { setStatoFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Stato" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutti</SelectItem>
              {statiContenzioso.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Ricorso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuova Procedura Contenziosa</DialogTitle>
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
                  <Label>Tipo Contenzioso *</Label>
                  <Select name="tipoContenzioso" required>
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      {tipiContenzioso.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stato Procedura</Label>
                  <Select name="statoProcedura" defaultValue="da_presentare">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statiContenzioso.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Oggetto Ricorso *</Label>
                <Input name="oggetto" required />
              </div>
              <div className="space-y-2">
                <Label>Descrizione</Label>
                <textarea name="descrizione" className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Fatti</Label>
                <textarea name="fatti" className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Motivi di Diritto</Label>
                <textarea name="motiviDiritto" className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Petitum</Label>
                <textarea name="petitum" className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sede Giurisdizionale</Label>
                  <Input name="sede" placeholder="Es. TAR Lazio" />
                </div>
                <div className="space-y-2">
                  <Label>Avvocato Patrocinante</Label>
                  <Input name="avvocato" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Udienza</Label>
                <Input name="dataUdienza" type="date" />
              </div>
              <div className="space-y-2">
                <Label>Note</Label>
                <textarea name="note" className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
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
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Tipo</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Oggetto</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Stato</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Sede</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Udienza</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Esito</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                  ))
                ) : data?.items && data.items.length > 0 ? (
                  data.items.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">#{c.id}</td>
                      <td className="px-5 py-3">
                        <span className="text-gray-700 text-xs">
                          {tipiContenzioso.find((t) => t.value === c.tipoContenzioso)?.label || c.tipoContenzioso}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-xs truncate">{c.oggettoRicorso}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {statiContenzioso.find((s) => s.value === c.statoProcedura)?.label || c.statoProcedura}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{c.sedeGiurisdizionale || "-"}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {c.dataUdienza ? new Date(c.dataUdienza).toLocaleDateString("it-IT") : "-"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium ${
                          c.esito === "accoglimento" ? "text-green-600" :
                          c.esito === "rigetto" ? "text-red-600" :
                          "text-gray-600"
                        }`}>
                          {esiti.find((e) => e.value === c.esito)?.label || "In corso"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDetailId(c.id)}>
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate({ id: c.id }); }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-500">Nessun ricorso trovato</td></tr>
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

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettaglio Procedura Contenziosa</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="text-lg font-bold text-gray-900">
                    {tipiContenzioso.find((t) => t.value === detail.tipoContenzioso)?.label || detail.tipoContenzioso}
                  </p>
                </div>
                <Badge variant="outline">
                  {statiContenzioso.find((s) => s.value === detail.statoProcedura)?.label || detail.statoProcedura}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Oggetto</p>
                <p className="text-gray-900">{detail.oggettoRicorso}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Sede</p>
                  <p className="text-gray-900">{detail.sedeGiurisdizionale || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Sezione</p>
                  <p className="text-gray-900">{detail.sezione || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Data Udienza</p>
                  <p className="text-gray-900">{detail.dataUdienza ? new Date(detail.dataUdienza).toLocaleDateString("it-IT") : "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Data Sentenza</p>
                  <p className="text-gray-900">{detail.dataSentenza ? new Date(detail.dataSentenza).toLocaleDateString("it-IT") : "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Avvocato</p>
                  <p className="text-gray-900">{detail.avvocatoPatrocinante || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Esito</p>
                  <p className="text-gray-900 font-medium">{esiti.find((e) => e.value === detail.esito)?.label || "In corso"}</p>
                </div>
              </div>
              {detail.fatti && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Fatti</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{detail.fatti}</p>
                </div>
              )}
              {detail.motiviDiritto && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Motivi di Diritto</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{detail.motiviDiritto}</p>
                </div>
              )}
              {detail.petitum && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Petitum</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{detail.petitum}</p>
                </div>
              )}
              {detail.dispositivoSentenza && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Dispositivo Sentenza</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{detail.dispositivoSentenza}</p>
                </div>
              )}
              {detail.note && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Note</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{detail.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
