export const wiredSummaryNoDataFixture = {
  network: {
    hierarchyNode: {
      switchDHCP: { attemptCount: 0, successCount: 0 },
      switchCpuUtilizationPct: 0,
      stormPortCount: 0,
      portCount: 0,
      uplinkPortCount: 0,
      congestedPortCount: 0,
      nonStackPortCount: 0
    }
  }
}

export const wiredSummaryDataFixture = {
  network: {
    hierarchyNode: {
      switchDHCP: { attemptCount: 1001, successCount: 701 },
      switchCpuUtilizationPct: 0.12345,
      stormPortCount: 5,
      portCount: 637,
      uplinkPortCount: 155,
      congestedPortCount: 4,
      nonStackPortCount: 500
    }
  }
}

