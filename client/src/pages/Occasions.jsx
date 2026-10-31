import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

const OCCASIONS = ["Birthdays", "Anniversaries", "Weddings", "Baby Showers", "Corporate Events", "Festivals"];

export default function Occasions() {
  return (
    <>
      <PageHeader title="Occasions" text="Find the right cake for the moment." />
      <div className="mx-auto grid max-w-5xl gap-5 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {OCCASIONS.map((o) => (
          <Link key={o} to="/cakes" className="rounded-md bg-white p-8 text-center shadow-sm transition hover:shadow-md">
            <h2 className="text-2xl font-semibold">{o}</h2>
            <span className="mt-2 inline-block text-xs text-brand">Browse cakes</span>
          </Link>
        ))}
      </div>
    </>
  );
}
