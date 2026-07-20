import { cn } from "@/utils/cn";

export type SharedQuestionType = "multiple_choice" | "true_false_not_given" | "short_answer" | "matching_heading";

export interface SharedQuestion {
  id: string;
  orderIndex: number;
  type: SharedQuestionType;
  promptText: string;
  options: string[] | null;
}

export function QuestionInput({
  index,
  question,
  value,
  isSaving,
  onChange,
}: {
  index: number;
  question: SharedQuestion;
  value: string;
  isSaving: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium">
          {index}. {question.promptText}
        </p>
        {isSaving && <span className="shrink-0 text-[10px] text-text-soft">saving…</span>}
      </div>

      {question.type === "true_false_not_given" && (
        <div className="flex gap-2">
          {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                value === opt
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-soft hover:bg-bg-subtle"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {(question.type === "multiple_choice" || question.type === "matching_heading") && question.options && (
        <div className="flex flex-col gap-1.5">
          {question.options.map((opt) => (
            <label
              key={opt}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                value === opt ? "border-primary bg-primary/10" : "border-border hover:bg-bg-subtle"
              )}
            >
              <input
                type="radio"
                name={question.id}
                className="accent-primary"
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {question.type === "short_answer" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer"
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      )}
    </div>
  );
}
