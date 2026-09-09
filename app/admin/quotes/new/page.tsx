import { getTemplates } from "@/lib/queries/template.queries";
import { CreateQuoteForm } from "@/components/create-quote-form";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const templates = await getTemplates();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(28px,4vw,56px) clamp(16px,3vw,36px) 90px" }}>
      <div style={{ fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 600, marginBottom: 38 }}>
        Tạo báo giá mới
      </div>
      <CreateQuoteForm templates={templates} />
    </div>
  );
}
