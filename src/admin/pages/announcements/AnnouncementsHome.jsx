import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  deleteAdminAnnouncement,
  getAdminAnnouncements,
} from "../../../api/announcements";
import AppLoader from "../../../components/AppLoader";
import {
  getAnnouncementId,
  normalizeAnnouncementList,
} from "../../../utils/announcements";
import AdminAnnouncementCompose, {
  AdminAnnouncementDetailDrawer,
  AdminAnnouncementListItem,
} from "./components/AdminAnnouncementPanels";

const panelClass = "rounded-2xl border border-white/15 bg-white/[0.07]";

export default function AdminAnnouncementsHome() {
  const { access_token } = useSelector((state) => state.user.value);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadItems = useCallback(async () => {
    if (!access_token) return;
    try {
      setLoading(true);
      setError("");
      const response = await getAdminAnnouncements(access_token, { page: 1, limit: 50 });
      const parsed = normalizeAnnouncementList(response);
      setItems(parsed.items);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load announcements.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [access_token]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (announcementId) => {
    if (!window.confirm("Delete this announcement for everyone?")) return;
    try {
      setDeletingId(announcementId);
      setError("");
      await deleteAdminAnnouncement(access_token, announcementId);
      setSuccess("Announcement deleted.");
      if (getAnnouncementId(selected) === announcementId) {
        setDrawerOpen(false);
        setSelected(null);
      }
      await loadItems();
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || "Failed to delete announcement.");
    } finally {
      setDeletingId("");
    }
  };

  const handleSelect = (item) => {
    setSelected(item);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Announcements
        </h1>
        <p className="mt-2 text-sm text-white/75">
          Broadcast messages to staff and portal members. View reactions and manage posts.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <AdminAnnouncementCompose
        accessToken={access_token}
        onCreated={() => {
          setSuccess("Announcement broadcast successfully.");
          loadItems();
        }}
      />

      <section className={`${panelClass} p-5`}>
        <h2 className="text-lg font-semibold text-white">Sent broadcasts</h2>
        {loading ? (
          <AppLoader label="Loading announcements…" minHeight="min-h-[28vh]" compact />
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No announcements sent yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {items.map((item) => (
              <li key={getAnnouncementId(item)}>
                <AdminAnnouncementListItem
                  item={item}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  deleting={deletingId === getAnnouncementId(item)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminAnnouncementDetailDrawer
        open={drawerOpen}
        item={selected}
        accessToken={access_token}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        onUpdated={(record) => {
          setSuccess("Announcement updated.");
          setItems((prev) =>
            prev.map((item) =>
              getAnnouncementId(item) === getAnnouncementId(record) ? { ...item, ...record } : item,
            ),
          );
        }}
      />
    </div>
  );
}
