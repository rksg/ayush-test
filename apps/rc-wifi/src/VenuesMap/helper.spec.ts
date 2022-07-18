import { initialize, mockInstances } from '@googlemaps/jest-mocks'

import { ApVenueStatusEnum, Dashboard, SwitchStatusEnum } from '@acx-ui/rc/services'

import { getClusterSVG, getDeviceConnectionStatusColors,
  getIcon, getMarkerColor, getMarkerSVG, massageVenuesData } from './helper'

describe('Venues Map Helper', () => {
  describe('massageVenuesData', () => {
    // eslint-disable-next-line no-console
    const original = console.error
    beforeEach(() => {
    // eslint-disable-next-line no-console
      console.error = jest.fn()
    })
    afterEach(() => {
    // eslint-disable-next-line no-console
      console.error = original
    })
    it('should massage the data correctly', async () => {
      const data: Dashboard = {
        summary: {
          clients: {
            summary: {},
            totalCount: 0,
            clientDto: [{}]
          },
          aps: {
            summary: {
              [ApVenueStatusEnum.OPERATIONAL]: 2,
              [ApVenueStatusEnum.REQUIRES_ATTENTION]: 1
            },
            totalCount: 3
          },
          alarms: {
            summary: {
              clear: 1
            },
            totalCount: 2
          },
          switches: {
            summary: {},
            totalCount: 0
          },
          venues: {
            summary: {
              [ApVenueStatusEnum.IN_SETUP_PHASE]: 1,
              [ApVenueStatusEnum.OPERATIONAL]: 2,
              [ApVenueStatusEnum.REQUIRES_ATTENTION]: 1
            },
            totalCount: 4
          },
          switchClients: {
            summary: {},
            totalCount: 0
          }
        },
        aps: {
          apsStatus: [
            {
              '01d74a2c947346a1a963a310ee8c9f6f': {
                totalCount: 5,
                apStatus: {
                  [ApVenueStatusEnum.IN_SETUP_PHASE]: 1,
                  [ApVenueStatusEnum.REQUIRES_ATTENTION]: 1,
                  [ApVenueStatusEnum.OFFLINE]: 1,
                  [ApVenueStatusEnum.OPERATIONAL]: 1,
                  [ApVenueStatusEnum.TRANSIENT_ISSUE]: 1
                }
              }
            }
          ],
          totalCount: 1
        },
        switches: {
          switchesStatus: [
            {
              '01d74a2c947346a1a963a310ee8c9f6f': {
                totalCount: 4,
                switchStatus: {
                  [SwitchStatusEnum.DISCONNECTED]: 1,
                  [SwitchStatusEnum.NEVER_CONTACTED_CLOUD]: 1,
                  [SwitchStatusEnum.INITIALIZING]: 1,
                  [SwitchStatusEnum.OPERATIONAL]: 1
                }
              }
            }],
          totalCount: 1
        },
        venues: [
          {
            '01d74a2c947346a1a963a310ee8c9f6f': {
              country: 'United States',
              city: 'Sunnyvale, California',
              latitude: 37.36883,
              description: '',
              crtTime: '1654766655192',
              timeZone: 'America/Los_Angeles',
              type: 'venue',
              lastUpdTime: '1654766655192',
              name: 'Vasanth-Venue',
              tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
              id: '01d74a2c947346a1a963a310ee8c9f6f',
              venueStatus: ApVenueStatusEnum.OPERATIONAL,
              longitude: -122.0363496
            }
          },
          {
            '01d74a2c947346a1a963a310ee8cABCD': {
              country: 'United States',
              city: 'Sunnyvale, California',
              description: '',
              crtTime: '1654766655192',
              timeZone: 'America/Los_Angeles',
              type: 'venue',
              lastUpdTime: '1654766655192',
              name: 'Test-Venue',
              tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
              id: '01d74a2c947346a1a963a310ee8c9f6f',
              venueStatus: ApVenueStatusEnum.OPERATIONAL
            }
          }
        ]
      }

      expect(massageVenuesData(data)).toStrictEqual([
        {
          venueId: '01d74a2c947346a1a963a310ee8c9f6f',
          name: 'Vasanth-Venue',
          status: '2_Operational',
          latitude: 37.36883,
          longitude: -122.0363496,
          switchClientsCount: 0,
          apStat: [
            {
              category: 'APs',
              series: [
                {
                  name: '1 Requires Attention',
                  value: 1
                },
                {
                  name: '2 Transient Issue',
                  value: 1
                },
                {
                  name: '3 In Setup Phase',
                  value: 2
                },
                {
                  name: '4 Operational',
                  value: 1
                }
              ]
            }
          ],
          switchStat: [
            {
              category: 'Switches',
              series: [
                {
                  name: '1 Requires Attention',
                  value: 1
                },
                {
                  name: '2 Transient Issue',
                  value: 0
                },
                {
                  name: '3 In Setup Phase',
                  value: 2
                },
                {
                  name: '4 Operational',
                  value: 1
                }
              ]
            }
          ],
          apsCount: 5,
          switchesCount: 4,
          clientsCount: undefined,
          visible: true
        },
        {
          venueId: '01d74a2c947346a1a963a310ee8cABCD',
          name: 'Test-Venue',
          status: '2_Operational',
          latitude: 41.9021622,
          longitude: 12.4572277,
          switchClientsCount: 0,
          apStat: [
            {
              category: 'APs',
              series: [
                {
                  name: '1 Requires Attention',
                  value: 0
                },
                {
                  name: '2 Transient Issue',
                  value: 0
                },
                {
                  name: '3 In Setup Phase',
                  value: 0
                },
                {
                  name: '4 Operational',
                  value: 0
                }
              ]
            }
          ],
          switchStat: [
            {
              category: 'Switches',
              series: [
                {
                  name: '1 Requires Attention',
                  value: 0
                },
                {
                  name: '2 Transient Issue',
                  value: 0
                },
                {
                  name: '3 In Setup Phase',
                  value: 0
                },
                {
                  name: '4 Operational',
                  value: 0
                }
              ]
            }
          ],
          apsCount: 0,
          switchesCount: 0,
          clientsCount: undefined,
          visible: true
        }
      ])
    })


    it('should massage the data correctly when ap and switch status are not present', async () => {
      const data: Dashboard = {
        summary: {
          clients: {
            summary: {},
            totalCount: 0,
            clientDto: [{}]
          },
          aps: {
            summary: {
            },
            totalCount: 0
          },
          alarms: {
            summary: {
              clear: 0
            },
            totalCount: 0
          },
          switches: {
            summary: {},
            totalCount: 0
          },
          venues: {
            summary: {
            },
            totalCount: 0
          },
          switchClients: {
            summary: {},
            totalCount: 0
          }
        },
        aps: {
          apsStatus: [],
          totalCount: 0
        },
        switches: {
          switchesStatus: undefined,
          totalCount: 0
        },
        venues: [
          {
            '01d74a2c947346a1a963a310ee8c9f6f': {
              country: 'United States',
              city: 'Sunnyvale, California',
              latitude: 37.36883,
              description: '',
              crtTime: '1654766655192',
              timeZone: 'America/Los_Angeles',
              type: 'venue',
              lastUpdTime: '1654766655192',
              name: 'Vasanth-Venue',
              tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
              id: '01d74a2c947346a1a963a310ee8c9f6f',
              venueStatus: ApVenueStatusEnum.OPERATIONAL,
              longitude: -122.0363496
            }
          }
        ]
      }

      expect(massageVenuesData(data)).toEqual([
        {
          venueId: '01d74a2c947346a1a963a310ee8c9f6f',
          name: 'Vasanth-Venue',
          status: '2_Operational',
          latitude: 37.36883,
          longitude: -122.0363496,
          switchClientsCount: 0,
          apStat: [
            {
              category: 'APs',
              series: [
                {
                  name: '1 Requires Attention',
                  value: 0
                },
                {
                  name: '2 Transient Issue',
                  value: 0
                },
                {
                  name: '3 In Setup Phase',
                  value: 0
                },
                {
                  name: '4 Operational',
                  value: 0
                }
              ]
            }
          ],
          switchStat: [
            {
              category: 'Switches',
              series: [
                {
                  name: '1 Requires Attention',
                  value: 0
                },
                {
                  name: '2 Transient Issue',
                  value: 0
                },
                {
                  name: '3 In Setup Phase',
                  value: 0
                },
                {
                  name: '4 Operational',
                  value: 0
                }
              ]
            }
          ],
          apsCount: 0,
          switchesCount: 0,
          clientsCount: undefined,
          visible: true
        }
      ])
    })
  })

  it('should return the correct marker color for the AP status', ()=>{
    expect(getMarkerColor([ApVenueStatusEnum.REQUIRES_ATTENTION]))
      .toStrictEqual({ default: '#ED1C24', hover: '#A00D14' })
    expect(getMarkerColor([ApVenueStatusEnum.TRANSIENT_ISSUE]))
      .toStrictEqual({ default: '#F9C34B', hover: '#E47B01' })
    expect(getMarkerColor([ApVenueStatusEnum.OPERATIONAL]))
      .toStrictEqual({ default: '#23AB36', hover: '#226D2C' }) //default colors
    expect(getMarkerColor([ApVenueStatusEnum.IN_SETUP_PHASE]))
      .toStrictEqual({ default: '#ACAEB0', hover: '#565758' })
  })

  it('should return cluster svg string with the given fill color', ()=>{
    expect(getClusterSVG('#ACAEB0')).toEqual(expect.stringContaining('fill="#ACAEB0"'))
  })

  it('should return marker svg string with the given fill color', ()=>{
    expect(getMarkerSVG('#ACAEB1')).toEqual(expect.stringContaining('fill="#ACAEB1"'))
  })

  it('should return the correct color for the device status', ()=>{
    expect(getDeviceConnectionStatusColors())
      .toStrictEqual([
        '#23AB36',
        '#ACAEB0',
        '#F9C34B',
        '#ED1C24'])
  })

  describe('getIcon', () => {
    beforeAll(() => {
      initialize()
    })
    // Clear all mocks
    beforeEach(() => {
      mockInstances.clearAll()
    })
    it('should return the correct marker icon with size', ()=>{
      expect(getIcon('some svg string', new google.maps.Size(10,10))).toMatchObject({
        icon: {
          url: 'data:image/svg+xml;base64,c29tZSBzdmcgc3RyaW5n',
          scaledSize: {
            height: 10,
            width: 10
          }
        }
      })
    })
  })
})
