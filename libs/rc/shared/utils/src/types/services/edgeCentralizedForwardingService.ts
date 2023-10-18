export interface EdgeCentralizedForwardingSetting {
  id: string;
  serviceName: string;
  venueId: string;
  edgeId: string;
  corePortId: string; // TODO: need to confirm
  networkIds: string[];
  tunnelProfileId: string;
}