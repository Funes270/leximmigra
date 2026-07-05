import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tipiScadenza = [
  { value: "udienza", label: "Udienza" },
  { value: "intervista", label: "Intervista" },
  { value: "appuntamento_questura", label: "Appuntamento Questura" },
  { value: "appuntamento_commissione", label: "Appuntamento Commissione" },
  { value: "appuntamento_cliente", label: "Appuntamento Cliente" },
  { value: "termine_ricorso", label: "Termine Ricorso" },
  { value: "termine_rinnovo_permesso", label: "Termine Rinnovo Permesso" },
  { value: "termine_presentazione_domanda", label: "Termine Presentazione Domanda" },
  { value: "termine_integrazione", label: "Termine Integrazione" },
  { value: "termine_opposizione", label: "Termine Opposizione" },
  { value: "termine_appello", label: "Termine Appello" },
  { value: "data_scadenza_permesso", label: "Scadenza Permesso" },
  { value: "riunione", label: "Riunione" },
  { value: "scadenza_generica", label: "Scadenza Generica" },
  { value: "altro", label: "Altro" },
];

const prioritaColors = {
  bassa: "bg-gray-100 text-gray-800",
  normale: "bg-blue-100 text-blue-800",
  alta: "bg-amber-100 text-amber-800",
  urgente: "bg-red-100 text-red-800",
};

export default function Scadenze() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [tab, setTab] = useState("prossime");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: prossimeScadenze } = trpc.scadenze.getProssime.useQuery({ giorni: 30 });
  const { data } = trpc.scadenze.list.useQuery({
    tipo: tipoFilter || undefined,
    page,
    pageSize: 25,
  });

  const { data: detail } = trpc.scadenze.getById.useQuery(
    { id: detailId! },
    { enabled: !!detailId }
  );

  const createMutation = trpc.scadenze.create.useMutation({
    onSuccess: () => {
      utils.scadenze.list.invalidate();
      utils.scadenze.getProssime.invalidate();
      setIsCreateOpen(false);
    },
  });

  const updateMutation = trpc.scadenze.update.useMutation({
    onSuccess: () => {
      utils.scadenze.list.invalidate();
      utils.scadenze.getProssime.invalidate();
    },
  });

  const deleteMutation = trpc.scadenze.delete.useMutation({
    onSuccess: () => {
      utils.scadenze.list.invalidate();
      utils.scadenze.getProssime.invalidate();
    },
  });

  const { data: clientiList } = trpc.clienti.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: praticheList } = trpc.pratiche.list.useQuery({ page: 1, pageSize: 1000 });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    createMutation.mutate({
      praticaId: Number(formData.get("praticaId")) || undefined,
      clienteId: Number(formData.get("clienteId")) || undefined,
      titolo: formData.get("titolo") as string,
      tipo: formData.get("tipo") as string,
      dataEvento: formData.get("dataEvento") as string,
      oraEvento: (formData.get("oraEvento") as string) || undefined,
      durata: Number(formData.get("durata")) || undefined,
      luogo: (formData.get("luogo") as string) || undefined,
      indirizzo: (formData.get("indirizzo") as string) || undefined,
      priorita: (formData.get("priorita") as "bassa" | "normale" | "alta" | "urgente") || undefined,
      note: (formData.get("note") as string) || undefined,
    });
  };

  const oggi = new Date();

  const getGiorniRimanenti = (dataEvento: Date | string) => {
    const diff = Math.ceil(
      (new Date(dataEvento).getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const displayItems = tab === "prossime" ? (prossimeScadenze || []) : (data?.items || []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cerca scadenze..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={tipoFilter} onValueChange={(v) => { setTipoFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutti</SelectItem>
              {tipiScadenza.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuova Scadenza
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuova Scadenza/Appuntamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Titolo *</Label>
                <Input name="titolo" required placeholder="Es. Udienza TAR Roma" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select name="clienteId">
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nessuno</SelectItem>
                      {clientiList?.items.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.cognome} {c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pratica</Label>
                  <Select name="praticaId">
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nessuna</SelectItem>
                      {praticheList?.items.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.numeroPratica}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select name="tipo" required>
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      {tipiScadenza.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priorita</Label>
                  <Select name="priorita" defaultValue="normale">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bassa">Bassa</SelectItem>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input name="dataEvento" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Ora</Label>
                  <Input name="oraEvento" type="time" />
                </div>
                <div className="space-y-2">
                  <Label>Durata (min)</Label>
                  <Input name="durata" type="number" defaultValue="60" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Luogo</Label>
                  <Input name="luogo" placeholder="Es. TAR Lazio, Sala A" />
                </div>
                <div className="space-y-2">
                  <Label>Indirizzo</Label>
                  <Input name="indirizzo" />
                </div>
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

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="prossime">Prossime 30 Giorni</TabsTrigger>
          <TabsTrigger value="tutte">Tutte</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Events Cards */}
      <div className="space-y-2">
        {tab === "prossime" && (!prossimeScadenze || prossimeScadenze.length === 0) ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Nessuna scadenza nei prossimi 30 giorni
            </CardContent>
          </Card>
        ) : (
          displayItems.map((s) => {
            const giorni = getGiorniRimanenti(s.dataEvento);
            const isUrgente = giorni <= 3 && giorni >= 0;
            const isScaduto = giorni < 0;

            return (
              <Card
                key={s.id}
                className={`border shadow-sm hover:shadow-md transition-shadow ${
                  isUrgente ? "border-red-200 bg-red-50/30" : isScaduto ? "border-gray-200 bg-gray-50" : "border-gray-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg ${
                        isUrgente ? "bg-red-100" : isScaduto ? "bg-gray-100" : "bg-blue-50"
                      }`}>
                        <Calendar className={`w-5 h-5 ${
                          isUrgente ? "text-red-600" : isScaduto ? "text-gray-500" : "text-blue-600"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-900">{s.titolo}</h4>
                          <Badge variant="outline" className={`text-xs ${prioritaColors[s.priorita as keyof typeof prioritaColors] || ""}`}>
                            {s.priorita}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {tipiScadenza.find((t) => t.value === s.tipo)?.label || s.tipo}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(s.dataEvento).toLocaleDateString("it-IT", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {s.oraEvento && ` ${s.oraEvento}`}
                          </span>
                          {s.luogo && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {s.luogo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isUrgente ? "destructive" : isScaduto ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {isScaduto
                          ? `Scaduto ${Math.abs(giorni)}gg fa`
                          : giorni === 0
                          ? "Oggi"
                          : giorni === 1
                          ? "Domani"
                          : `Tra ${giorni} giorni`}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setDetailId(s.id)}
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                        </Button>
                        {s.stato === "programmato" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              updateMutation.mutate({ id: s.id, data: { stato: "completato" } });
                            }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate({ id: s.id }); }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {tab === "tutte" && data && data.total > data.pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{data.total} risultati</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Precedente</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page * data.pageSize >= data.total}>Successiva</Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dettaglio Scadenza</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{detail.titolo}</h3>
                <Badge variant="outline" className={prioritaColors[detail.priorita as keyof typeof prioritaColors]}>
                  {detail.priorita}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Tipo</p>
                  <p className="text-gray-900">{tipiScadenza.find((t) => t.value === detail.tipo)?.label || detail.tipo}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Stato</p>
                  <p className="text-gray-900 capitalize">{detail.stato}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Data</p>
                  <p className="text-gray-900">{new Date(detail.dataEvento).toLocaleDateString("it-IT")}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Ora</p>
                  <p className="text-gray-900">{detail.oraEvento || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Durata</p>
                  <p className="text-gray-900">{detail.durata ? `${detail.durata} min` : "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Luogo</p>
                  <p className="text-gray-900">{detail.luogo || "-"}</p>
                </div>
              </div>
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
