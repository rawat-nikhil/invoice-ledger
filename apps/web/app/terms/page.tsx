import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

export const metadata: Metadata = {
  title: "Terms & Conditions | Invoice Ledger",
  description: "Terms and conditions for the Invoice Ledger application",
};

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), "content/terms.md");
  const markdown = await readFile(filePath, "utf-8");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 text-lg font-semibold tracking-tight">{children}</h2>
          ),
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed">{children}</p>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
