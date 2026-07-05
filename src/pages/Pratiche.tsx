import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categorie = [
  { value: "permesso_soggiorno", label: "Permesso Soggiorno" },
  { value: "protezione_internazionale", label: "Protezione Internazionale" },
  { value: "contenzioso", label: "Contenzioso" },
  { value: "cittadinanza", label: "Cittadinanza" },
  { value: "ricongiungimento_familiare", label: "Ricongiungimento Familiare" },
  { value: "espulsione_allontanamento", label: "Espulsione/Allontanamento" },
  { value: "altro", label: "Altro" },
];

const stati = [
  { value: "aperta", label: "Aperta", color: "bg-blue-100 text-blue-800" },
  { value: "in_corso", label: "In Corso", color: "bg-emerald-100 text-emerald-800" },
  { value: "in_attesa_documenti", label: "In Attesa Documenti", color: "bg-amber-100 text-amber-800" },
  { value: "in_attesa_ufficio", label: "In Attesa Ufficio", color: "bg-purple-100 text-purple-800" },
  { value: "completata", label: "Completata", color: "bg-green-100 text-green-800" },
  { value: "archiviata", label: "Archiviata", color: "bg-gray-100 text-gray-800" },
  { value: "sospesa", label: "Sospesa", color: "bg-orange-100 text-orange-800" },
  { value: "annullata", label: "Annullata", color: "bg-red-100 text-red-800" },
];

const prioritaColors = {
  bassa: "text-gray-600",
  normale: "text-blue-600",
  alta: "text-amber-600",
  urgente: "text-red-600 font-bold",
};

export default function Pratiche() {
  const [search, setSearch] = useState("");
  const [statoTab, setStatoTab] = useState("tutte");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailPratica, setDetailPratica] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.pratiche.list.useQuery({
    search: search || undefined,
    stato: statoTab !== "tutte" ? (statoTab as any) : undefined,
    categoria: (categoriaFilter as any) || undefined,
    page,
    pageSize: 25,
  });

  const deleteMutation = trpc.pratiche.delete.useMutation({
    onSuccess: () => utils.pratiche.list.invalidate(),
  });

  const createMutation = trpc.pratiche.create.useMutation({
    onSuccess: () => {
      utils.pratiche.list.invalidate();
      setIsCreateOpen(false);
    },
  });

  const { data: praticaDetail } = trpc.pratiche.getById.useQuery(
    { id: detailPratica! },
    { enabled: !!detailPratica }
  );

  const { data: clientiList } = trpc.clienti.list.useQuery({ page: 1, pageSize: 1000 });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    createMutation.mutate({
      numeroPratica: formData.get("numeroPratica") as string,
      clienteId: Number(formData.get("clienteId")),
      categoria: (formData.get("categoria") as any) || "altro",
      oggetto: formData.get("oggetto") as string,
      descrizione: (formData.get("descrizione") as string) || undefined,
      dataApertura: formData.get("dataApertura") as string,
      priorita: (formData.get("priorita") as any) || "normale",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cerca per numero, oggetto..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={categoriaFilter} onValueChange={(v) => { setCategoriaFilter(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte</SelectItem>
              {categorie.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuova Pratica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Nuova Pratica</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Numero Pratica *</Label>
                  <Input name="numeroPratica" required placeholder="PR-2024-001" />
                </div>
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select name="clienteId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientiList?.items.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.cognome} {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select name="categoria" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorie.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priorita</Label>
                  <Select name="priorita" defaultValue="normale">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bassa">Bassa</SelectItem>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Oggetto *</Label>
                <Input name="oggetto" required />
              </div>
              <div className="space-y-2">
                <Label>Descrizione</Label>
                <textarea name="descrizione" className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Data Apertura *</Label>
                <Input name="dataApertura" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
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
      <Tabs value={statoTab} onValueChange={(v) => { setStatoTab(v); setPage(1); }}>
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="tutte">Tutte</TabsTrigger>
          <TabsTrigger value="aperta">Aperte</TabsTrigger>
          <TabsTrigger value="in_corso">In Corso</TabsTrigger>
          <TabsTrigger value="in_attesa_documenti">Attesa Doc.</TabsTrigger>
          <TabsTrigger value="completata">Completate</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Numero</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Oggetto</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Categoria</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Stato</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Priorita</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Apertura</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : data?.items && data.items.length > 0 ? (
                  data.items.map((p) => {
                    const statoLabel = stati.find((s) => s.value === p.stato);
                    return (
                      <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-900">{p.numeroPratica}</td>
                        <td className="px-5 py-3 text-gray-700 max-w-xs truncate">{p.oggetto}</td>
                        <td className="px-5 py-3">
                          <span className="capitalize text-gray-600 text-xs">
                            {p.categoria.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="outline" className={`text-xs ${statoLabel?.color || ""}`}>
                            {statoLabel?.label || p.stato}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs ${prioritaColors[p.priorita as keyof typeof prioritaColors] || ""}`}>
                            {p.priorita}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {p.dataApertura ? new Date(p.dataApertura).toLocaleDateString("it-IT") : "-"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDetailPratica(p.id)}>
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate({ id: p.id }); }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                      Nessuna pratica trovata
                    </td>
                  </tr>
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
      <Dialog open={!!detailPratica} onOpenChange={() => setDetailPratica(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Dettaglio Pratica</DialogTitle>
          </DialogHeader>
          {praticaDetail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Numero Pratica</p>
                  <p className="text-xl font-bold text-gray-900">{praticaDetail.numeroPratica}</p>
                </div>
                <Badge variant="outline" className={stati.find((s) => s.value === praticaDetail.stato)?.color}>
                  {stati.find((s) => s.value === praticaDetail.stato)?.label || praticaDetail.stato}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Oggetto</p>
                <p className="text-gray-900">{praticaDetail.oggetto}</p>
              </div>
              {praticaDetail.descrizione && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Descrizione</p>
                  <p className="text-sm text-gray-700">{praticaDetail.descrizione}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Categoria</p>
                  <p className="text-gray-900 capitalize">{praticaDetail.categoria.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Priorita</p>
                  <p className={prioritaColors[praticaDetail.priorita as keyof typeof prioritaColors]}>{praticaDetail.priorita}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Data Apertura</p>
                  <p className="text-gray-900">{praticaDetail.dataApertura ? new Date(praticaDetail.dataApertura).toLocaleDateString("it-IT") : "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Esito</p>
                  <p className="text-gray-900 capitalize">{praticaDetail.esito?.replace(/_/g, " ") || "In corso"}</p>
                </div>
              </div>
              {praticaDetail.note && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Note</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{praticaDetail.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
