import { IncidentsDashboardData } from '../services'

const impactedClientHelper = (val: number) => ({
  impactedClientCount: [val]
})
export const expectedIncidentDashboardData = {
  P1Count: 1,
  P1Impact: impactedClientHelper(2),
  P2Count: 3,
  P2Impact: impactedClientHelper(4),
  P3Count: 5,
  P3Impact: impactedClientHelper(6),
  P4Count: 7,
  P4Impact: impactedClientHelper(8),
  connectionP1: 9,
  performanceP1: 10,
  infrastructureP1: 11,
  connectionP2: 12,
  performanceP2: 13,
  infrastructureP2: 14,
  connectionP3: 15,
  performanceP3: 16,
  infrastructureP3: 17,
  connectionP4: 18,
  performanceP4: 19,
  infrastructureP4: 20
} as IncidentsDashboardData
