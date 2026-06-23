import { formatAnswerValuesForDisplay } from "./questionary";

export const groupEnquiryAnswers = (answers = []) => {
  const list = Array.isArray(answers) ? [...answers] : [];
  list.sort((a, b) => {
    const indexDiff = Number(a?.questionIndex ?? 0) - Number(b?.questionIndex ?? 0);
    if (indexDiff !== 0) return indexDiff;
    return String(a?.prompt || "").localeCompare(String(b?.prompt || ""));
  });

  const groups = new Map();
  for (const answer of list) {
    const service = String(answer?.sourceService || answer?.service || "Questionnaire").trim();
    if (!groups.has(service)) groups.set(service, []);
    groups.get(service).push(answer);
  }

  return Array.from(groups.entries()).map(([service, items]) => ({ service, items }));
};

export const getEnquiryAnswerCount = (enquiry) =>
  Array.isArray(enquiry?.answers) ? enquiry.answers.length : 0;

export const formatEnquiryAnswerLines = (answer) => formatAnswerValuesForDisplay(answer?.value);
