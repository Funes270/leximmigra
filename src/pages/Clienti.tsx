import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statiCivili = [
  { value: "celibe_nubile", label: "Celibe/Nubile" },
  { value: "coniugato", label: "Coniugato/a" },
  { value: "divorziato", label: "Divorziato/a" },
  { value: "separato", label: "Separato/a" },
  { value: "vedovo", label: "Vedovo/a" },
];

export default function Clienti() {
  const [search, setSearch] = useState("");
  const [statoFilter, setStatoFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.clienti.list.useQuery({
    search: search || undefined,
    stato: (statoFilter as "attivo" | "inattivo" | "archiviato") || undefined,
    page, pageSize: 25,
  });

  const deleteMutation = trpc.clienti.delete.useMutation({ onSuccess: () => utils.clienti.list.invalidate() });
  const createMutation = trpc.clienti.create.useMutation({ onSuccess: () => { utils.clienti.list.invalidate(); setIsCreateOpen(false); } });
  const { data: clienteDetail } = trpc.clienti.getById.useQuery({ id: selectedCliente! }, { enabled: !!selectedCliente });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    createMutation.mutate({
      cognome: formData.get("cognome") as string, nome: formData.get("nome") as string,
      sesso: (formData.get("sesso") as "M" | "F") || "M", dataNascita: formData.get("dataNascita") as string,
      luogoNascita: formData.get("luogoNascita") as string, cittadinanza: formData.get("cittadinanza") as string,
      codiceFiscale: (formData.get("codiceFiscale") as string) || undefined,
      telefono: (formData.get("telefono") as string) || undefined, cellulare: (formData.get("cellulare") as string) || undefined,
      email: (formData.get("email") as string) || undefined, indirizzoResidenza: (formData.get("indirizzo") as string) || undefined,
      comuneResidenza: (formData.get("comune") as string) || undefined, statoCivile: (formData.get("statoCivile") as any) || undefined,
      professione: (formData.get("professione") as string) || undefined, note: (formData.get("note") as string) || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Cerca per cognome, nome, codice fiscale..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statoFilter} onValueChange={(v) => { setStatoFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Stato" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutti</SelectItem>
              <SelectItem value="attivo">Attivo</SelectItem>
              <SelectItem value="inattivo">Inattivo</SelectItem>
              <SelectItem value="archiviato">Archiviato</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90"><Plus className="w-4 h-4 mr-2" />Nuovo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-lg font-semibold">Nuovo Cliente</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Cognome *</Label><Input name="cognome" required /></div>
                <div className="space-y-2"><Label>Nome *</Label><Input name="nome" required /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Sesso *</Label><Select name="sesso" defaultValue="M"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="M">M</SelectItem><SelectItem value="F">F</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Data Nascita *</Label><Input name="dataNascita" type="date" required /></div>
                <div className="space-y-2"><Label>Luogo Nascita *</Label><Input name="luogoNascita" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Cittadinanza *</Label><Input name="cittadinanza" required /></div>
                <div className="space-y-2"><Label>Codice Fiscale</Label><Input name="codiceFiscale" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Telefono</Label><Input name="telefono" /></div>
                <div className="space-y-2"><Label>Cellulare</Label><Input name="cellulare" /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" /></div>
              <div className="space-y-2"><Label>Indirizzo Residenza</Label><Input name="indirizzo" /></div>
              <div className="space-y-2"><Label>Comune</Label><Input name="comune" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Stato Civile</Label><Select name="statoCivile"><SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger><SelectContent>{statiCivili.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Professione</Label><Input name="professione" /></div>
              </div>
              <div className="space-y-2"><Label>Note</Label><textarea name="note" className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annulla</Button>
                <Button type="submit" className="bg-[#1a365d] hover:bg-[#1a365d]/90">Salva Cliente</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Cliente</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Contatti</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Nascita</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Cittadinanza</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Stato</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>) :
                data?.items && data.items.length > 0 ? data.items.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => { setSelectedCliente(c.id); setIsDetailOpen(true); }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">{c.nome?.charAt(0)}{c.cognome?.charAt(0)}</div>
                        <div><p className="font-medium text-gray-900">{c.cognome} {c.nome}</p><p className="text-xs text-gray-500">CF: {c.codiceFiscale || "N/D"}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="space-y-0.5">
                        {c.cellulare && <p className="text-xs text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {c.cellulare}</p>}
                        {c.email && <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.dataNascita ? new Date(c.dataNascita).toLocaleDateString("it-IT") : "-"}<br /><span className="text-xs text-gray-500">{c.luogoNascita}</span></td>
                    <td className="px-5 py-3 text-gray-600">{c.cittadinanza}</td>
                    <td className="px-5 py-3"><Badge variant={c.stato === "attivo" ? "default" : "secondary"} className="text-xs capitalize">{c.stato}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setSelectedCliente(c.id); setIsDetailOpen(true); }}><FileText className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}><Pencil className="w-4 h-4 text-gray-500" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); if (confirm("Eliminare questo cliente?")) deleteMutation.mutate({ id: c.id }); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Nessun cliente trovato</td></tr>}
              </tbody>
            </table>
          </div>
          {data && data.total > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">{data.total} risultati totali</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Precedente</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page * data.pageSize >= data.total}>Successiva</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" />Scheda Cliente</DialogTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsDetailOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
          </DialogHeader>
          {clienteDetail && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 rounded-full bg-[#1a365d] flex items-center justify-center text-white text-xl font-bold">{clienteDetail.nome?.charAt(0)}{clienteDetail.cognome?.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{clienteDetail.cognome} {clienteDetail.nome}</h3>
                  <p className="text-sm text-gray-500">{clienteDetail.sesso === "M" ? "Maschio" : "Femmina"} | Nato/a il {clienteDetail.dataNascita ? new Date(clienteDetail.dataNascita).toLocaleDateString("it-IT") : "-"} a {clienteDetail.luogoNascita}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={clienteDetail.stato === "attivo" ? "default" : "secondary"}>{clienteDetail.stato}</Badge>
                    <Badge variant="outline">{clienteDetail.cittadinanza}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Codice Fiscale</p><p className="text-gray-900">{clienteDetail.codiceFiscale || "N/D"}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Passaporto</p><p className="text-gray-900">{clienteDetail.numeroPassaporto || "N/D"}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Telefono</p><p className="text-gray-900 flex items-center gap-1"><Phone className="w-3 h-3" /> {clienteDetail.telefono || "N/D"}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Cellulare</p><p className="text-gray-900 flex items-center gap-1"><Phone className="w-3 h-3" /> {clienteDetail.cellulare || "N/D"}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Email</p><p className="text-gray-900 flex items-center gap-1"><Mail className="w-3 h-3" /> {clienteDetail.email || "N/D"}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">PEC</p><p className="text-gray-900">{clienteDetail.pec || "N/D"}</p></div>
                <div className="col-span-2"><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Indirizzo</p><p className="text-gray-900 flex items-center gap-1"><MapPin className="w-3 h-3" />{clienteDetail.indirizzoResidenza || "N/D"}{clienteDetail.comuneResidenza && `, ${clienteDetail.comuneResidenza}`}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Professione</p><p className="text-gray-900">{clienteDetail.professione || "N/D"}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Datore Lavoro</p><p className="text-gray-900">{clienteDetail.datoreLavoro || "N/D"}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Permesso Attuale</p><p className="text-gray-900">{clienteDetail.permessoAttuale || "N/D"}</p></div>
                <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Scadenza Permesso</p><p className="text-gray-900">{clienteDetail.dataScadenzaPermesso ? new Date(clienteDetail.dataScadenzaPermesso).toLocaleDateString("it-IT") : "N/D"}</p></div>
              </div>
              {clienteDetail.note && <div><p className="text-gray-500 text-xs uppercase font-semibold mb-1">Note</p><p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{clienteDetail.note}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}