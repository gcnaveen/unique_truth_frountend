import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getQuestionaries } from "../../../api/questionaries";
import AppLoader from "../../../components/AppLoader";

const QuestionariesHome = () => {
  const navigate = useNavigate();
  const { access_token } = useSelector((state) => state.user.value);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedQuestionary, setSelectedQuestionary] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  useEffect(() => {
    const fetchQuestionaries = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getQuestionaries(access_token);
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setItems(list);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load questionaries.");
      } finally {
        setLoading(false);
      }
    };

    if (access_token) fetchQuestionaries();
  }, [access_token]);

  useEffect(() => {
    if (!selectedQuestionary) {
      setIsDrawerVisible(false);
      return;
    }
    requestAnimationFrame(() => setIsDrawerVisible(true));
  }, [selectedQuestionary]);

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => setSelectedQuestionary(null), 300);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const title = String(item?.title || "").toLowerCase();
      const service = String(item?.service || "").toLowerCase();
      const firstQuestion = String(item?.questions?.[0]?.prompt || "").toLowerCase();
      return title.includes(q) || service.includes(q) || firstQuestion.includes(q);
    });
  }, [items, search]);

  return (
    <>
      <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Questionaries
            </h1>
            <p className="mt-1 text-sm text-white/90 md:text-base">
              Search, view and edit all added questionaries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/questionaries/add")}
            className="rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-2 text-sm font-semibold text-[#0f2e1a] hover:opacity-90"
          >
            Add Questionary
          </button>
        </div>
  
        <div className="mb-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, service, or question..."
            className="w-full rounded-xl border border-white/25 bg-white/15 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4] md:text-[0.9375rem]"
          />
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm font-medium text-white">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-white/20">
          <table className="min-w-full divide-y divide-white/15">
            <thead className="bg-white/15">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white md:px-5">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white md:px-5">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white md:px-5">
                  Questions
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-white md:px-5">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 md:px-5" colSpan={4}>
                    <AppLoader label="Loading questionaries…" minHeight="min-h-[22vh]" compact />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-white md:px-5" colSpan={4}>
                    No questionaries found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item?._id || `${item?.service}-${item?.title}`}>
                    <td className="px-4 py-3 text-sm font-medium text-white md:px-5">
                      {item?.title || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white md:px-5">
                      {item?.service || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white md:px-5">
                      {Array.isArray(item?.questions) ? item.questions.length : 0}
                    </td>
                    <td className="px-4 py-3 text-right md:px-5">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedQuestionary(item)}
                          className="rounded-lg border border-[#5eead4]/70 bg-[#5eead4]/15 px-3 py-1.5 text-xs font-semibold text-[#a7f3d0] hover:bg-[#5eead4]/25"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/dashboard/questionaries/${item?._id}/edit`)
                          }
                          className="rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedQuestionary ? (
        <div className="fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeDrawer}
          />
          <aside
            className={`absolute right-0 top-0 h-full w-full max-w-full overflow-y-auto border-l border-white/20 bg-[#0f2e1a]/98 p-5 backdrop-blur-xl transition-transform duration-300 ease-out sm:w-[90%] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl md:p-6 ${
              isDrawerVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold leading-tight text-white md:text-2xl">
                  {selectedQuestionary?.title || "Questionary Details"}
                </h2>
                <p className="mt-1 text-sm font-medium text-white/95 md:text-base">
                  Service: {selectedQuestionary?.service || "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="shrink-0 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 md:space-y-5">
              {(selectedQuestionary?.questions || [])
                .slice()
                .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
                .map((question, questionIndex) => (
                  <div
                    key={question?._id || `q-${questionIndex}`}
                    className="rounded-xl border border-white/20 bg-white/12 p-4 md:p-5"
                  >
                    <h3 className="text-base font-semibold text-[#fde68a] md:text-lg">
                      Q{questionIndex + 1}. {question?.prompt || "-"}
                    </h3>
                    <p className="mt-1.5 text-xs font-medium text-white/95 md:text-sm">
                      Type: {question?.type || "-"} | Required:{" "}
                      {question?.required ? "Yes" : "No"}
                    </p>

                    <ul className="mt-3 space-y-1.5">
                      {(question?.options || []).map((option, optionIndex) => (
                        <li
                          key={`${question?._id || questionIndex}-opt-${optionIndex}`}
                          className="rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-sm font-medium text-white md:text-[0.9375rem]"
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default QuestionariesHome;