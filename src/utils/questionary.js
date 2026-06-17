export const QUESTION_TYPES = [
  { value: "single_choice", label: "Single choice (radio)" },
  { value: "multi-select", label: "Multi-select (exact count)" },
  { value: "text", label: "Free text" },
];

export const createEmptyQuestion = (order = 0) => ({
  prompt: "",
  type: "single_choice",
  options: ["", ""],
  placeholder: "",
  required: true,
  numberOfAnswers: "",
  order,
});

export const mapApiQuestionToForm = (question, index = 0) => ({
  prompt: question?.prompt || "",
  type: question?.type || "single_choice",
  options:
    Array.isArray(question?.options) && question.options.length
      ? question.options
      : ["", ""],
  placeholder: question?.placeholder || "",
  required: question?.required !== false,
  numberOfAnswers:
    question?.numberOfAnswers != null && question.numberOfAnswers !== ""
      ? String(question.numberOfAnswers)
      : "",
  order: Number.isFinite(question?.order) ? question.order : index,
  _id: question?._id,
});

export const normalizeQuestionForApi = (question, index) => {
  const payload = {
    prompt: question.prompt.trim(),
    type: question.type || "single_choice",
    placeholder: question.placeholder?.trim() || "",
    required: Boolean(question.required),
    order: index,
  };

  if (question._id) payload._id = question._id;

  if (payload.type !== "text") {
    payload.options = (question.options || []).map((opt) => opt.trim()).filter(Boolean);
    const parsed = Number(question.numberOfAnswers);
    if (Number.isFinite(parsed) && parsed >= 1) {
      payload.numberOfAnswers = parsed;
    }
  }

  return payload;
};

export const validateQuestionsForApi = (questions) => {
  const normalized = questions.map(normalizeQuestionForApi);

  if (!normalized.length) {
    throw new Error("Add at least one question.");
  }

  normalized.forEach((question, index) => {
    const label = `Question ${index + 1}`;
    if (!question.prompt) {
      throw new Error("Each question must have a prompt.");
    }
    if (question.type === "text") return;

    if (question.options.length < 2) {
      throw new Error(`${label} must have at least 2 options.`);
    }
    if (question.numberOfAnswers != null) {
      if (question.numberOfAnswers < 1) {
        throw new Error(`${label}: number of answers must be at least 1.`);
      }
      if (question.numberOfAnswers > question.options.length) {
        throw new Error(
          `${label}: number of answers (${question.numberOfAnswers}) cannot exceed options (${question.options.length}).`,
        );
      }
    }
  });

  return normalized;
};

export const getQuestionKey = (question, index) => question?._id || `${index}`;

export const isTextQuestion = (question) => {
  const type = String(question?.type || "").toLowerCase();
  return type === "text";
};

export const getRequiredSelectionCount = (question) => {
  if (isTextQuestion(question)) return 0;
  const parsed = Number(question?.numberOfAnswers);
  if (Number.isFinite(parsed) && parsed >= 1) return parsed;
  return 1;
};

export const isMultiSelectQuestion = (question) =>
  getRequiredSelectionCount(question) > 1;

export const getSelectionHelperText = (question) => {
  const count = getRequiredSelectionCount(question);
  if (isTextQuestion(question)) return "";
  if (count > 1) return `Select exactly ${count} options`;
  return "Select one option";
};

export const normalizeStoredAnswer = (question, value) => {
  if (isTextQuestion(question)) {
    return String(value ?? "").trim();
  }
  if (isMultiSelectQuestion(question)) {
    if (Array.isArray(value)) return value.map((item) => String(item));
    if (value) return [String(value)];
    return [];
  }
  if (Array.isArray(value)) return value[0] || "";
  return String(value ?? "");
};

export const getSelectedCount = (question, value) => {
  if (isTextQuestion(question)) {
    return String(value ?? "").trim() ? 1 : 0;
  }
  if (isMultiSelectQuestion(question)) {
    return Array.isArray(value) ? value.length : 0;
  }
  const single = Array.isArray(value) ? value[0] : value;
  return String(single ?? "").trim() ? 1 : 0;
};

export const isAnswerComplete = (question, value) => {
  const required = question?.required !== false;
  const requiredCount = getRequiredSelectionCount(question);

  if (isTextQuestion(question)) {
    const text = String(value ?? "").trim();
    if (!required) return true;
    return Boolean(text);
  }

  if (isMultiSelectQuestion(question)) {
    const selected = Array.isArray(value) ? value : [];
    if (!required && selected.length === 0) return true;
    return selected.length === requiredCount;
  }

  const single = Array.isArray(value) ? value[0] : value;
  if (!required && !String(single ?? "").trim()) return true;
  return Boolean(String(single ?? "").trim());
};

export const formatAnswerValueForSubmit = (question, value) => {
  if (isTextQuestion(question)) {
    return String(value ?? "").trim();
  }
  if (isMultiSelectQuestion(question)) {
    return Array.isArray(value) ? value : [];
  }
  if (Array.isArray(value)) return value[0] || "";
  return String(value ?? "");
};

export const formatAnswerValuesForDisplay = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  const text = String(value ?? "").trim();
  return text ? [text] : [];
};

export const formatEnquirySubmitError = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || "Submission failed.";

  const parts = [];
  if (data.message) parts.push(data.message);

  if (Array.isArray(data.invalidAnswerCounts)) {
    data.invalidAnswerCounts.forEach((item) => {
      if (item?.message) parts.push(item.message);
      else if (item?.prompt) {
        parts.push(`${item.prompt}: select exactly ${item.requiredCount ?? item.numberOfAnswers} option(s).`);
      }
    });
  }

  if (Array.isArray(data.missingRequired)) {
    data.missingRequired.forEach((item) => {
      parts.push(`Required: ${item?.prompt || "question"}`);
    });
  }

  return parts.filter(Boolean).join(" ") || "Submission failed.";
};

/** Normalize GET /questioniries/service/{service} — array or single form. */
export const normalizeQuestionariesList = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (payload && typeof payload === "object" && (payload._id || payload.questions)) {
    return [payload];
  }
  return [];
};

/** Merge questions from all questionnaires returned for Complete Package. */
export const mergeCompletePackageQuestions = (questionaries) => {
  if (!Array.isArray(questionaries)) return [];

  return questionaries.flatMap((form) => {
    const sourceService = form?.service || "";
    const questioniriesId = form?._id || form?.id || "";
    const items = Array.isArray(form?.questions) ? form.questions : [];

    return [...items]
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .map((question) => ({
        ...question,
        _sourceService: sourceService,
        _combinedService: sourceService,
        _questioniriesId: questioniriesId,
        _combinedQuestionaryId: questioniriesId,
      }));
  });
};

export const buildEnquiryAnswersPayload = (questions, answersMap, service) =>
  questions.map((question, index) => {
    const key = getQuestionKey(question, index);
    const rawValue = answersMap[key];
    const sourceService = question?._sourceService || question?._combinedService || service;
    const questioniriesId =
      question?._questioniriesId || question?._combinedQuestionaryId || "";

    return {
      questionId: question?._id || `${index}`,
      questionIndex: index,
      value: formatAnswerValueForSubmit(question, rawValue),
      prompt: question?.prompt || "",
      type: question?.type || "single_choice",
      sourceService,
      questioniriesId,
      service: sourceService,
      sourceQuestionaryId: questioniriesId,
    };
  });
