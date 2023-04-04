export const mockConnectionDrillDown = {
  connectionDrilldown: {
    assocSuccessAndAttemptCount: [[24, 25]],
    authSuccessAndAttemptCount: [[54, 54]],
    eapSuccessAndAttemptCount: [[25, 27]],
    radiusSuccessAndAttemptCount: [[0, 2]],
    dhcpSuccessAndAttemptCount: [[972, 980]]
  }
}

export const mockTtcDrillDown = {
  network: {
    hierarchyNode: {
      ttcDrilldown: {
        ttcByFailureTypes: {
          ttcByEap: [
            26.81081081081081
          ],
          ttcByDhcp: [
            115.70270270270271
          ],
          ttcByAuth: [
            15.08108108108108
          ],
          ttcByAssoc: [
            16.243243243243242
          ],
          ttcByRadius: [
            244.2972972972973
          ]
        }
      }
    }
  }
}
export const mockImpactedClient = {
  network: {
    hierarchyNode: {
      impactedClients: [
        {
          mac: 'D0:C6:37:D7:52:80',
          manufacturer: 'Intel Corporate',
          ssid: 'Divya_1_hour',
          hostname: 'DESKTOP-K1PAM9U',
          username: 'DPSK_User_8709'
        },
        {
          mac: 'D0:C6:37:D7:52:80',
          manufacturer: 'Intel Corporate',
          ssid: 'Divya_tomorrow',
          hostname: 'DESKTOP-K1PAM9U',
          username: 'DPSK_User_8709'
        }
      ]
    }
  }
}