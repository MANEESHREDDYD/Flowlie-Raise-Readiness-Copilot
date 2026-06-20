import { SeverityBadge } from "./Badges";

export function RiskSeverityBadge({ severity }: { severity: string }) {
  return <SeverityBadge value={severity}/>;
}
