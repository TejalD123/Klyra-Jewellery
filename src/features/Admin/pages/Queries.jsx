import { useEffect, useState } from "react";
import { MessageSquareText, ChevronRight } from "lucide-react";
import Topbar from "../components/TopBar";
import QueryDetailModal from "../components/QueryDetailModal";
import { queryAPI } from "../../query/services/query.api";
import "../styles/adminQuery.css";

const TABS = [
  { key: "new", label: "New" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "", label: "All" },
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function Queries() {
  const [queries, setQueries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState("new");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [tabCounts, setTabCounts] = useState({});

  const load = (page = 1) => {
    setLoading(true);
    queryAPI
      .getAll({ page, status: statusFilter || undefined, search: search || undefined })
      .then((data) => {
        setQueries(data.queries || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };

  const loadCounts = () => {
    Promise.all(
      TABS.filter((t) => t.key).map((t) =>
        queryAPI
          .getAll({ page: 1, status: t.key })
          .then((data) => [t.key, data.pagination?.total ?? 0])
          .catch(() => [t.key, 0])
      )
    ).then((entries) => setTabCounts(Object.fromEntries(entries)));
  };

  useEffect(() => { load(1); }, [statusFilter]);
  useEffect(() => { loadCounts(); }, []);

  const handleModalClose = (didUpdate) => {
    setSelectedQuery(null);
    if (didUpdate) {
      load(pagination.page);
      loadCounts();
    }
  };

  return (
    <div className="qry-page">
      <Topbar title="Customer Queries" subtitle={`${pagination.total} in ${TABS.find((t) => t.key === statusFilter)?.label || "all"}`} />

      <div className="qry-tabs">
        {TABS.map((t) => (
          <button
            key={t.key || "all"}
            type="button"
            className={`qry-tab ${statusFilter === t.key ? "qry-tab--active" : ""}`}
            onClick={() => setStatusFilter(t.key)}
          >
            {t.label}
            {t.key && <span className="qry-tab-count">{tabCounts[t.key] ?? "–"}</span>}
          </button>
        ))}
      </div>

      <div className="qry-filters">
        <input
          className="qry-search"
          placeholder="Search name, email, message…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(1)}
        />
      </div>

      <div className="qry-card">
        <table className="qry-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="qry-empty">Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="qry-empty qry-error">{error}</td></tr>
            ) : queries.length === 0 ? (
              <tr>
                <td colSpan={6} className="qry-empty">
                  <MessageSquareText size={28} strokeWidth={1.2} />
                  <p>Ya tab madhe kahi query nahi.</p>
                </td>
              </tr>
            ) : (
              queries.map((q) => (
                <tr key={q._id} className="qry-row" onClick={() => setSelectedQuery(q)}>
                  <td>
                    <div className="qry-from-name">{q.name}</div>
                    <div className="qry-from-sub">{q.email}{q.phone ? ` · ${q.phone}` : ""}</div>
                  </td>
                  <td className="qry-subject">{q.subject || "General enquiry"}</td>
                  <td className="qry-message-preview">{q.message}</td>
                  <td>
                    <span className={`qry-status-badge qry-status-badge--${q.status}`}>
                      {q.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="qry-date">{formatDate(q.createdAt)}</td>
                  <td className="qry-chevron"><ChevronRight size={16} strokeWidth={1.5} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="qry-pagination">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div className="qry-pagination-btns">
              <button className="qry-page-btn" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</button>
              <button className="qry-page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedQuery && (
        <QueryDetailModal query={selectedQuery} onClose={handleModalClose} />
      )}
    </div>
  );
}