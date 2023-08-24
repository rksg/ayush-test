export const searchFixture = {
  search: {
    clients: [
      {
        hostname: '02AA01AB50120H4M',
        username: '18b43003e603',
        mac: '18:B4:30:03:E6:03',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.42',
        lastActiveTime: '2023-08-23T05:08:20.000Z'
      },
      {
        hostname: '02AA01AB50120E2Q',
        username: '18b43004d810',
        mac: '18:B4:30:04:D8:10',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.44',
        lastActiveTime: '2023-08-23T05:07:23.000Z'
      },
      {
        hostname: '02AA01AB50120G7G',
        username: '18b430051cbe',
        mac: '18:B4:30:05:1C:BE',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.69',
        lastActiveTime: '2023-08-23T05:07:23.000Z'
      }
    ],
    networkHierarchy: [
      {
        name: '01-US-CA-D1-Test-Home',
        root: 'vsz34',
        type: 'Domain',
        apCount: 1,
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'vsz34',
            type: 'system'
          },
          {
            name: '01-US-CA-D1-Test-Home',
            type: 'domain'
          }
        ],
        switchCount: 0
      },
      {
        name: 'Ramesh-TestZone',
        root: 'Aaron-Public-1',
        type: 'Zone',
        apCount: 1,
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'Aaron-Public-1',
            type: 'system'
          },
          {
            name: 'Ramesh-TestZone',
            type: 'zone'
          }
        ],
        switchCount: null
      },
      {
        name: 'CDC_BB_TEST',
        root: 'Public-vSZ-2',
        type: 'Zone',
        apCount: 1,
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'Public-vSZ-2',
            type: 'system'
          },
          {
            name: 'CDC_BB_TEST',
            type: 'zone'
          }
        ],
        switchCount: null
      }
    ],
    aps: [
      {
        apName: 'AL-Guest-R610',
        macAddress: '90:3A:72:24:D0:40',
        apModel: 'R610',
        ipAddress: '192.168.2.105',
        version: '6.1.2.0.580',
        apZone: 'Albert-Home-Main',
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'vsz34',
            type: 'system'
          },
          {
            name: '04-US-CA-D4-Albert-Home',
            type: 'domain'
          },
          {
            name: 'Albert-Home-Main',
            type: 'zone'
          },
          {
            name: 'default',
            type: 'apGroup'
          },
          {
            name: '90:3A:72:24:D0:40',
            type: 'AP'
          }
        ]
      },
      {
        apName: 'BDC-Test AP Feb',
        macAddress: '58:FB:96:01:A5:A0',
        apModel: 'R350',
        ipAddress: '192.168.1.26',
        version: 'Unknown',
        apZone: '45-IN-BDC-D45-AM',
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'vsz34',
            type: 'system'
          },
          {
            name: '45-IN-BDC-D45-AM',
            type: 'zone'
          },
          {
            name: 'default',
            type: 'apGroup'
          },
          {
            name: '58:FB:96:01:A5:A0',
            type: 'AP'
          }
        ]
      },
      {
        apName: 'GuestHouse@SD',
        macAddress: '34:20:E3:2D:11:20',
        apModel: 'H550',
        ipAddress: '192.168.1.67',
        version: '6.1.1.0.1274',
        apZone: 'TommySD@Home',
        networkPath: [
          {
            name: 'Network',
            type: 'network'
          },
          {
            name: 'vsz34',
            type: 'system'
          },
          {
            name: '49-US-CA-TommySD',
            type: 'domain'
          },
          {
            name: 'TommySD@Home',
            type: 'zone'
          },
          {
            name: 'default',
            type: 'apGroup'
          },
          {
            name: '34:20:E3:2D:11:20',
            type: 'AP'
          }
        ]
      }
    ],
    switches: [
      {
        switchName: 'west-density-7650-stack',
        switchMac: '60:9C:9F:52:C9:86',
        switchModel: 'ICX7650-48ZP',
        switchVersion: 'TNS08095h'
      }
    ]
  }
}

export const emptySearchFixture = {
  search: {
    clients: [

    ],
    networkHierarchy: [

    ],
    aps: [

    ],
    switches: [

    ]
  }
}
