import { SettingsPanel } from "@/components/settings-panel";
import { CuratorGate } from "@/components/curator-gate";

export default function SettingsPage() {
  return (
    <CuratorGate>
      <div className="mx-auto max-w-2xl px-3 py-4 sm:px-6 sm:py-6">
        <h1 className="mb-4 text-lg font-semibold">설정</h1>
        <SettingsPanel />
      </div>
    </CuratorGate>
  );
}
