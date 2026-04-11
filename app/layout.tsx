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
  title: "AI Reservations",
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
      data-scroll-behavior="smooth"
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="dashboard-frame">
          <div className="dashboard-grid">
            <aside className="dashboard-sidebar">
              <div className="dashboard-sidebar__brand">
                <h1>AI Reservations</h1>
                <p>
                  Gestion de las reservas tomadas por el Agente de WhatsApp.
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
