import { LandingPage } from "@/features/landing"

export default function Page() {
  return (
    <div>
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-md font-bold shadow-lg">
        ✅ MIGRATED - Landing Feature
      </div>
      <LandingPage />
    </div>
  )
}
