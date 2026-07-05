import { trpc } from "@/providers/trpc";
import {
  Users,
  FolderOpen,
  FileText,
  Shield,
  Gavel,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: scadenze } = trpc.dashboard.scadenzeImminenti.useQuery();
  const { data: praticheRecenti } = trpc.dashboard.praticheRecenti.useQuery();
  const { data: distribuzione } = trpc.dashboard.distribuzionePratiche.useQuery();

  const scadenzeUrgenti =
    scadenze?.filter((s) => {
      const giorni = Math.ceil(
        (new Date(s.dataEvento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return giorni <= 7 && giorni >= 0;
    }) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clienti Totali" value={stats?.clienti.total || 0} subtitle={`${stats?.clienti.attivi || 0} attivi`} icon={Users} color="bg-blue-600" />
        <StatCard title="Pratiche Aperte" value={stats?.pratiche.aperte || 0} subtitle={`${stats?.pratiche.urgenti || 0} urgenti`} icon={FolderOpen} color="bg-amber-600" />
        <StatCard title="Permessi in Scadenza" value={stats?.permessi.inScadenza || 0} subtitle="Nei prossimi 30 giorni" icon={FileText} color="bg-red-500" />
        <StatCard title="Scadenze Prossime" value={stats?.scadenze.prossime7 || 0} subtitle={`${stats?.scadenze.prossime30 || 0} nei prossimi 30 giorni`} icon={Calendar} color="bg-emerald-600" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Protezione Int." value={stats?.protezione.total || 0} subtitle={`${stats?.protezione.inCorso || 0} in istruttoria`} icon={Shield} color="bg-indigo-600" />
        <StatCard title="Contenzioso Attivo" value={stats?.contenzioso.attivo || 0} subtitle={`${stats?.contenzioso.total || 0} totali`} icon={Gavel} color="bg-purple-600" />
        <StatCard title="Pratiche Completate" value={stats?.pratiche.completate || 0} subtitle="Quest'anno" icon={TrendingUp} color="bg-teal-600" />
        <StatCard title="Pratiche in Corso" value={stats?.pratiche.inCorso || 0} subtitle="Attivamente gestite" icon={Clock} color="bg-sky-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Scadenze Imminenti
              </CardTitle>
              <Badge variant="secondary" className="text-xs">{scadenzeUrgenti.length} urgenti</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {scadenzeUrgenti.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">Nessuna scadenza urgente</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {scadenzeUrgenti.slice(0, 8).map((s) => {
                  const giorni = Math.ceil((new Date(s.dataEvento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${giorni <= 2 ? "bg-red-500" : giorni <= 5 ? "bg-amber-500" : "bg-emerald-500"}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.titolo}</p>
                          <p className="text-xs text-gray-500">{s.tipo.replace(/_/g, " ")} - {s.luogo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={giorni <= 2 ? "destructive" : "outline"} className="text-xs">
                          {giorni === 0 ? "Oggi" : giorni === 1 ? "Domani" : `${giorni} giorni`}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{new Date(s.dataEvento).toLocaleDateString("it-IT")}{s.oraEvento && ` ${s.oraEvento}`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold">Distribuzione Pratiche</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {distribuzione && distribuzione.length > 0 ? (
              <div className="space-y-3">
                {distribuzione.map((d) => (
                  <div key={d.categoria} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{d.categoria.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1a365d] rounded-full" style={{ width: `${stats ? (d.count / stats.pratiche.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{d.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm py-4">Nessun dato disponibile</div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-semibold">Pratiche Recenti</CardTitle>
        </CardHeader>
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
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase">Data Apertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {praticheRecenti && praticheRecenti.length > 0 ? praticheRecenti.slice(0, 8).map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.numeroPratica}</td>
                    <td className="px-5 py-3 text-gray-700 max-w-xs truncate">{p.oggetto}</td>
                    <td className="px-5 py-3"><span className="capitalize text-gray-600">{p.categoria.replace(/_/g, " ")}</span></td>
                    <td className="px-5 py-3"><Badge variant={p.stato === "completata" ? "default" : p.stato === "in_corso" ? "secondary" : p.stato === "aperta" ? "outline" : "destructive"} className="text-xs capitalize">{p.stato.replace(/_/g, " ")}</Badge></td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold ${p.priorita === "urgente" ? "text-red-600" : p.priorita === "alta" ? "text-amber-600" : "text-gray-600"}`}>{p.priorita}</span></td>
                    <td className="px-5 py-3 text-gray-500">{p.dataApertura ? new Date(p.dataApertura).toLocaleDateString("it-IT") : "-"}</td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-5 py-6 text-center text-gray-500">Nessuna pratica recente</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}