'use client';

type Step = {
  id: string;
  name: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
  goToStep: (step: number) => void;
  stepValidationStatus: boolean[]; // Array indicating if each step is valid
  stepCompletionStatus: boolean[]; // Array indicating if each step has been visited/completed
};

export default function StepIndicator({ steps, currentStep, goToStep, stepValidationStatus, stepCompletionStatus }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {steps.map((step, index) => {
              const isCompleted = stepCompletionStatus[index];
              const isValid = stepValidationStatus[index];
              const isCurrent = index === currentStep;
              const hasErrors = isCompleted && !isValid;
              
              return (
                <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-grow' : ''}`}>
                  {/* Connection line */}
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${
                      index === 0 ? 'hidden' : 
                      index <= currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  </div>
                  
                  {/* Step button */}
                  <button
                    onClick={() => goToStep(index)}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                      isCurrent
                        ? 'border-2 border-blue-600 bg-white dark:bg-background'
                        : isCompleted && isValid
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : hasErrors
                        ? 'bg-red-500 hover:bg-red-600 border-2 border-red-500'
                        : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-background hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                    title={hasErrors ? `${step.name} - Please complete required fields` : step.name}
                  >
                    {isCurrent ? (
                      // Current step indicator
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true"></span>
                    ) : isCompleted && isValid ? (
                      // Completed and valid step - checkmark
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : hasErrors ? (
                      // Completed but has errors - exclamation mark
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      // Unvisited step - empty circle
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600" aria-hidden="true"></span>
                    )}
                    <span className="sr-only">{step.name}</span>
                  </button>
                  
                  {/* Step name with status indicator */}
                  <div className="mt-2">
                    <span className={`text-sm font-medium flex items-center gap-1 ${
                      hasErrors ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {step.name}
                      {hasErrors && (
                        <span className="text-xs text-red-500" title="Please complete required fields">
                          *
                        </span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Mobile version */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</p>
          {stepCompletionStatus[currentStep] && !stepValidationStatus[currentStep] && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Complete required fields
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium">{steps[currentStep].name}</h3>
        <div className="mt-2 flex items-center space-x-2">
          {steps.map((step, index) => {
            const isCompleted = stepCompletionStatus[index];
            const isValid = stepValidationStatus[index];
            const hasErrors = isCompleted && !isValid;
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`h-2 flex-1 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : hasErrors
                    ? 'bg-red-500'
                    : isCompleted && isValid
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
                title={`${step.name}${hasErrors ? ' - Please complete required fields' : ''}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}