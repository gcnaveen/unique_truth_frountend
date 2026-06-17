import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { QuestionaryService } from "../../../api/questionaries";
import { getEnquiries, getEnquiriesStats } from "../../../api/enquire";
import EnquiriesStats from "./components/EnquiriesStats";
import ServiceTabs from "./components/ServiceTabs";
import EnquiriesTable from "./components/EnquiriesTable";
import EnquiryDetailsDrawer from "./components/EnquiryDetailsDrawer";

const TABS = [
  { id: QuestionaryService.SKILLS_BEHIND_STUDIES, label: "Skills Behind Studies" },
  { id: QuestionaryService.BEHAVIORAL_AWARENESS, label: "Behavioral Awareness" },
  { id: QuestionaryService.RELATIONSHIP_AWARENESS, label: "Relationship Awareness" },
  { id: QuestionaryService.TALENT_AWARENESS, label: "Talent Awareness" },
  { id: QuestionaryService.COMPLETE_PACKAGE, label: "Complete Package" },
];

const normalizeList = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.enquiries)) return payload.enquiries;
  return [];
};

const normalizeStats = (response) => response?.data ?? response ?? null;

const Enquiries = () => {
  const { access_token } = useSelector((state) => state.user.value);

  const [activeService, setActiveService] = useState(TABS[0].id);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const title = useMemo(
    () => TABS.find((t) => t.id === activeService)?.label || "Enquiries",
    [activeService],
  );

  useEffect(() => {
    if (!selected) {
      setIsDrawerVisible(false);
      return;
    }
    requestAnimationFrame(() => setIsDrawerVisible(true));
  }, [selected]);

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => setSelected(null), 300);
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");
        const res = await getEnquiriesStats(access_token);
        setStats(normalizeStats(res));
      } catch (e) {
        setStatsError(e?.response?.data?.message || "Failed to load enquiry stats.");
      } finally {
        setStatsLoading(false);
      }
    };
    if (access_token) loadStats();
  }, [access_token]);

  useEffect(() => {
    const loadRows = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getEnquiries(access_token, { service: activeService });
        setRows(normalizeList(res));
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load enquiries.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    if (access_token && activeService) loadRows();
  }, [access_token, activeService]);

  return (
    <>
      <section className="mx-auto w-full max-w-[min(100%,110rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8 xl:p-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl xl:text-4xl">
            Enquiries
          </h1>
          <p className="mt-1 text-sm text-white/90 md:text-base xl:text-lg">
            View enquiries by service and review submitted answers.
          </p>
        </div>
        <div className="text-sm font-semibold text-white/90 xl:text-base">{title}</div>
      </div>

      <div className="mt-6">
        <EnquiriesStats stats={stats} loading={statsLoading} />
        {statsError ? (
          <div className="mt-3 rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm font-medium text-white">
            {statsError}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <ServiceTabs tabs={TABS} activeId={activeService} onChange={setActiveService} />

        {error ? (
          <div className="rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm font-medium text-white">
            {error}
          </div>
        ) : null}

        <EnquiriesTable rows={rows} loading={loading} onView={setSelected} />
      </div>
      </section>

      {selected ? (
        <EnquiryDetailsDrawer
          enquiryId={selected?._id || selected?.id}
          initialEnquiry={selected}
          accessToken={access_token}
          open={isDrawerVisible}
          onClose={closeDrawer}
        />
      ) : null}
    </>
  );
};

export default Enquiries;