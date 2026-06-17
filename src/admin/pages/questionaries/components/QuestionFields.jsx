import { QUESTION_TYPES } from "../../../../utils/questionary";

export default function QuestionFields({
  question,
  questionIndex,
  canRemove,
  onRemove,
  onChange,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
}) {
  const filledOptions = (question.options || []).filter((opt) => String(opt || "").trim());
  const maxAnswers = Math.max(filledOptions.length, question.options?.length || 0, 1);
  const showOptions = question.type !== "text";

  return (
    <div className="rounded-xl border border-white/20 bg-white/8 p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white md:text-lg">
          Question {questionIndex + 1}
        </h3>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg bg-red-500/25 px-2.5 py-1 text-xs font-semibold text-red-100 hover:bg-red-500/35"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/70">
            Prompt
          </label>
          <input
            value={question.prompt}
            onChange={(event) => onChange({ prompt: event.target.value })}
            className="w-full rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#5eead4] md:text-[0.9375rem]"
            placeholder="Question prompt"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/70">
            Type
          </label>
          <select
            value={question.type}
            onChange={(event) => {
              const type = event.target.value;
              const patch = { type };
              if (type === "text") {
                patch.numberOfAnswers = "";
              } else if (type === "multi-select" && !question.numberOfAnswers) {
                patch.numberOfAnswers = "2";
              }
              onChange(patch);
            }}
            className="w-full rounded-xl border border-white/25 bg-[#163626] px-3 py-2 text-sm text-white outline-none focus:border-[#5eead4]"
          >
            {QUESTION_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/70">
            Required
          </label>
          <label className="flex h-[42px] items-center gap-2 rounded-xl border border-white/25 bg-white/12 px-3 text-sm text-white">
            <input
              type="checkbox"
              checked={Boolean(question.required)}
              onChange={(event) => onChange({ required: event.target.checked })}
              className="h-4 w-4 rounded border-white/30"
            />
            User must answer
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/70">
            Placeholder
          </label>
          <input
            value={question.placeholder}
            onChange={(event) => onChange({ placeholder: event.target.value })}
            className="w-full rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#5eead4] md:text-[0.9375rem]"
            placeholder="Placeholder (optional)"
          />
        </div>

        {showOptions ? (
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/70">
              Number of answers
            </label>
            <input
              type="number"
              min={1}
              max={maxAnswers}
              value={question.numberOfAnswers}
              onChange={(event) => onChange({ numberOfAnswers: event.target.value })}
              className="w-full max-w-xs rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#5eead4]"
              placeholder="Leave empty for single choice"
            />
            <p className="mt-1 text-xs text-white/55">
              Exact options the user must pick (max {maxAnswers}). Use 2+ for multi-select.
            </p>
          </div>
        ) : null}
      </div>

      {showOptions ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Options</p>
          {question.options.map((option, optionIndex) => (
            <div
              key={`${question._id || questionIndex}-option-${optionIndex}`}
              className="flex flex-wrap gap-2"
            >
              <input
                value={option}
                onChange={(event) => onUpdateOption(optionIndex, event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#5eead4] md:text-[0.9375rem]"
                placeholder={`Option ${optionIndex + 1}`}
              />
              <button
                type="button"
                onClick={() => onRemoveOption(optionIndex)}
                className="rounded-lg border border-white/25 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddOption}
            className="rounded-lg border border-[#5eead4]/60 px-3 py-1.5 text-sm font-semibold text-[#a7f3d0] hover:bg-[#5eead4]/15"
          >
            Add Option
          </button>
        </div>
      ) : null}
    </div>
  );
}
