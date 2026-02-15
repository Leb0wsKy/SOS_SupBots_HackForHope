import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  UserPlus,
  X,
  Download,
  PenTool,
  Send,
  Activity,
  Archive,
  FileWarning,
  ClipboardList,
  Zap,
} from 'lucide-react';
import { getActivityHistory } from '../services/api';

/* ═══════════════════════════════════════════════════════
   Action → French label + icon + color
   ═══════════════════════════════════════════════════════ */
const ACTION_META = {
  CREATE_SIGNALEMENT:      { label: 'Signalement créé',           icon: FileText,      color: 'text-sos-blue',   bg: 'bg-sos-blue-light' },
  UPDATE_SIGNALEMENT:      { label: 'Signalement modifié',        icon: FileText,      color: 'text-sos-blue',   bg: 'bg-sos-blue-light' },
  DELETE_SIGNALEMENT:      { label: 'Signalement supprimé',       icon: X,             color: 'text-sos-red',    bg: 'bg-sos-red-light' },
  CLASSIFY_SIGNALEMENT:    { label: 'Signalement classifié',      icon: Shield,        color: 'text-purple-600', bg: 'bg-purple-100' },
  ESCALATE_SIGNALEMENT:    { label: 'Signalement escaladé',       icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  CLOSE_SIGNALEMENT:       { label: 'Signalement clôturé',        icon: CheckCircle2,  color: 'text-sos-green',  bg: 'bg-sos-green-light' },
  ARCHIVE_SIGNALEMENT:     { label: 'Signalement archivé',        icon: Archive,       color: 'text-sos-gray-500', bg: 'bg-sos-gray-100' },
  ASSIGN_SIGNALEMENT:      { label: 'Signalement assigné',        icon: UserPlus,      color: 'text-sos-blue',   bg: 'bg-sos-blue-light' },
  SAUVEGARDER_SIGNALEMENT: { label: 'Signalement sauvegardé',     icon: ClipboardList, color: 'text-sos-blue',   bg: 'bg-sos-blue-light' },
  MARK_FAUX_SIGNALEMENT:   { label: 'Marqué faux signalement',    icon: FileWarning,   color: 'text-sos-gray-500', bg: 'bg-sos-gray-100' },
  DIRECTOR_SIGN:           { label: 'Signature directeur',        icon: PenTool,       color: 'text-indigo-600', bg: 'bg-indigo-100' },
  DIRECTOR_FORWARD:        { label: 'Transmis au national',       icon: Send,          color: 'text-sos-green',  bg: 'bg-sos-green-light' },
  CREATE_WORKFLOW:          { label: 'Workflow créé',              icon: Activity,      color: 'text-sos-blue',   bg: 'bg-sos-blue-light' },
  UPDATE_WORKFLOW:          { label: 'Workflow mis à jour',        icon: Activity,      color: 'text-sos-blue',   bg: 'bg-sos-blue-light' },
  CLOSE_WORKFLOW:           { label: 'Workflow clôturé',           icon: CheckCircle2,  color: 'text-sos-green',  bg: 'bg-sos-green-light' },
  COMPLETE_STAGE:           { label: 'Étape complétée',            icon: CheckCircle2,  color: 'text-sos-green',  bg: 'bg-sos-green-light' },
  GENERATE_DPE:             { label: 'Rapport DPE généré',         icon: Zap,           color: 'text-purple-600', bg: 'bg-purple-100' },
  UPDATE_DPE:               { label: 'Rapport DPE modifié',        icon: FileText,      color: 'text-purple-600', bg: 'bg-purple-100' },
  SUBMIT_DPE:               { label: 'Rapport DPE soumis',         icon: Send,          color: 'text-sos-green',  bg: 'bg-sos-green-light' },
  SAVE_DPE_REPORT:          { label: 'Rapport DPE sauvegardé',     icon: Download,      color: 'text-sos-blue',   bg: 'bg-sos-blue-light' },
  DOWNLOAD_TEMPLATE:        { label: 'Modèle téléchargé',          icon: Download,      color: 'text-sos-gray-500', bg: 'bg-sos-gray-100' },
  DOWNLOAD_ATTACHMENT:      { label: 'Pièce jointe téléchargée',   icon: Download,      color: 'text-sos-gray-500', bg: 'bg-sos-gray-100' },
  PREDICT_FALSE_ALARM:      { label: 'Prédiction fausse alarme',   icon: Zap,           color: 'text-amber-600',  bg: 'bg-amber-100' },
};

const ROLE_LABELS = {
  LEVEL1: 'Déclarant',
  LEVEL2: 'Analyste',
  LEVEL3: 'Gouvernance',
  LEVEL4: 'Super Admin',
};

const FILTER_GROUPS = [
  { label: 'Signalements', actions: ['CREATE_SIGNALEMENT', 'UPDATE_SIGNALEMENT', 'CLASSIFY_SIGNALEMENT', 'ESCALATE_SIGNALEMENT', 'CLOSE_SIGNALEMENT', 'ARCHIVE_SIGNALEMENT', 'SAUVEGARDER_SIGNALEMENT', 'MARK_FAUX_SIGNALEMENT'] },
  { label: 'Workflow', actions: ['CREATE_WORKFLOW', 'UPDATE_WORKFLOW', 'CLOSE_WORKFLOW', 'COMPLETE_STAGE'] },
  { label: 'DPE', actions: ['GENERATE_DPE', 'UPDATE_DPE', 'SUBMIT_DPE', 'SAVE_DPE_REPORT'] },
  { label: 'Directeur', actions: ['DIRECTOR_SIGN', 'DIRECTOR_FORWARD'] },
];

const fmtDateTime = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' à '
    + dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const fmtRelative = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return '';
};

/* ═══════════════════════════════════════════════════════
   HistoryPanel Component
   ═══════════════════════════════════════════════════════ */
export default function HistoryPanel() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const LIMIT = 20;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (actionFilter) params.action = actionFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await getActivityHistory(params);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load history:', err);
      setLogs([]);
    }
    setLoading(false);
  }, [page, actionFilter, startDate, endDate]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [actionFilter, startDate, endDate]);

  // Client-side search filter on user name
  const displayed = searchTerm
    ? logs.filter(l => {
        const name = l.user?.name?.toLowerCase() || '';
        const email = l.user?.email?.toLowerCase() || '';
        const meta = ACTION_META[l.action]?.label?.toLowerCase() || l.action.toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term) || meta.includes(term);
      })
    : logs;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white border border-sos-gray-200 rounded-xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sos-gray-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, email ou action…"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-sos-gray-300 text-sm
                         placeholder:text-sos-gray-400 focus:outline-none focus:ring-2 focus:ring-sos-blue/40 transition"
            />
          </div>

          {/* Action filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-sos-gray-400" />
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-sos-gray-300 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-sos-blue/40"
            >
              <option value="">Toutes les actions</option>
              {FILTER_GROUPS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.actions.map(a => (
                    <option key={a} value={a}>{ACTION_META[a]?.label || a}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sos-gray-400 shrink-0" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-sos-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sos-blue/40" />
            <span className="text-sos-gray-400 text-sm">→</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-sos-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sos-blue/40" />
          </div>

          {/* Clear */}
          {(actionFilter || startDate || endDate || searchTerm) && (
            <button onClick={() => { setActionFilter(''); setStartDate(''); setEndDate(''); setSearchTerm(''); }}
              className="px-3 py-2 text-sm text-sos-gray-500 hover:text-sos-gray-700 hover:bg-sos-gray-100 rounded-lg transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Activity log */}
      <div className="bg-white border border-sos-gray-200 rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-sos-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sos-blue" />
            <h3 className="text-sm font-bold text-sos-gray-700 uppercase tracking-wide">Journal d'activité</h3>
          </div>
          <span className="text-xs text-sos-gray-400">{total} entrée{total !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-sos-blue animate-spin" />
            <span className="ml-2 text-sm text-sos-gray-500">Chargement…</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-sos-gray-300 mx-auto mb-3" />
            <p className="text-sos-gray-500 text-sm">Aucune activité trouvée</p>
            <p className="text-sos-gray-400 text-xs mt-1">Essayez de modifier les filtres ou la période</p>
          </div>
        ) : (
          <div className="divide-y divide-sos-gray-100">
            {displayed.map((log) => {
              const meta = ACTION_META[log.action] || { label: log.action, icon: Activity, color: 'text-sos-gray-500', bg: 'bg-sos-gray-100' };
              const Icon = meta.icon;
              const relative = fmtRelative(log.createdAt);

              return (
                <div key={log._id} className="px-6 py-4 hover:bg-sos-gray-50 transition flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
                      {log.targetModel && (
                        <span className="text-[10px] font-medium bg-sos-gray-100 text-sos-gray-500 px-1.5 py-0.5 rounded">
                          {log.targetModel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-sos-gray-600 font-medium">
                        {log.user?.name || 'Utilisateur inconnu'}
                      </span>
                      <span className="text-[10px] text-sos-gray-400">
                        {ROLE_LABELS[log.user?.role] || log.user?.role || ''}
                      </span>
                    </div>

                    {/* Details summary */}
                    {log.details?.body && (
                      <div className="mt-1.5 text-xs text-sos-gray-500 space-x-2">
                        {log.details.body.classification && (
                          <span className="inline-flex items-center gap-1 bg-sos-gray-100 px-2 py-0.5 rounded">
                            Classification: <strong>{log.details.body.classification}</strong>
                          </span>
                        )}
                        {log.details.body.closureReason && (
                          <span className="inline-flex items-center gap-1 bg-sos-gray-100 px-2 py-0.5 rounded">
                            Raison: <strong className="truncate max-w-[200px]">{log.details.body.closureReason}</strong>
                          </span>
                        )}
                        {log.details.body.stage && (
                          <span className="inline-flex items-center gap-1 bg-sos-gray-100 px-2 py-0.5 rounded">
                            Étape: <strong>{log.details.body.stage}</strong>
                          </span>
                        )}
                        {log.details.body.target && (
                          <span className="inline-flex items-center gap-1 bg-sos-gray-100 px-2 py-0.5 rounded">
                            Document: <strong>{log.details.body.target === 'FICHE_INITIALE' ? 'Fiche Initiale' : 'Rapport DPE'}</strong>
                          </span>
                        )}
                        {log.details.body.escalatedTo && (
                          <span className="inline-flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded text-orange-600">
                            Escaladé → <strong>{log.details.body.escalatedTo}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-sos-gray-500">{fmtDateTime(log.createdAt)}</p>
                    {relative && <p className="text-[10px] text-sos-gray-400 mt-0.5">{relative}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-3 border-t border-sos-gray-200 flex items-center justify-between">
            <p className="text-xs text-sos-gray-400">
              Page {page} sur {pages} · {total} résultat{total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-sos-gray-100 transition disabled:opacity-30 cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-sos-gray-600" />
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let pNum;
                if (pages <= 5) {
                  pNum = i + 1;
                } else if (page <= 3) {
                  pNum = i + 1;
                } else if (page >= pages - 2) {
                  pNum = pages - 4 + i;
                } else {
                  pNum = page - 2 + i;
                }
                return (
                  <button key={pNum} onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition cursor-pointer ${
                      pNum === page
                        ? 'bg-sos-blue text-white'
                        : 'text-sos-gray-500 hover:bg-sos-gray-100'
                    }`}>
                    {pNum}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
                className="p-1.5 rounded-lg hover:bg-sos-gray-100 transition disabled:opacity-30 cursor-pointer">
                <ChevronRight className="w-4 h-4 text-sos-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
