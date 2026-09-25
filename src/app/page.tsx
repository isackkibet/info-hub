import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { HubsSection } from "@/components/hubs-section";
import { TrustLayer } from "@/components/trust-layer";
import { Principles } from "@/components/principles";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HubsSection />
        <TrustLayer />
        <Principles />
      </main>
      <SiteFooter />
    </>
  );
}
