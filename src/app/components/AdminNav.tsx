import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/admin", label: "← Admin home" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/studio", label: "Studio" },
];

export function AdminNav() {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-2">
      {LINKS.map((link) => {
        const active = pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
              active
                ? "border-transparent bg-foreground text-background"
                : "border-input text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
