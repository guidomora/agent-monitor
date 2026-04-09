import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { DashboardNav } from "@/components/dashboard-nav";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Reserva OS",
  description:
    "Dashboard operativo para monitorear WhatsApp, agenda diaria y gestion de reservas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="dashboard-frame">
          <div className="dashboard-grid">
            <aside className="dashboard-sidebar">
              <div className="dashboard-sidebar__brand">
                <p className="dashboard-eyebrow">Reserva OS</p>
                <h1>Centro de operaciones</h1>
                <p>
                  Navegacion UI para mensajeria, agenda diaria y gestion de
                  reservas conectadas a servicios externos.
                </p>
              </div>
              <DashboardNav />
            </aside>
            <main className="dashboard-main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
