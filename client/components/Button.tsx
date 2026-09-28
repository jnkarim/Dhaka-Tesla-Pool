type ButtonProps = {
  children: React.ReactNode;

  variant?: "primary" | "secondary";
};

export default function Button({
  children,

  variant = "primary",
}: ButtonProps) {
  return (
    <button
      className={
        variant === "primary"
          ? "bg-brand-accent text-black px-6 py-3 rounded-xl font-semibold"
          : "bg-brand-dark text-white px-6 py-3 rounded-xl font-semibold"
      }
    >
      {children}
    </button>
  );
}
