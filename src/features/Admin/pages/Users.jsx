import { useEffect, useState } from "react";
import Topbar from "../components/TopBar";
import { fetchUsers } from "../services/Userservice";

import "../styles/admincard.css";
import "../styles/admintable.css";
import "../styles/adminbadge.css";
import "../styles/admintableactions.css";

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "—";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = (page = 1, q = search) => {
    setLoading(true);
    fetchUsers({ page, search: q || undefined })
      .then((res) => {
        setUsers(res.data.data.users || []);
        setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers(1, "");
  }, []);

  return (
    <div className="space-y-6">
      <Topbar title="Users" subtitle={`${pagination.total} registered customers`} />

      <div className="admin-field" style={{ maxWidth: 320 }}>
        <input
          placeholder="Search by name / email / phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadUsers(1, search)}
        />
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Verified</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "var(--admin-danger)" }}>{error}</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">Kahi user sapadla nahi.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="admin-order-customer">
                      <span className="admin-avatar">{initials(u.fullName || u.username)}</span>
                      <div>
                        <div className="font-medium">{u.fullName || u.username}</div>
                        <div className="admin-order-customer__email">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{u.email || "—"}</td>
                  <td className="text-sm">{u.phone || "—"}</td>
                  <td>
                    <span className={`admin-badge ${u.isEmailVerified || u.isPhoneVerified ? "admin-badge-success" : "admin-badge-neutral"}`}>
                      {u.isEmailVerified || u.isPhoneVerified ? "verified" : "unverified"}
                    </span>
                  </td>
                  <td className="text-sm" style={{ color: "var(--admin-text-muted)" }}>
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-pagination__btn"
              disabled={pagination.page <= 1}
              onClick={() => loadUsers(pagination.page - 1)}
            >
              <IconChevronLeft />
              Previous
            </button>

            <div className="admin-pagination__info">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
            </div>

            <button
              className="admin-pagination__btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadUsers(pagination.page + 1)}
            >
              Next
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}