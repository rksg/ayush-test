export const trafficSummaryFixture = {
  network: {
    hierarchyNode: {
      apTotalTraffic: 1189597336,
      switchTotalTraffic: 2333440
    }
  }
}

export const trafficSummaryNoDataFixture = {
  network: {
    hierarchyNode: {
      apTotalTraffic: null,
      switchTotalTraffic: null
    }
  }
}


export const incidentSummaryFixture = {
  network: {
    hierarchyNode: {
      apIncidentCount: 461,
      switchIncidentCount: 8
    }
  }
}

export const incidentSummaryNoDataFixture = {
  network: {
    hierarchyNode: {
      apIncidentCount: null,
      switchIncidentCount: null
    }
  }
}

export const utilizationSummaryFixture = {
  network: {
    hierarchyNode: {
      portCount: 636,
      totalPortCount: 14229,
      avgClientCountPerAp: 643
    }
  }
}

export const utilizationSummaryNoDataFixture = {
  network: {
    hierarchyNode: {
      portCount: null,
      totalPortCount: null,
      avgClientCountPerAp: null
    }
  }
}
