const STEPS = [
  { number: 1, label: "Invoice details" },
  { number: 2, label: "Employee input" },
  { number: 3, label: "Salary calculation" },
  { number: 4, label: "Invoice preview" },
] as const;

type GenerateStepIndicatorProps = {
  currentStep: 1 | 2 | 3 | 4;
};

export function GenerateStepIndicator({
  currentStep,
}: GenerateStepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-2 sm:gap-4">
      {STEPS.map((step) => {
        const isActive = step.number === currentStep;
        const isComplete = step.number < currentStep;

        return (
          <li
            key={step.number}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            data-active={isActive}
            data-complete={isComplete}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isComplete
                    ? "bg-muted text-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step.number}
            </span>
            <span
              className={
                isActive ? "font-medium text-foreground" : "text-muted-foreground"
              }
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
