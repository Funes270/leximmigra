import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Shield,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tipiProtezione = [
  { value: "asilo_politico", label: "Asilo Politico" },
  { value: "protezione_sussidiaria", label: "Protezione Sussidiaria" },
  { value: "protezione_umana", label: "Protezione Umana" },
  { value: "protezione_temporanea", label: "Protezione Temporanea" },
  { value: "status_rifugiato", label: "Status di Rifugiato" },
  { value: "status_apolidia", label: "Status di Apolidia" },
  { value: "riconoscimento_protezione_speciale", label: "Protezione Speciale" },
  { value: "non_definito", label: "Non Definito" },
];

const statiProcedura = [
  { value: "prima_accoglienza", label: "Prima Accoglienza" },
  { value: "domanda_da_presentare", label: "Da Presentare" },
  { value: "domanda_presentata", label: "Presentata" },
  { value: "intervista_programmata", label: "Intervista Programmata" },
  { value: "intervista_svolta", label: "Intervista Svolta" },
  { value: "in_istruttoria_commissione", label: "In Istruttoria" },
  { value: "in_attesa_decisione", label: "Attesa Decisione" },
  { value: "decisione_favorevole", label: "Favorevole" },
  { value: "decisione_sfavorevole", label: "Sfavorevole" },
  { value: "in_appello", label: "In Appello" },
  { value: "appello_accoglimento", label: "Appello Accolto" },
  { value: "appello_rigetto", label: "Appello Rigettato" },
  { value: "procedura_chiusa", label: "Chiusa" },
  { value: "revoca", label: "Revoca" },
  { value: "cessazione", label: "Cessazione" },
];

const vulnerabilitaList = [
  { value: "nessuna", label: "Nessuna" },
  { value: "minore", label: "Minore" },
  { value: "disabilita", label: "Disabilita" },
  { value: "gravida", label: "Gravida" },
  { value: "vittima_violenza", label: "Vittima Violenza" },
  { value: "vittima_tratta", label: "Vittima Tratta" },
  { value: "salute_mentale", label: "Salute Mentale" },
  { value: "salute_fisica", label: "Salute Fisica" },
  { value: "anziano", label: "Anziano" },
  { value: "solo_minore", label: "Solo Minore" },
  { value: "altro", label: "Altro" },
];

export default function Protezione() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [statoFilter, setStatoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [_tab, _setTab] = useState("tutte");

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.protezione.list.useQuery({
    tipoProtezione: tipoFilter || undefined,
    statoProcedura: statoFilter || undefined,
    page,
    pageSize: 25,
  });

  const { data: detail } = trpc.protezione.getById.useQuery(
    { id: detailId! },
    { enabled: !!detailId }
  );

  const createMutation = trpc.protezione.create.useMutation({
    onSuccess: () => {
      utils.protezione.list.invalidate();
      setIsCreateOpen(false);
    },
  });

  const deleteMutation = trpc.protezione.delete.useMutation({
    onSuccess: () => utils.protezione.list.invalidate(),
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
      tipoProtezione: formData.get("tipoProtezione") as string,
      statoProcedura: (formData.get("statoProcedura") as string) || undefined,
      commissioneCompetente: (formData.get("commissione") as string) || undefined,
      dataPresentazioneDomanda: (formData.get("dataPresentazione") as string) || undefined,
      dataIntervista: (formData.get("dataIntervista") as string) || undefined,
      paeseOrigine: (formData.get("paeseOrigine") as string) || undefined,
      vulnerabilita: (formData.get("vulnerabilita") as string) || undefined,
      inAccoglienza: formData.get("inAccoglienza") === "on",
      strutturaAccoglienza: (formData.get("struttura") as string) || undefined,
      sintesiFatti: (formData.get("sintesiFatti") as string) || undefined,
      note: (formData.get("note") as string) || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Protezione Internazionale</h3>
          <p className="text-xs text-blue-700 mt-1">
            Gestione completa delle procedure di asilo, protezione sussidiaria, protezione umana e protezione temporanea.
            Art. 19 D.Lgs. 251/2007 e ss.mm.ii.
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
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tipo Protezione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte</SelectItem>
              {tipiProtezione.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statoFilter} onValueChange={(v) => { setStatoFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutti</SelectItem>
              {statiProcedura.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuova Procedura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuova Procedura Protezione Internazionale</DialogTitle>
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
                  <Label>Tipo Protezione *</Label>
                  <Select name="tipoProtezione" required>
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      {tipiProtezione.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stato Procedura</Label>
                  <Select name="statoProcedura" defaultValue="domanda_da_presentare">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statiProcedura.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Commissione</Label>
                  <Input name="commissione" placeholder="Es. Commissione Territoriale di Roma" />
                </div>
                <div className="space-y-2">
                  <Label>Paese Origine</Label>
                  <Input name="paeseOrigine" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Presentazione</Label>
                  <Input name="dataPresentazione" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Data Intervista</Label>
                  <Input name="dataIntervista" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vulnerabilita</Label>
                  <Select name="vulnerabilita">
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      {vulnerabilitaList.map((v) => (
                        <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>In Accoglienza</Label>
                  <div className="flex items-center h-10">
                    <input type="checkbox" name="inAccoglienza" className="w-4 h-4" />
                    <span className="ml-2 text-sm text-gray-700">Cliente in struttura di accoglienza</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Struttura Accoglienza</Label>
                <Input name="struttura" />
              </div>
              <div className="space-y-2">
                <Label>Sintesi Fatti</Label>
                <textarea name="sintesiFatti" className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
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
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Tipo Protezione</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Stato</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Commissione</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Paese Origine</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Vulnerabilita</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Accoglienza</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                  ))
                ) : data?.items && data.items.length > 0 ? (
                  data.items.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">#{p.id}</td>
                      <td className="px-5 py-3">
                        <span className="text-gray-700">
                          {tipiProtezione.find((t) => t.value === p.tipoProtezione)?.label || p.tipoProtezione}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {statiProcedura.find((s) => s.value === p.statoProcedura)?.label || p.statoProcedura}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{p.commissioneCompetente || "-"}</td>
                      <td className="px-5 py-3 text-gray-600">{p.paeseOrigine || "-"}</td>
                      <td className="px-5 py-3">
                        {p.vulnerabilita && p.vulnerabilita !== "nessuna" ? (
                          <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {vulnerabilitaList.find((v) => v.value === p.vulnerabilita)?.label || p.vulnerabilita}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {p.inAccoglienza ? (
                          <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            <Heart className="w-3 h-3 mr-1" /> Si
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">No</span>
                        )}
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
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-500">Nessuna procedura trovata</td></tr>
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
            <DialogTitle>Dettaglio Procedura Protezione</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Tipo Protezione</p>
                  <p className="text-lg font-bold text-gray-900">
                    {tipiProtezione.find((t) => t.value === detail.tipoProtezione)?.label || detail.tipoProtezione}
                  </p>
                </div>
                <Badge variant="outline">
                  {statiProcedura.find((s) => s.value === detail.statoProcedura)?.label || detail.statoProcedura}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Commissione</p>
                  <p className="text-gray-900">{detail.commissioneCompetente || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Protocollo</p>
                  <p className="text-gray-900">{detail.numeroProtocollo || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Data Presentazione</p>
                  <p className="text-gray-900">{detail.dataPresentazioneDomanda ? new Date(detail.dataPresentazioneDomanda).toLocaleDateString("it-IT") : "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Data Intervista</p>
                  <p className="text-gray-900">{detail.dataIntervista ? new Date(detail.dataIntervista).toLocaleDateString("it-IT") : "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Paese Origine</p>
                  <p className="text-gray-900">{detail.paeseOrigine || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Lingua Intervista</p>
                  <p className="text-gray-900">{detail.linguaIntervista || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Interprete</p>
                  <p className="text-gray-900">{detail.interprete || "N/D"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Vulnerabilita</p>
                  <p className="text-gray-900">{vulnerabilitaList.find((v) => v.value === detail.vulnerabilita)?.label || "Nessuna"}</p>
                </div>
              </div>
              {detail.inAccoglienza && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                  <p className="text-sm font-semibold text-emerald-800 flex items-center gap-1">
                    <Heart className="w-4 h-4" /> In Accoglienza
                  </p>
                  <p className="text-sm text-emerald-700">{detail.strutturaAccoglienza || ""}</p>
                </div>
              )}
              {detail.sintesiFatti && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Sintesi Fatti</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{detail.sintesiFatti}</p>
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
