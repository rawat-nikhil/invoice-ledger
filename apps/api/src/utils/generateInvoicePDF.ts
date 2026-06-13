import { chromium } from "playwright";

export async function generateInvoicePDF(html: string): Promise<Buffer> {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

  const browser = await chromium.launch(
    executablePath ? { executablePath } : undefined,
  );

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
