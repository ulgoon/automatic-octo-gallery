import { TagManager } from "@/components/tag-manager";

export default function TagsPage() {
  return (
    <div className="mx-auto max-w-2xl px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="mb-4 text-lg font-semibold">사진전 (태그)</h1>
      <TagManager />
    </div>
  );
}
