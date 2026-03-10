import { useState } from "react";
import { WalletStep } from "./setup/WalletStep.js";
import { RegisterStep } from "./setup/RegisterStep.js";
import { LLMStep } from "./setup/LLMStep.js";
import { PersonalityStep } from "./setup/PersonalityStep.js";

const STEPS = ["Wallet", "Register", "LLM", "Personality"] as const;

interface SetupProps {
  onComplete: () => void;
}

export function Setup({ onComplete }: SetupProps) {
  const [step, setStep] = useState(0);
  const [agentId, setAgentId] = useState("");

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">WorkClaw</h1>
          <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">Setup</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < step
                    ? "bg-emerald-600 text-white"
                    : i === step
                      ? "bg-zinc-100 text-zinc-900"
                      : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {i < step ? "\u2713" : i + 1}
              </div>
              <span
                className={`text-sm ${
                  i === step ? "text-zinc-100" : "text-zinc-500"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-zinc-700" />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="w-full max-w-lg">
          {step === 0 && <WalletStep onNext={next} />}
          {step === 1 && (
            <RegisterStep
              onNext={(id) => {
                setAgentId(id);
                next();
              }}
            />
          )}
          {step === 2 && <LLMStep onNext={next} />}
          {step === 3 && <PersonalityStep onComplete={onComplete} />}
        </div>
      </main>
    </div>
  );
}
