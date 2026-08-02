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
  const currentStepData = STEPS[currentStep - 1];
  const progressPercent = (currentStep / STEPS.length) * 100;

  return (
    <>
      <div className="space-y-2 md:hidden">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {STEPS.length}
        </p>
        <p className="font-medium text-foreground">{currentStepData.label}</p>
        <div
          role="progressbar"
          aria-label={`Invoice generation progress, step ${currentStep} of ${STEPS.length}`}
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          className="h-1.5 w-full rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <ol className="hidden gap-4 md:flex">
        {STEPS.map((step) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <li
              key={step.number}
              className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm"
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
                className={`truncate ${
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
