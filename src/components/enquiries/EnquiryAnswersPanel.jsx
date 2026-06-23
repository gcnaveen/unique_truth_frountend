import {
  formatEnquiryAnswerLines,
  getEnquiryAnswerCount,
  groupEnquiryAnswers,
} from "../../utils/enquiryAnswers";

const panelClass = "rounded-2xl border border-white/15 bg-white/8 p-4 md:p-5";

function AnswerValueList({ values }) {
  if (!values.length) {
    return <p className="text-sm text-white/55">No answer recorded</p>;
  }

  if (values.length === 1) {
    return <p className="text-sm leading-relaxed text-white/90">{values[0]}</p>;
  }

  return (
    <ul className="space-y-1.5">
      {values.map((value) => (
        <li
          key={value}
          className="rounded-lg border border-[#5eead4]/25 bg-[#5eead4]/10 px-3 py-2 text-sm text-[#d1fae5]"
        >
          {value}
        </li>
      ))}
    </ul>
  );
}

export default function EnquiryAnswersPanel({ enquiry }) {
  const groups = groupEnquiryAnswers(enquiry?.answers);
  const totalAnswers = getEnquiryAnswerCount(enquiry);
  const selectedServices = Array.isArray(enquiry?.selectedServices)
    ? enquiry.selectedServices
    : [];

  if (!totalAnswers) {
    return (
      <section className={panelClass}>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5eead4]">
          Questionnaire answers
        </h3>
        <p className="mt-3 text-sm text-white/60">No questionnaire answers were submitted.</p>
      </section>
    );
  }

  return (
    <section className={panelClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5eead4]">
            Questionnaire answers
          </h3>
          <p className="mt-1 text-sm text-white/70">
            {totalAnswers} answer{totalAnswers === 1 ? "" : "s"}
            {enquiry?.isCompletePackage ? " · Complete package" : ""}
          </p>
        </div>
      </div>

      {enquiry?.isCompletePackage && selectedServices.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedServices.map((service) => (
            <span
              key={service}
              className="rounded-full border border-[#c9a86c]/35 bg-[#c9a86c]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#fde68a]"
            >
              {service}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <div key={group.service} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c9a86c]">
              {group.service}
            </p>
            <ol className="mt-4 space-y-4">
              {group.items.map((answer, index) => {
                const values = formatEnquiryAnswerLines(answer);
                const label = answer?.prompt || `Question ${Number(answer?.questionIndex ?? index) + 1}`;
                return (
                  <li
                    key={`${answer?.questionId || answer?.questionIndex || index}-${label}`}
                    className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold leading-snug text-white">
                      <span className="mr-2 text-[#5eead4]">
                        {Number.isFinite(Number(answer?.questionIndex))
                          ? `${Number(answer.questionIndex) + 1}.`
                          : `${index + 1}.`}
                      </span>
                      {label}
                    </p>
                    <div className="mt-2 pl-6">
                      <AnswerValueList values={values} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
