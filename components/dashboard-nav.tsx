"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    href: "/",
    label: "Reservas del dia",
    kicker: "",
    description: "",
  },
  {
    href: "/gestion",
    label: "Gestion de reservas",
    kicker: "",
    description: "Crear, borrar o modificar reservas",
  },
  {
    href: "/whatsapp",
    label: "WhatsApp - Mensajes",
    kicker: "",
    description: "",
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="dashboard-nav" aria-label="Secciones principales">
      {navigation.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`dashboard-nav__link ${isActive ? "is-active" : ""}`}
          >
            {item.kicker ? (
              <div className="dashboard-nav__meta">
                <span>{item.kicker}</span>
              </div>
            ) : null}
            <strong>{item.label}</strong>
            {item.description ? <p>{item.description}</p> : null}
          </Link>
        );
      })}
    </nav>
  );
}
