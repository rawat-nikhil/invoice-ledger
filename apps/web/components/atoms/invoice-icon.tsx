import { cn } from "../../lib/utils";

export const INVOICE_ICON_SRC = "/invoice.png";

type InvoiceIconProps = {
  className?: string;
};

function InvoiceIcon({ className }: InvoiceIconProps) {
  return (
    <img
      src={INVOICE_ICON_SRC}
      alt=""
      aria-hidden
      className={cn("size-4 shrink-0 object-contain", className)}
    />
  );
}

export { InvoiceIcon, type InvoiceIconProps };
