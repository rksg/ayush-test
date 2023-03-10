import React from 'react'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { APExtended } from 'libs/rc/utils/src/types/ap'
import { uniqueId }   from 'lodash'

import { Table, TableProps } from '..'
import { Button }            from '../../Button'


type APExtendedGroupedResponse = {
  totalCount: number
  page: number
  data: ({
    networks: {
      count: number
      names: string[]
    }
    members: number
    incidents: number
    deviceGroupId: string
    deviceGroupName: string
    deviceStatus: string
    model: string
    clients: number
    name?: string
    aps: APExtended[]
  })[]
}

/**
 * Sample function cleaning
*/
function cleanResponse (response: APExtendedGroupedResponse | APExtended[] | undefined) {
  if (!response) return []

  let typedData
  if (Array.isArray(response)) {
    typedData = response
  } else {
    typedData = response.data
  }

  return typedData.map(apGroup => {
    const { aps } = apGroup as unknown as { aps: APExtended[] | undefined }
    const children = aps?.map(ap => ({
      ...ap,
      deviceGroupName: (ap.deviceGroupName !== '')
        ? ap.deviceGroupName
        : 'Uncategorized',
      id: uniqueId()
    }))
    return {
      ...apGroup,
      id: uniqueId(),
      children: children ?? null
    }
  })
}

// group-by apGroup
const apGroupResponse: APExtendedGroupedResponse = {
  totalCount: 3,
  page: 1,
  data: [
    //List ALL AP groups including
    // 1. the group without aps
    // 2. the device group name is "" group
    {
      deviceGroupId: '99227979648c421c93c15c586e6ed80b',
      deviceGroupName: 'apgroup1',
      deviceStatus: '',
      model: '',
      networks: {
        count: 2,
        names: [
          '!!!VKOPEN!!!',
          'AAA_TEST'
        ]
      },
      members: 2,
      incidents: 220,
      clients: 4,
      aps: [ // List the ap list under this group
        {
          serialNumber: '302002015736',
          name: '302002015736-0802',
          model: 'R550',
          fwVersion: '6.2.0.103.500',
          venueId: '4c778ed630394b76b17bce7fe230cf9f',
          venueName: 'My-Venue',
          deviceStatus: '2_00_Operational',
          IP: '10.206.1.34',
          apMac: '34:20:E3:19:79:F0',
          apStatusData: {
            APRadio: [
              {
                txPower: null,
                channel: 1,
                band: '2.4G',
                Rssi: null,
                radioId: 0
              },
              {
                txPower: null,
                channel: 36,
                band: '5G',
                Rssi: null,
                radioId: 1
              }
            ]
          },
          meshRole: 'DISABLED',
          deviceGroupId: '99227979648c421c93c15c586e6ed80b',
          clients: 2,
          tags: 'tag 1',
          deviceGroupName: 'apgroup1'
        },
        {
          serialNumber: '302002015732',
          name: '302002015736-0802',
          model: 'R550',
          fwVersion: '6.2.0.103.500',
          venueId: '4c778ed630394b76b17bce7fe230cf9f',
          venueName: 'My-Venue',
          deviceStatus: '2_00_Operational',
          IP: '10.206.1.34',
          apMac: '34:20:E3:19:79:F0',
          apStatusData: {
            APRadio: [
              {
                txPower: null,
                channel: 1,
                band: '2.4G',
                Rssi: null,
                radioId: 0
              },
              {
                txPower: null,
                channel: 36,
                band: '5G',
                Rssi: null,
                radioId: 1
              }
            ]
          },
          meshRole: 'DISABLED',
          deviceGroupId: '99227979648c421c93c15c586e6ed80b',
          clients: 2,
          tags: 'tag 2',
          deviceGroupName: 'apgroup1'
        }
      ]
    }, {
      deviceGroupId: '9095a8cf11c845a9afe4d3643c46a222',
      deviceGroupName: 'apgroup2',
      deviceStatus: '',
      model: '',
      networks: {
        count: 0,
        names: []
      },
      members: 0,
      incidents: 0,
      clients: 0,
      aps: []  //Empty AP list
    }, {
      deviceGroupId: '',
      deviceGroupName: ' ', //(Ungrouped APs)
      deviceStatus: '',
      model: '',
      networks: {
        count: 0,
        names: []
      },
      members: 1,
      incidents: 0,
      clients: 2,
      aps: [{
        serialNumber: '302002015799',
        name: 'ap3',
        model: 'R550',
        fwVersion: '6.2.0.103.500',
        venueId: '4c778ed630394b76b17bce7fe230cf9f',
        venueName: 'My-Venue',
        deviceStatus: '1_InSetupPhase',
        IP: '10.206.1.34',
        apMac: '34:20:E3:19:79:99',
        apStatusData: {
          APRadio: [
            {
              txPower: null,
              channel: 1,
              band: '2.4G',
              Rssi: null,
              radioId: 0
            },
            {
              txPower: null,
              channel: 36,
              band: '5G',
              Rssi: null,
              radioId: 1
            }
          ]
        },
        meshRole: 'DISABLED',
        deviceGroupId: '',
        clients: 2,
        tags: '',
        deviceGroupName: '' //(Ungrouped APs)
      }]
    }
  ]
}

const deviceStatusResponse: APExtendedGroupedResponse = {
  totalCount: 4,
  page: 1,
  data: [
    //List ALL deviceStatus including empty deviceStatus
    {
      deviceGroupId: '',
      deviceGroupName: '',
      deviceStatus: '2_00_Operational',
      model: '',
      networks: {
        count: 0,
        names: []
      },
      members: 2,
      incidents: 220,
      clients: 4,
      aps: [ // List the ap list under this deviceStatus
        {
          serialNumber: '302002015736',
          name: '302002015736-0802',
          model: 'R550',
          fwVersion: '6.2.0.103.500',
          venueId: '4c778ed630394b76b17bce7fe230cf9f',
          venueName: 'My-Venue',
          deviceStatus: '2_00_Operational',
          IP: '10.206.1.34',
          apMac: '34:20:E3:19:79:F0',
          apStatusData: {
            APRadio: [
              {
                txPower: null,
                channel: 1,
                band: '2.4G',
                Rssi: null,
                radioId: 0
              },
              {
                txPower: null,
                channel: 36,
                band: '5G',
                Rssi: null,
                radioId: 1
              }
            ]
          },
          meshRole: 'DISABLED',
          deviceGroupId: '99227979648c421c93c15c586e6ed80b',
          clients: 2,
          tags: '',
          deviceGroupName: 'AP_GROUP'
        },
        {
          serialNumber: '302002015732',
          name: '302002015736-0802',
          model: 'R550',
          fwVersion: '6.2.0.103.500',
          venueId: '4c778ed630394b76b17bce7fe230cf9f',
          venueName: 'My-Venue',
          deviceStatus: '2_00_Operational',
          IP: '10.206.1.34',
          apMac: '34:20:E3:19:79:F0',
          apStatusData: {
            APRadio: [
              {
                txPower: null,
                channel: 1,
                band: '2.4G',
                Rssi: null,
                radioId: 0
              },
              {
                txPower: null,
                channel: 36,
                band: '5G',
                Rssi: null,
                radioId: 1
              }
            ]
          },
          meshRole: 'DISABLED',
          deviceGroupId: '99227979648c421c93c15c586e6ed80b',
          clients: 2,
          tags: '',
          deviceGroupName: 'AP_GROUP2'
        }
      ]
    }, {
      deviceGroupId: '',
      deviceGroupName: '',
      deviceStatus: '3_RequiresAttention',
      model: '',
      networks: {
        count: 0,
        names: []
      },
      members: 0,
      incidents: 0,
      clients: 0,
      aps: []
    }, {
      deviceGroupId: '',
      deviceGroupName: '',
      deviceStatus: '1_InSetupPhase',
      model: '',
      networks: {
        count: 0,
        names: []
      },
      members: 0,
      incidents: 0,
      clients: 0,
      aps: []
    }, {
      deviceGroupId: '',
      deviceGroupName: '',
      deviceStatus: '1_InSetupPhase_Offline',
      model: '',
      networks: {
        count: 0,
        names: []
      },
      members: 0,
      incidents: 0,
      clients: 0,
      aps: []
    }
  ]
}

const modelResponse: APExtendedGroupedResponse = {
  totalCount: 2,
  page: 1,
  data: [
    //List ALL model including
    {
      deviceGroupId: '',
      deviceGroupName: '',
      deviceStatus: '',
      model: 'R550',
      networks: {
        count: 0,
        names: []
      },
      members: 2,
      incidents: 2,
      clients: 3,
      aps: [ // List the ap list under this model
        {
          serialNumber: '302002015736',
          name: 'ap1',
          model: 'R550',
          fwVersion: '6.2.0.103.500',
          venueId: '4c778ed630394b76b17bce7fe230cf9f',
          venueName: 'My-Venue',
          deviceStatus: '2_00_Operational',
          IP: '10.206.1.34',
          apMac: '34:20:E3:19:79:F0',
          apStatusData: {
            APRadio: [
              {
                txPower: null,
                channel: 1,
                band: '2.4G',
                Rssi: null,
                radioId: 0
              },
              {
                txPower: null,
                channel: 36,
                band: '5G',
                Rssi: null,
                radioId: 1
              }
            ]
          },
          meshRole: 'DISABLED',
          deviceGroupId: '99227979648c421c93c15c586e6ed80b',
          clients: 2,
          tags: 'tag2',
          deviceGroupName: 'AP_GROUP'
        },
        {
          serialNumber: '302002015732',
          name: 'ap-test-2',
          model: 'R550',
          fwVersion: '6.2.0.103.500',
          venueId: '4c778ed630394b76b17bce7fe230cf9f',
          venueName: 'My-Venue',
          deviceStatus: '2_00_Operational',
          IP: '10.206.1.34',
          apMac: '34:20:E3:19:79:F0',
          apStatusData: {
            APRadio: [
              {
                txPower: null,
                channel: 1,
                band: '2.4G',
                Rssi: null,
                radioId: 0
              },
              {
                txPower: null,
                channel: 36,
                band: '5G',
                Rssi: null,
                radioId: 1
              }
            ]
          },
          meshRole: 'DISABLED',
          deviceGroupId: '99227979648c421c93c15c586e6ed80b',
          clients: 2,
          tags: 'tag2',
          deviceGroupName: 'AP_GROUP'
        }
      ]
    }, {
      deviceGroupId: '',
      deviceGroupName: '',
      deviceStatus: '',
      model: '',  //(Empty Model )
      networks: {
        count: 0,
        names: []
      },
      members: 1,
      incidents: 2,
      clients: 3,
      aps: [ // List the ap list under this model
        {
          serialNumber: '302002015735',
          name: 'ap2',
          model: ' ',
          fwVersion: '6.2.0.103.500',
          venueId: '4c778ed630394b76b17bce7fe230cf9f',
          venueName: 'My-Venue',
          deviceStatus: '2_00_Operational',
          IP: '10.206.1.34',
          apMac: '34:20:E3:19:79:00',
          apStatusData: {
            APRadio: [
              {
                txPower: null,
                channel: 1,
                band: '2.4G',
                Rssi: null,
                radioId: 0
              },
              {
                txPower: null,
                channel: 36,
                band: '5G',
                Rssi: null,
                radioId: 1
              }
            ]
          },
          meshRole: 'DISABLED',
          deviceGroupId: '99227979648c421c93c15c586e6ed80b',
          clients: 2,
          tags: 'tag1',
          deviceGroupName: 'AP_GROUP'
        }
      ]
    }
  ]
}



const flatData: APExtended[] = [
  {
    serialNumber: '302002015735',
    name: 'ap2',
    model: ' ',
    fwVersion: '6.2.0.103.500',
    venueId: '4c778ed630394b76b17bce7fe230cf9f',
    venueName: 'My-Venue',
    deviceStatus: '2_00_Operational',
    IP: '10.206.1.34',
    apMac: '34:20:E3:19:79:00',
    apStatusData: {
      APRadio: [
        {
          txPower: null,
          channel: 1,
          band: '2.4G',
          Rssi: null,
          radioId: 0
        },
        {
          txPower: null,
          channel: 36,
          band: '5G',
          Rssi: null,
          radioId: 1
        }
      ]
    },
    meshRole: 'DISABLED',
    deviceGroupId: '99227979648c421c93c15c586e6ed80b',
    clients: 2,
    tags: 'tag1',
    deviceGroupName: 'AP_GROUP'
  },
  {
    serialNumber: '302002015736',
    name: 'ap1',
    model: 'R550',
    fwVersion: '6.2.0.103.500',
    venueId: '4c778ed630394b76b17bce7fe230cf9f',
    venueName: 'My-Venue',
    deviceStatus: '2_00_Operational',
    IP: '10.206.1.34',
    apMac: '10:10:E3:19:79:F0',
    apStatusData: {
      APRadio: [
        {
          txPower: null,
          channel: 1,
          band: '2.4G',
          Rssi: null,
          radioId: 0
        },
        {
          txPower: null,
          channel: 36,
          band: '5G',
          Rssi: null,
          radioId: 1
        }
      ]
    },
    meshRole: 'DISABLED',
    deviceGroupId: '99227979648c421c93c15c586e6ed80b',
    clients: 2,
    tags: 'tag3',
    deviceGroupName: 'AP_GROUP'
  },
  {
    serialNumber: '302002015732',
    name: 'ap-test-2',
    model: 'R550',
    fwVersion: '6.2.0.103.500',
    venueId: '4c778ed630394b76b17bce7fe230cf9f',
    venueName: 'My-Venue',
    deviceStatus: '2_00_Operational',
    IP: '10.206.1.34',
    apMac: 'C4:AA:E3:19:79:F0',
    apStatusData: {
      APRadio: [
        {
          txPower: null,
          channel: 1,
          band: '2.4G',
          Rssi: null,
          radioId: 0
        },
        {
          txPower: null,
          channel: 36,
          band: '5G',
          Rssi: null,
          radioId: 1
        }
      ]
    },
    meshRole: 'DISABLED',
    deviceGroupId: '99227979648c421c93c15c586e6ed80b',
    clients: 2,
    tags: 'tag3',
    deviceGroupName: 'AP_GROUP'
  }
]

export const groupTBData = cleanResponse(apGroupResponse)

// can do mocked table query here with pagination and delay + loader
export const groupByColumns: TableProps<typeof groupTBData[0] | typeof flatData[0]>['columns'] = [
  {
    title: 'AP Name',
    dataIndex: 'name',
    key: 'name',
    searchable: true,
    sorter: true
  },
  {
    title: 'Status',
    dataIndex: 'deviceStatus',
    key: 'deviceStatus',
    filterable: true,
    filterValueNullable: false,
    sorter: true,
    groupable: {
      key: 'deviceStatus',
      label: 'Status',
      parentColumns: [
        {
          key: 'deviceStatus',
          renderer: (record) => <b>{record.deviceStatus}</b>
        },
        {
          key: 'members',
          renderer: (record) => <div>Members: {record.members}</div>
        },
        {
          key: 'incidents',
          renderer: (record) => <div>Incidents (24 hours): {record.incidents}</div>
        },
        {
          key: 'clients',
          renderer: (record) => <div>Connected Clients: {record.clients}</div>
        },
        {
          key: 'networks',
          renderer: (record) => <div>
              Wireless Networks: {record.networks ? record.networks.count : 0}
          </div>
        }
      ]
    }
  },
  {
    title: 'Model',
    dataIndex: 'model',
    key: 'model',
    sorter: true,
    groupable: {
      key: 'model',
      label: 'Model',
      parentColumns: [
        {
          key: 'model',
          renderer: (record) => <b>{record.model}</b>
        },
        {
          key: 'members',
          renderer: (record) => <div>Members: {record.members}</div>
        },
        {
          key: 'incidents',
          renderer: (record) => <div>Incidents (24 hours): {record.incidents}</div>
        },
        {
          key: 'clients',
          renderer: (record) => <div>Connected Clients: {record.clients}</div>
        },
        {
          key: 'networks',
          renderer: (record) => <div>
              Wireless Networks: {record.networks ? record.networks.count : 0}
          </div>
        }
      ]
    }
  },
  {
    title: 'IP Address',
    dataIndex: 'IP',
    key: 'ip',
    sorter: true,
    render: (dom) => dom
  },
  {
    title: 'MAC Addresses',
    dataIndex: 'apMac',
    key: 'apMac',
    searchable: true
  },
  {
    title: 'Venue',
    key: 'venueName',
    dataIndex: 'venueId',
    sorter: true
  },
  {
    title: 'Switch',
    key: 'switchName',
    dataIndex: 'switchName'
  },
  {
    title: 'Connected Clients',
    key: 'clients',
    dataIndex: 'clients',
    sorter: true,
    render: (dom) => dom
  },
  {
    title: 'AP Group',
    key: 'deviceGroupName',
    dataIndex: 'deviceGroupName',
    filterable: true,
    searchable: true,
    groupable: {
      key: 'deviceGroupName',
      label: 'AP Group',
      actions: [{
        key: 'edit',
        label: (record) => <Button onClick={() => {
          // eslint-disable-next-line no-console
          console.log(`trigger edit apgroup button with data: ${JSON.stringify(record)}`)
        }}>Edit</Button>
      }],
      parentColumns: [
        {
          key: 'deviceGroupName',
          renderer: (record) => <b>{record.deviceGroupName}</b>
        },
        {
          key: 'members',
          renderer: (record) => <div>Members: {record.members}</div>
        },
        {
          key: 'incidents',
          renderer: (record) => <div>Incidents (24 hours): {record.incidents}</div>
        },
        {
          key: 'clients',
          renderer: (record) => <div>Connected Clients: {record.clients}</div>
        },
        {
          key: 'networks',
          renderer: (record) => <div>
              Wireless Networks: {record.networks ? record.networks.count : 0}
          </div>
        }
      ]
    }
  },
  {
    title: 'RF Channels',
    key: 'rf-channels',
    dataIndex: 'rf-channels'
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    filterable: true
  }
]

function useMockData () {
  const [ currData, setCurrData ] =
    React.useState<typeof groupTBData | typeof flatData>(() => cleanResponse(flatData))

  const [groupByKey, setGroupByKey] = React.useState<string | undefined>(undefined)

  const updateGroupBy = (key: string | undefined) => {
    switch (key) {
      case 'deviceGroupName': {
        setCurrData(cleanResponse(apGroupResponse))
        return
      }
      case 'deviceStatus': {
        setCurrData(cleanResponse(deviceStatusResponse))
        return
      }
      case 'model' : {
        setCurrData(cleanResponse(modelResponse))
        return
      }
      default: {
        setCurrData(cleanResponse(flatData))
        return
      }
    }
  }

  React.useEffect(() => {
    updateGroupBy(groupByKey)
  }, [groupByKey])

  return { currData, setGroupByKey }
}

export function GroupTable () {
  const { currData, setGroupByKey } = useMockData()
  return (
    <>
    with groupby:
      <Table<typeof groupTBData[0] | typeof flatData[0]>
        columns={groupByColumns}
        dataSource={currData as unknown as TableProps<typeof groupTBData[0]>['dataSource']}
        rowKey='id' // need to set unique entry per record to ensure proper behaviour
        indentSize={6}
        columnEmptyText='-'
        onFilterChange={(_filter, _search, groupBy) => {
          setGroupByKey(groupBy)
        }}
      />
    </>
  )
}
