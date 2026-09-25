import { PageShell } from "@/components/cfa/page-shell";
import { UpdatesFeed } from "./updates-feed";

export default function CfaUpdatesPage() {
  return (
    <PageShell
      eyebrow="CFA Conservation Hub"
      title="Member updates"
      description="A place for CFA and nursery members to share what's happening on the ground: schedules, repairs, requests for help, anything worth knowing. Separate from the activity ledger, nothing here affects inventory."
    >
      <UpdatesFeed />
    </PageShell>
  );
}
