import { useEffect, useMemo, useState } from "react";
import {
  createQuestionaryEnquiry,
  getQuestionariesByService,
} from "../api/questionaries";
import BrandText from "./BrandText";

export default function QuestionaryEnquiryFlow({
  service,
  /** ~80% white card; override if needed */
  cardClassName = "border-[#0f2e1a]/12 bg-white/80",
  /** Shown after the last question; Yes reveals the enquiry form */
  interstitialBeforeEnquiry = "",
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [questionary, setQuestionary] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [enquiryIntent, setEnquiryIntent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    gender: "",
    age: "",
  });

  const hasInterstitial = Boolean(interstitialBeforeEnquiry?.trim());

  useEffect(() => {
    const loadQuestionary = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getQuestionariesByService(null, service);
        const payload = response?.data ?? response;
        const picked = Array.isArray(payload) ? payload[0] : payload;
        setQuestionary(picked || null);
      } catch (apiError) {
        setError(
          apiError?.response?.data?.message || "Failed to load questions for this service.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestionary();
  }, [service]);

  const questions = useMemo(
    () =>
      Array.isArray(questionary?.questions)
        ? [...questionary.questions].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
        : [],
    [questionary],
  );

  const currentQuestion = questions[currentIndex];
  const selectedValue = currentQuestion
    ? answersMap[currentQuestion?._id || `${currentIndex}`]
    : "";

  const pastQuestions =
    started && questions.length > 0 && currentIndex >= questions.length;

  const showInterstitial =
    pastQuestions && hasInterstitial && enquiryIntent === null;

  const showForm =
    pastQuestions &&
    (!hasInterstitial || enquiryIntent === "yes");

  const showDeclined = pastQuestions && hasInterstitial && enquiryIntent === "no";

  const handleOptionChange = (value) => {
    if (!currentQuestion) return;
    const key = currentQuestion?._id || `${currentIndex}`;
    setAnswersMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!currentQuestion || !selectedValue) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (
        !form.name.trim() ||
        !form.phoneNumber.trim() ||
        !form.email.trim() ||
        !form.gender.trim() ||
        !String(form.age).trim()
      ) {
        throw new Error("All enquiry fields are required.");
      }

      if (!questionary?._id) throw new Error("Questionary not found.");

      const answers = questions.map((question, index) => ({
        questionId: question?._id || `${index}`,
        questionIndex: index,
        value: answersMap[question?._id || `${index}`] || "",
        prompt: question?.prompt || "",
        type: question?.type || "single_choice",
      }));

      await createQuestionaryEnquiry(null, questionary._id, {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        gender: form.gender.trim(),
        age: Number(form.age),
        answers,
      });

      setSuccess("Enquiry submitted successfully.");
      setStarted(false);
      setCurrentIndex(0);
      setAnswersMap({});
      setEnquiryIntent(null);
      setForm({ name: "", phoneNumber: "", email: "", gender: "", age: "" });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-6 shadow-lg backdrop-blur-sm sm:p-8 ${cardClassName}`}
    >
      <h3 className="font-display text-2xl font-semibold text-[#0a1a12] sm:text-[1.65rem]">
        We request you to answer the questions
      </h3>
      <p className="mt-2 text-base font-medium text-[#0f2e1a]/85">
        Answer one by one, then submit your enquiry details.
      </p>

      {loading ? (
        <p className="mt-4 text-base font-medium text-[#0f2e1a]/75">Loading questions...</p>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-lg border border-red-400/50 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-lg border border-emerald-400/50 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
          {success}
        </div>
      ) : null}

      {!loading && !started && questions.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            setStarted(true);
            setCurrentIndex(0);
            setAnswersMap({});
            setEnquiryIntent(null);
            setSuccess("");
            setError("");
          }}
          className="mt-5 rounded-full bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-7 py-3 text-base font-semibold text-[#0f2e1a] shadow-md transition hover:opacity-95"
        >
          Start
        </button>
      ) : null}

      {!loading && started && currentQuestion ? (
        <div className="mt-5 rounded-xl border border-[#0f2e1a]/10 bg-white/95 p-5 shadow-inner transition-all duration-300 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d9488]">
            Question {currentIndex + 1} / {questions.length}
          </p>
          <h4 className="mt-3 text-lg font-semibold leading-snug text-[#0a1a12] sm:text-xl">
            {currentQuestion.prompt}
          </h4>

          <div className="mt-4 space-y-2.5">
            {(currentQuestion.options || []).map((option, idx) => {
              const active = selectedValue === option;
              return (
                <label
                  key={`${currentQuestion._id || currentIndex}-${idx}`}
                  className={`block cursor-pointer rounded-lg border px-4 py-3 text-base font-medium transition ${
                    active
                      ? "border-[#0f766e] bg-[#ccfbf1] text-[#042f2e] shadow-sm"
                      : "border-[#0f2e1a]/15 bg-white text-[#0f2e1a] hover:border-[#0d9488]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id || currentIndex}`}
                    value={option}
                    checked={active}
                    onChange={() => handleOptionChange(option)}
                    className="hidden"
                  />
                  {option}
                </label>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="rounded-lg border border-[#0f2e1a]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#0f2e1a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedValue}
              className="rounded-lg bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-5 py-2.5 text-sm font-semibold text-[#0f2e1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {currentIndex === questions.length - 1 ? "Continue" : "Next"}
            </button>
          </div>
        </div>
      ) : null}

      {!loading && showInterstitial ? (
        <div className="mt-5 rounded-xl border border-[#0f2e1a]/10 bg-white/95 p-5 shadow-inner sm:p-7">
          <p className="text-base font-semibold leading-relaxed text-[#0a1a12] sm:text-lg">
            <BrandText text={interstitialBeforeEnquiry} />
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setEnquiryIntent("yes")}
              className="rounded-full bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-8 py-3 text-base font-semibold text-[#0f2e1a] shadow-md"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setEnquiryIntent("no")}
              className="rounded-full border-2 border-[#0f2e1a]/25 bg-white px-8 py-3 text-base font-semibold text-[#0f2e1a] hover:bg-[#0f2e1a]/5"
            >
              No
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex(Math.max(0, questions.length - 1))}
              className="ml-auto text-sm font-semibold text-[#0d9488] underline-offset-2 hover:underline"
            >
              Back to last question
            </button>
          </div>
        </div>
      ) : null}

      {!loading && showDeclined ? (
        <div className="mt-5 rounded-xl border border-[#0f2e1a]/10 bg-white/95 p-5 text-base font-medium text-[#0f2e1a]">
          Thank you for your time. We are glad you explored the questions.
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Name"
            className="rounded-xl border border-[#0f2e1a]/20 bg-white px-4 py-3 text-base text-[#0f2e1a] outline-none placeholder:text-[#0f2e1a]/45 focus:border-[#0d9488]/70"
          />
          <input
            value={form.phoneNumber}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
            }
            placeholder="Phone Number"
            className="rounded-xl border border-[#0f2e1a]/20 bg-white px-4 py-3 text-base text-[#0f2e1a] outline-none placeholder:text-[#0f2e1a]/45 focus:border-[#0d9488]/70"
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email"
            className="rounded-xl border border-[#0f2e1a]/20 bg-white px-4 py-3 text-base text-[#0f2e1a] outline-none placeholder:text-[#0f2e1a]/45 focus:border-[#0d9488]/70"
          />
          <input
            value={form.gender}
            onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
            placeholder="Gender"
            className="rounded-xl border border-[#0f2e1a]/20 bg-white px-4 py-3 text-base text-[#0f2e1a] outline-none placeholder:text-[#0f2e1a]/45 focus:border-[#0d9488]/70"
          />
          <input
            type="number"
            min="1"
            value={form.age}
            onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
            placeholder="Age"
            className="rounded-xl border border-[#0f2e1a]/20 bg-white px-4 py-3 text-base text-[#0f2e1a] outline-none placeholder:text-[#0f2e1a]/45 focus:border-[#0d9488]/70 sm:col-span-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-6 py-3 text-base font-semibold text-[#0f2e1a] sm:col-span-2 disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Enquiry"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
