"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    href: "/",
    label: "Reservas del dia",
    kicker: "Dashboard operativo",
    description: "Vista general sin graficos con ocupacion, agenda y alertas.",
  },
  {
    href: "/gestion",
    label: "Gestion CRUD",
    kicker: "Backoffice UI",
    description: "Alta, edicion, cancelacion y detalle de reservas.",
  },
  {
    href: "/whatsapp",
    label: "WhatsApp",
    kicker: "Canal activo",
    description: "Viewer actual integrado en la nueva navegacion.",
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
            <div className="dashboard-nav__meta">
              <span>{item.kicker}</span>
            </div>
            <strong>{item.label}</strong>
            <p>{item.description}</p>
          </Link>
        );
      })}
    </nav>
  );
}
