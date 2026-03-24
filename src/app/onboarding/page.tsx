"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { StepAbout, StepAboutData } from "@/components/profile/step-about";
import { StepCapital, StepCapitalData } from "@/components/profile/step-capital";
import { StepAssets } from "@/components/profile/step-assets";
import { StepSectors } from "@/components/profile/step-sectors";
import { StepRegions } from "@/components/profile/step-regions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WizardState {
  about: StepAboutData;
  capital: StepCapitalData;
  assetTypes: string[];
  sectors: string[];
  regions: string[];
  esg: boolean;
}

const INITIAL_STATE: WizardState = {
  about: { displayName: "", ageRange: "", country: "" },
  capital: { capitalMin: 1000, capitalMax: 10000, horizon: "", riskTolerance: 0 },
  assetTypes: [],
  sectors: [],
  regions: [],
  esg: false,
};

const STEP_TITLES = ["About you", "Capital & goals", "Asset classes", "Sectors", "Regions"];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isStepValid(step: number, state: WizardState): boolean {
  switch (step) {
    case 1: return !!state.about.country;
    case 2: return !!state.capital.horizon && state.capital.riskTolerance > 0;
    case 3: return state.assetTypes.length > 0;
    case 4: return true;
    case 5: return true;
    default: return false;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const TOTAL_STEPS = 5;
  const valid = isStepValid(step, state);

  function transition(nextStep: number) {
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
    }, 150);
  }

  function handleBack() {
    if (step > 1) transition(step - 1);
  }

  function handleNext() {
    if (!valid) return;
    if (step < TOTAL_STEPS) {
      transition(step + 1);
    } else {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const payload = {
        displayName:          state.about.displayName || null,
        ageRange:             state.about.ageRange || null,
        country:              state.about.country,
        availableCapitalMin:  state.capital.capitalMin,
        availableCapitalMax:  state.capital.capitalMax,
        investmentHorizon:    state.capital.horizon,
        riskTolerance:        state.capital.riskTolerance,
        interestedAssetTypes: state.assetTypes,
        interestedSectors:    state.sectors,
        interestedRegions:    state.regions,
        esgPreference:        state.esg,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string })?.error ?? "Failed to save profile");
      }

      toast.success("Profile saved! Your feed is ready.");
      router.push("/feed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col">
      {/* Top bar with progress */}
      <div className="sticky top-0 z-10 bg-[#0A0A0B]/90 backdrop-blur border-b border-[#27272A]">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold tracking-tight text-[#D4A853]">ZITRUM</span>
            <span className="text-xs text-[#52525B]">Step {step} of {TOTAL_STEPS}</span>
          </div>

          {/* Progress bars */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const n = i + 1;
              return (
                <div key={n} className="flex-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      n < step ? "bg-[#D4A853]" : n === step ? "bg-[#D4A853]/60" : "bg-[#27272A]"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Step labels */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {STEP_TITLES.map((title, i) => {
              const n = i + 1;
              return (
                <div key={n} className="flex-1 text-center">
                  {n === step ? (
                    <span className="text-[10px] font-semibold text-[#D4A853] truncate block">{title}</span>
                  ) : n < step ? (
                    <CheckCircle2 className="h-3 w-3 text-[#D4A853] mx-auto" />
                  ) : (
                    <span className="text-[10px] text-[#52525B] block">{n}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-8">
          <div
            className="transition-opacity duration-150"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {step === 1 && (
              <StepAbout
                data={state.about}
                onChange={(about) => setState((s) => ({ ...s, about }))}
              />
            )}
            {step === 2 && (
              <StepCapital
                data={state.capital}
                onChange={(capital) => setState((s) => ({ ...s, capital }))}
              />
            )}
            {step === 3 && (
              <StepAssets
                selected={state.assetTypes}
                onChange={(assetTypes) => setState((s) => ({ ...s, assetTypes }))}
              />
            )}
            {step === 4 && (
              <StepSectors
                selected={state.sectors}
                onChange={(sectors) => setState((s) => ({ ...s, sectors }))}
              />
            )}
            {step === 5 && (
              <StepRegions
                selected={state.regions}
                esg={state.esg}
                onRegionsChange={(regions) => setState((s) => ({ ...s, regions }))}
                onEsgChange={(esg) => setState((s) => ({ ...s, esg }))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-[#0A0A0B]/95 backdrop-blur border-t border-[#27272A]">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#27272A] text-sm font-medium text-[#A1A1AA] hover:text-white hover:border-[#52525B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!valid || saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#D4A853] text-black hover:bg-[#C49843] disabled:bg-[#D4A853]/50"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                Saving&hellip;
              </>
            ) : step === TOTAL_STEPS ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Complete Profile
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <div className="max-w-xl mx-auto px-4 pb-4 text-center">
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
          >
            Skip for now &mdash; I&apos;ll set up my profile later
          </button>
        </div>
      </div>
    </div>
  );
}
