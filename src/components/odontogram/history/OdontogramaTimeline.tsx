// src/components/odontogram/history/OdontogramaTimeline.tsx
import type { OdontogramaSnapshot } from "../../../core/types/odontogramaHistory.types";
import { OdontogramaTimelineList } from "./timeline/OdontogramaTimelineList";

interface TimelineProps {
  snapshots: OdontogramaSnapshot[];
  onSelectSnapshot: (id: string) => void;
  selectedSnapshotId: string | null;
}

export const OdontogramaTimeline = ({
  snapshots,
  onSelectSnapshot,
  selectedSnapshotId,
}: TimelineProps) => {
  return (
    <OdontogramaTimelineList
      snapshots={snapshots}
      onSelectSnapshot={onSelectSnapshot}
      selectedSnapshotId={selectedSnapshotId}
    />
  );
};