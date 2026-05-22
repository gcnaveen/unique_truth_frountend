import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getQuestionaryById,
  QuestionaryService,
  updateQuestionary,
} from "../../../api/questionaries";

const createQuestion = (order = 0) => ({
  prompt: "",
  type: "single_choice",
  options: ["", ""],
  placeholder: "",
  required: true,
  order,
});

const serviceOptions = Object.values(QuestionaryService);

const EditQuestions = () => {
  const navigate = useNavigate();
  const { questionaryId } = useParams();
  const { access_token } = useSelector((state) => state.user.value);

  const [service, setService] = useState(serviceOptions[0]);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([createQuestion(0)]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestionary = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getQuestionaryById(access_token, questionaryId);
        const data = response?.data || response;

        const incomingQuestions = Array.isArray(data?.questions) ? data.questions : [];
        setService(data?.service || serviceOptions[0]);
        setTitle(data?.title || "");
        setQuestions(
          incomingQuestions.length
            ? incomingQuestions.map((q, idx) => ({
                prompt: q?.prompt || "",
                type: q?.type || "single_choice",
                options: Array.isArray(q?.options) && q.options.length ? q.options : ["", ""],
                placeholder: q?.placeholder || "",
                required: q?.required !== false,
                order: Number.isFinite(q?.order) ? q.order : idx,
                _id: q?._id,
              }))
            : [createQuestion(0)],
        );
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load questionary.");
      } finally {
        setLoading(false);
      }
    };

    if (access_token && questionaryId) fetchQuestionary();
  }, [access_token, questionaryId]);

  const updateQuestion = (index, patch) => {
    setQuestions((prev) =>
      prev.map((question, idx) => (idx === index ? { ...question, ...patch } : question)),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createQuestion(prev.length)]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addOption = (questionIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === questionIndex ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== questionIndex || q.options.length <= 2) return q;
        return {
          ...q,
          options: q.options.filter((_, optIdx) => optIdx !== optionIndex),
        };
      }),
    );
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== questionIndex) return q;
        return {
          ...q,
          options: q.options.map((opt, optIdx) => (optIdx === optionIndex ? value : opt)),
        };
      }),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");

      const normalizedQuestions = questions.map((question, index) => ({
        _id: question._id,
        prompt: question.prompt.trim(),
        type: question.type || "single_choice",
        options: question.options.map((opt) => opt.trim()).filter(Boolean),
        placeholder: question.placeholder?.trim() || "",
        required: Boolean(question.required),
        order: index,
      }));

      if (!title.trim()) throw new Error("Title is required.");
      if (normalizedQuestions.some((q) => !q.prompt)) {
        throw new Error("Each question must have a prompt.");
      }
      if (normalizedQuestions.some((q) => q.options.length < 2)) {
        throw new Error("Each question must have at least 2 options.");
      }

      await updateQuestionary(access_token, questionaryId, {
        service,
        title: title.trim(),
        questions: normalizedQuestions,
      });

      navigate("/admin/dashboard/questionaries", { replace: true });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
        <p className="text-sm font-medium text-white md:text-base">Loading questionary...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        Edit Questionaries
      </h1>
      <p className="mt-1.5 text-sm text-white/90 md:text-base">
        Update service, title, questions and options.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 md:space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">
              Service
            </label>
            <select
              value={service}
              onChange={(event) => setService(event.target.value)}
              className="w-full rounded-xl border border-white/25 bg-[#163626] px-4 py-2.5 text-sm text-white outline-none focus:border-[#5eead4] md:text-[0.9375rem]"
            >
              {serviceOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">
              Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-white/25 bg-white/15 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#5eead4] md:text-[0.9375rem]"
              placeholder="Enter questionary title"
            />
          </div>
        </div>

        {questions.map((question, questionIndex) => (
          <div
            key={question._id || `question-${questionIndex}`}
            className="rounded-xl border border-white/20 bg-white/8 p-4 md:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white md:text-lg">
                Question {questionIndex + 1}
              </h3>
              {questions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="rounded-lg bg-red-500/25 px-2.5 py-1 text-xs font-semibold text-red-100 hover:bg-red-500/35"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <div className="space-y-3">
              <input
                value={question.prompt}
                onChange={(event) =>
                  updateQuestion(questionIndex, { prompt: event.target.value })
                }
                className="w-full rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#5eead4] md:text-[0.9375rem]"
                placeholder="Question prompt"
              />
              <input
                value={question.placeholder}
                onChange={(event) =>
                  updateQuestion(questionIndex, { placeholder: event.target.value })
                }
                className="w-full rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#5eead4] md:text-[0.9375rem]"
                placeholder="Placeholder (optional)"
              />

              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={`${question._id || questionIndex}-option-${optionIndex}`}
                    className="flex flex-wrap gap-2"
                  >
                    <input
                      value={option}
                      onChange={(event) =>
                        updateOption(questionIndex, optionIndex, event.target.value)
                      }
                      className="min-w-0 flex-1 rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#5eead4] md:text-[0.9375rem]"
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(questionIndex, optionIndex)}
                      className="rounded-lg border border-white/25 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(questionIndex)}
                  className="rounded-lg border border-[#5eead4]/60 px-3 py-1.5 text-sm font-semibold text-[#a7f3d0] hover:bg-[#5eead4]/15"
                >
                  Add Option
                </button>
              </div>
            </div>
          </div>
        ))}

        {error ? (
          <div className="rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm font-medium text-white">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-xl border border-[#5eead4]/60 px-4 py-2 text-sm font-semibold text-[#a7f3d0] hover:bg-[#5eead4]/15"
          >
            Add Question
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-5 py-2 text-sm font-semibold text-[#0f2e1a] disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Update Questionary"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/questionaries")}
            className="rounded-xl border border-white/30 bg-white/5 px-5 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditQuestions;
