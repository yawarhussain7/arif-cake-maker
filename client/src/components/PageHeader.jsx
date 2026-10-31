export default function PageHeader({ title, text }) {
  return (
    <div className="bg-sand py-14 text-center">
      <h1 className="text-5xl font-medium">{title}</h1>
      {text && <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{text}</p>}
    </div>
  );
}
