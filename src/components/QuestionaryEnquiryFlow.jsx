import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createQuestionaryEnquiry,
  getQuestionariesByService,
  QuestionaryService,
} from "../api/questionaries";
import PlaceSearchAutocomplete from "./PlaceSearchAutocomplete";
import {
  fetchNearestFromCoords,
  normalizeMapsPlace,
} from "../utils/nearestFranchiseLocation";
import BrandText from "./BrandText";

const COMPLETE_PACKAGE_SERVICES = [
  QuestionaryService.SKILLS_BEHIND_STUDIES,
  QuestionaryService.BEHAVIORAL_AWARENESS,
  QuestionaryService.RELATIONSHIP_AWARENESS,
  QuestionaryService.TALENT_AWARENESS,
];

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
  const [nearestBranchLabel, setNearestBranchLabel] = useState("");
  const [locationNote, setLocationNote] = useState("");
  /** Set when user picks a place: coords + nearest + source for submit */
  const [enquiryLocation, setEnquiryLocation] = useState(null);
  const [resolvingNearest, setResolvingNearest] = useState(false);
  const [placePickerKey, setPlacePickerKey] = useState(0);
  const [combinedQuestions, setCombinedQuestions] = useState(null);

  const hasInterstitial = Boolean(interstitialBeforeEnquiry?.trim());
  const isCompletePackage = service === QuestionaryService.COMPLETE_PACKAGE;

  useEffect(() => {
    const loadQuestionary = async () => {
      try {
        setLoading(true);
        setError("");
        setCombinedQuestions(null);

        if (isCompletePackage) {
          const [packageRes, ...serviceResponses] = await Promise.all([
            getQuestionariesByService(null, QuestionaryService.COMPLETE_PACKAGE).catch(
              () => null,
            ),
            ...COMPLETE_PACKAGE_SERVICES.map((svc) =>
              getQuestionariesByService(null, svc),
            ),
          ]);

          const packagePayload = packageRes?.data ?? packageRes;
          const packageQuestionary = Array.isArray(packagePayload)
            ? packagePayload[0]
            : packagePayload;
          setQuestionary(packageQuestionary || null);

          const merged = serviceResponses.flatMap((res, serviceIndex) => {
            const payload = res?.data ?? res;
            const picked = Array.isArray(payload) ? payload[0] : payload;
            const items = Array.isArray(picked?.questions) ? picked.questions : [];
            return items
              .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
              .map((q, idx) => ({
                ...q,
                _combinedService: COMPLETE_PACKAGE_SERVICES[serviceIndex],
                _combinedQuestionaryId: picked?._id || "",
                _combinedOrder: idx,
              }));
          });

          if (!merged.length) {
            throw new Error(
              "No questions configured for Complete Package services.",
            );
          }
          setCombinedQuestions(merged);
        } else {
          const response = await getQuestionariesByService(null, service);
          const payload = response?.data ?? response;
          const picked = Array.isArray(payload) ? payload[0] : payload;
          setQuestionary(picked || null);
        }
      } catch (apiError) {
        setError(
          apiError?.response?.data?.message ||
            "Failed to load questions for this service.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestionary();
  }, [service, isCompletePackage]);

  const questions = useMemo(
    () => {
      if (Array.isArray(combinedQuestions) && combinedQuestions.length) {
        return combinedQuestions;
      }
      return Array.isArray(questionary?.questions)
        ? [...questionary.questions].sort(
            (a, b) => (a?.order ?? 0) - (b?.order ?? 0),
          )
        : [];
    },
    [questionary, combinedQuestions],
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
    pastQuestions && (!hasInterstitial || enquiryIntent === "yes");

  const showDeclined =
    pastQuestions && hasInterstitial && enquiryIntent === "no";

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

  const handleEnquiryPlaceSelected = useCallback(async (place) => {
    if (!place) {
      setEnquiryLocation(null);
      setNearestBranchLabel("");
      setLocationNote("");
      return;
    }

    const coords = normalizeMapsPlace(place);
    if (!coords) {
      setEnquiryLocation(null);
      setNearestBranchLabel("");
      setLocationNote(
        "Could not read coordinates for this place. Try another suggestion.",
      );
      return;
    }

    setResolvingNearest(true);
    setLocationNote("");
    setNearestBranchLabel("Finding nearest branch…");

    try {
      const r = await fetchNearestFromCoords(
        coords.latitude,
        coords.longitude,
        "maps_place",
      );
      setEnquiryLocation({
        latitude: r.latitude,
        longitude: r.longitude,
        nearest: r.nearest,
        locationSource: r.locationSource,
      });
      const notes = [];
      if (r.nearestError) notes.push(r.nearestError);
      if (r.nearestQueried && !r.nearest && !r.nearestError) {
        notes.push("No nearest branch was returned for this location.");
      }
      setNearestBranchLabel(r.nearest?.label || "");
      setLocationNote(notes.join(" "));
    } catch (err) {
      setEnquiryLocation(null);
      setNearestBranchLabel("");
      setLocationNote(err?.message || "Nearest branch lookup failed.");
    } finally {
      setResolvingNearest(false);
    }
  }, []);

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

      const submitQuestionaryId =
        questionary?._id || questions.find((q) => q?._combinedQuestionaryId)?._combinedQuestionaryId;
      if (!submitQuestionaryId) throw new Error("Questionary not found.");

      const answers = questions.map((question, index) => ({
        questionId: question?._id || `${index}`,
        questionIndex: index,
        value: answersMap[question?._id || `${index}`] || "",
        prompt: question?.prompt || "",
        type: question?.type || "single_choice",
        service: question?._combinedService || service,
        sourceQuestionaryId: question?._combinedQuestionaryId || questionary?._id || "",
      }));

      let latitude = enquiryLocation?.latitude ?? null;
      let longitude = enquiryLocation?.longitude ?? null;
      let nearest = enquiryLocation?.nearest ?? null;
      let locationSource = enquiryLocation?.locationSource ?? null;

      const payload = {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        gender: form.gender.trim(),
        age: Number(form.age),
        answers,
        latitude,
        longitude,
        locationSource,
        nearestFranchiseId: nearest?.id || null,
        nearestFranchiseName: nearest?.name || null,
      };
      if (isCompletePackage) {
        payload.packageType = "complete_package";
        payload.selectedServices = COMPLETE_PACKAGE_SERVICES;
      }

      await createQuestionaryEnquiry(null, submitQuestionaryId, payload);

      setSuccess("Enquiry submitted successfully.");
      setStarted(false);
      setCurrentIndex(0);
      setAnswersMap({});
      setEnquiryIntent(null);
      setForm({ name: "", phoneNumber: "", email: "", gender: "", age: "" });
      setNearestBranchLabel("");
      setLocationNote("");
      setEnquiryLocation(null);
      setPlacePickerKey((k) => k + 1);
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
      {loading ? (
        <p className="text-base font-medium text-[#0f2e1a]/75">
          Loading questions...
        </p>
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

      {!started ? (
        <>
          <h3 className="font-display text-2xl font-semibold text-[#0a1a12] sm:text-[1.65rem]">
            We request you to answer the questions
          </h3>

          <div
            className="qe-discount-note relative mt-4 overflow-hidden rounded-2xl border-2 border-[#c9a86c]/70 bg-linear-to-br from-[#fffbeb] via-white to-[#ecfdf5] p-4 shadow-[0_8px_30px_rgba(201,168,108,0.22)] sm:p-5"
            role="note"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#c9a86c]/20 blur-2xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-[#5eead4]/15 blur-2xl"
              aria-hidden
            />
            <p className="relative text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#b45309]">
              Important note
            </p>
            <p className="relative mt-2 text-[0.98rem] font-semibold leading-relaxed text-[#0a1a12] sm:text-[1.05rem]">
              If all your Answers are matching with our Analysis, you get{" "}
              <strong className="font-bold text-[#0a1a12]">5% Discount</strong>{" "}
              in the Service.
            </p>
          </div>

          <p className="mt-3 text-base font-medium text-[#0f2e1a]/85">
            Answer one by one, then submit your enquiry details.
          </p>

          {!loading && questions.length > 0 ? (
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
        </>
      ) : null}

      {started && showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mt-1 grid gap-3 sm:grid-cols-2"
        >
          <input
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
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
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="Email"
            className="rounded-xl border border-[#0f2e1a]/20 bg-white px-4 py-3 text-base text-[#0f2e1a] outline-none placeholder:text-[#0f2e1a]/45 focus:border-[#0d9488]/70"
          />
          <label className="relative block">
            <select
              value={form.gender}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, gender: event.target.value }))
              }
              className="w-full rounded-xl border border-[#0f2e1a]/20 bg-white px-4 py-3 text-base text-[#0f2e1a] outline-none focus:border-[#0d9488]/70"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </label>
          <input
            type="number"
            min="1"
            value={form.age}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, age: event.target.value }))
            }
            placeholder="Age"
            className="rounded-xl border border-[#0f2e1a]/20 bg-white px-4 py-3 text-base text-[#0f2e1a] outline-none placeholder:text-[#0f2e1a]/45 focus:border-[#0d9488]/70 sm:col-span-2"
          />
          <div className="rounded-xl border border-[#0f2e1a]/12 bg-[#f8faf8] p-4 sm:col-span-2">
            <p className="text-sm font-medium text-[#0f2e1a]/85">
              Select your location — we show your nearest franchise as soon as
              you pick a result.
            </p>
            <div className="mt-3">
              <PlaceSearchAutocomplete
                key={placePickerKey}
                theme="light"
                label="Your location *"
                hint="Search, then choose a suggestion. Nearest branch updates immediately."
                disabled={submitting || resolvingNearest}
                onPlaceSelected={handleEnquiryPlaceSelected}
                onClear={() => void handleEnquiryPlaceSelected(null)}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#0f2e1a]/60">
              Nearest franchise
            </label>
            <input
              readOnly
              value={nearestBranchLabel}
              placeholder="Choose your location above to see your nearest branch."
              className="mt-1 w-full cursor-default rounded-xl border border-[#0f2e1a]/15 bg-[#f8faf8] px-4 py-3 text-sm text-[#0f2e1a]/90 outline-none"
            />
            {locationNote ? (
              <p className="mt-1 text-xs font-medium text-amber-800/90">
                {locationNote}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={submitting || resolvingNearest}
            className="rounded-full bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-6 py-3 text-base font-semibold text-[#0f2e1a] sm:col-span-2 disabled:opacity-70"
          >
            {submitting
              ? "Submitting..."
              : resolvingNearest
                ? "Finding branch…"
                : "Submit Enquiry"}
          </button>
        </form>
      ) : null}

      {started && showDeclined ? (
        <div className="mt-1 rounded-xl border border-[#0f2e1a]/10 bg-white/95 p-5 text-base font-medium text-[#0f2e1a]">
          Thank you for your time. We are glad you explored the questions.
        </div>
      ) : null}

      {started && showInterstitial ? (
        <div className="mt-1 rounded-xl border border-[#0f2e1a]/10 bg-white/95 p-5 shadow-inner sm:p-7">
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

      {started && !pastQuestions && currentQuestion ? (
        <div className="mt-1 rounded-xl border border-[#0f2e1a]/10 bg-white/95 p-5 shadow-inner transition-all duration-300 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d9488]">
            Question {currentIndex + 1} / {questions.length}
          </p>
          {currentQuestion?._combinedService ? (
            <p className="mt-2 inline-flex rounded-full border border-[#0d9488]/25 bg-[#ccfbf1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f766e]">
              {currentQuestion._combinedService}
            </p>
          ) : null}
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
    </div>
  );
}
