export const wifiNetworksFixture = {
  network: {
    search: {
      wifiNetworks: [
        {
          name: 'Hospt-Guest',
          apCount: 0,
          clientCount: 0,
          zoneCount: 0,
          traffic: 0,
          rxBytes: 0,
          txBytes: 0
        },
        {
          name: 'DENSITY-WPA2PSK',
          apCount: 25,
          clientCount: 38,
          zoneCount: 1,
          traffic: 129272657263,
          rxBytes: 882986906,
          txBytes: 128389670357
        }
      ]
    }
  }
}

export const emptyListFixture = {
  network: {
    search: {
      wifiNetworks: []
    }
  }
}
