import { ContentPage } from "@/components/content-page";

const questions = [
  ["What is an Oshibori?", "An Oshibori is a refreshing towel traditionally offered as a gesture of welcome and hospitality."],
  ["How are TITUN towels packaged?", "Each refreshing towel is individually sealed to preserve presentation and freshness."],
  ["Which pack sizes are available?", "Refreshing towels are available in packs of 25, 50 and 100 pieces."],
  ["Can TITUN supply businesses and events?", "Yes. Use the Corporate and Hospitality enquiry form to share your product, quantity and occasion."],
  ["How should towels be stored?", "Keep unopened towels in a cool, dry place away from direct sunlight and excessive heat."],
];

export default function FaqPage() {
  return (
    <ContentPage title="Frequently asked questions" introduction="Useful details about TITUN products, packs and hospitality orders.">
      <div className="max-w-3xl border-t border-ink/20">
        {questions.map(([question, answer]) => <section key={question} className="border-b border-ink/20 py-7"><h2 className="font-display text-3xl">{question}</h2><p className="mt-3 text-base leading-relaxed text-ink/65">{answer}</p></section>)}
      </div>
    </ContentPage>
  );
}
