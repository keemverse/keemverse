import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Type, Layers, ArrowUpRight, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAdminAuth } from "../lib/useAdminAuth";

const TOOLS = [
  { to: "/admin/products", label: "Products", description: "Fashion Finds, presets and design bundles: prices, photos, order, status.", icon: ShoppingBag, editor: true },
  { to: "/admin/content", label: "Site content", description: "Headlines, supporting lines and button labels on every page.", icon: Type, editor: false },
  { to: "/admin/studio", label: "Studio", description: "Import images, drag and resize, save or export.", icon: Layers, editor: false },
];

export default function AdminHomePage() {
  const { unlocked, checking, error, role, checkSecret } = useAdminAuth({ allowEditor: true });
  const [secretInput, setSecretInput] = useState("");

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <div className="glass w-full max-w-sm rounded-3xl p-8 space-y-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground text-background">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow text-amber-ink">KEEMVERSE</p>
            <h1 className="mt-1 text-display-md">Admin console</h1>
          </div>
          <Input
            type="password"
            placeholder="Admin secret"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkSecret(secretInput)}
          />
          <Button className="w-full" onClick={() => checkSecret(secretInput)} disabled={checking}>
            {checking ? "Checking…" : "Unlock"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  const tools = role === "editor" ? TOOLS.filter((t) => t.editor) : TOOLS;

  return (
    <div className="min-h-screen bg-background text-foreground px-5 md:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="eyebrow text-amber-ink">KEEMVERSE</p>
        <h1 className="mt-2 text-display-lg">Admin console</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          {role === "editor"
            ? "You can change product status, price and order."
            : "Everything you can change on the site, in one place."}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="card-lift glass group flex flex-col rounded-3xl p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground text-background">
                <tool.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-6 flex items-center justify-between text-xl font-medium">
                {tool.label}
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
