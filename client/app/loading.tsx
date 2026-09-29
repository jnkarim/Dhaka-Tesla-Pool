export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#F8F8FA]">
      <div className="flex flex-col items-center gap-5">
        <div className="text-[32px] font-black tracking-[-0.06em] text-black">
          Dhaka
          <span className="text-[#C6FF2E]">
            Tesla
          </span>
          Pool
        </div>

        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-black" />

        <p className="text-sm font-semibold text-black/40">
          Loading...
        </p>
      </div>
    </div>
  );
}