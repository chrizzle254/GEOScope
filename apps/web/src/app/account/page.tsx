export default function AccountPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
          Do you take it seriously?
        </h2>
        <p className="text-xs text-muted-foreground">
          You won&apos;t be charged anything. We just want to verify that you are not spamming.
        </p>
      </div>

      {[
        { key: 'card', label: 'Credit card', placeholder: '4242 4242 4242 4242' },
        { key: 'name', label: 'Name', placeholder: 'Name on card' },
        { key: 'address', label: 'Address', placeholder: 'Billing address' },
      ].map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-1">
          <label
            htmlFor={key}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {label}
          </label>
          <input
            id={key}
            placeholder={placeholder}
            disabled
            className="h-12 w-full border-4 border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      ))}

      <p className="text-xs text-muted-foreground">
        Stripe integration coming soon.
      </p>
    </div>
  );
}
