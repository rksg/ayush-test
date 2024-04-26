export const switchCountFixture = {
  network: {
    hierarchyNode: {
      switchCount: 21
    }
  }
}

export const switchCountNoDataFixture = {
  network: {
    hierarchyNode: {
      switchCount: 0
    }
  }
}

export const summaryDataFixture = {
  network: {
    hierarchyNode: {
      apIncidentCount: 461,
      switchIncidentCount: 8,
      apTotalTraffic: 1189597336,
      switchTotalTraffic: 2333440,
      portCount: 636,
      totalPortCount: 14229,
      avgPerAPClientCount: 643,
      poeUnderPoweredApCount: 1,
      apCount: 8,
      poeUnderPoweredSwitchCount: 2,
      poeThresholdSwitchCount: 2

    }
  }
}

export const summaryWirelessDataFixture = {
  network: {
    hierarchyNode: {
      apIncidentCount: 461,
      apTotalTraffic: 1189597336,
      avgPerAPClientCount: 643,
      poeUnderPoweredApCount: 1,
      apCount: 8
    }
  }
}


export const summaryNoDataFixture = {
  network: {
    hierarchyNode: {
      apIncidentCount: 0,
      switchIncidentCount: 0,
      apTotalTraffic: null,
      switchTotalTraffic: null,
      portCount: 0,
      totalPortCount: 0,
      avgPerAPClientCount: 0,
      poeUnderPoweredApCount: 0,
      apCount: 0,
      poeUnderPoweredSwitchCount: 0,
      poeThresholdSwitchCount: 0
    }
  }
}
