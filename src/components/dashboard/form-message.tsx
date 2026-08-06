export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-xl border p-3 text-sm ${
        error
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ?? success}
    </p>
  );
}
