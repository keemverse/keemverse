import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Type, Layers, ArrowUpRight, Lock } from "lucide-react";

// The frame every admin page sits in: one sticky frosted header (where you are,
// the other tools, which login you are using, a way back to the site and a Lock
// button), then a page heading and the page itself. Same look as the public
// site, so the console feels like part of the product, not a separate tool.

const ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, editor: true },
  { to: "/admin/products", label: "Products", icon: ShoppingBag, editor: true },
  { to: "/admin/content", label: "Content", icon: Type, editor: false },
  { to: "/admin/studio", label: "Studio", icon: Layers, editor: false },
];

export function lockAdmin() {
  try {
    sessionStorage.removeItem("kv_admin_secret");
  } catch {
    /* private window */
  }
  window.location.href = "/admin";
}

export function AdminShell({
  role = "admin",
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  role?: "admin" | "editor" | null;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const items = role === "editor" ? ITEMS.filter((i) => i.editor) : ITEMS;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="glass-bar sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-2.5 md:px-8">
          <Link to="/admin" className="shrink-0 text-[11px] font-bold uppercase tracking-[0.28em]" aria-label="Admin overview">
            KEEMVERSE
            <span className="ml-2 font-medium tracking-[0.2em] text-muted-foreground">Admin</span>
          </Link>

          <nav aria-label="Admin" className="rail ml-2 flex-1 gap-1 md:ml-6">
            {items.map(({ to, label, icon: Icon }) => {
              const active = to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={`press inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            {role && (
              <span className="hidden rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                {role}
              </span>
            )}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the live site (opens in a new tab)"
              className="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={lockAdmin}
              aria-label="Lock the admin"
              className="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-32 pt-10 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow text-amber-ink">{eyebrow}</p>}
            <h1 className="mt-2 text-display-lg">{title}</h1>
            {description && <p className="mt-3 max-w-xl text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
