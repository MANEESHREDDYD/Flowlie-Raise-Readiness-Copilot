import { StatusBadge } from "./Badges";

export function DocumentStatusBadge({ status }: { status: string }) {
  return <StatusBadge value={status}/>;
}
