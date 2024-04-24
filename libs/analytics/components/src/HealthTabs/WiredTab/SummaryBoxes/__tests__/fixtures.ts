export const wiredSummaryNoDataFixture = {
  network: {
    hierarchyNode: {
      switchDHCP: { attemptCount: 0, successCount: 0 },
      switchCpuUtilizationPct: 0

    }
  }
}

export const wiredSummaryDataFixture = {
  network: {
    hierarchyNode: {
      switchDHCP: { attemptCount: 1001, successCount: 701 },
      switchCpuUtilizationPct: 0.12345
    }
  }
}

