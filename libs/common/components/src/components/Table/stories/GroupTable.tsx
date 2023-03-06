import React from 'react'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { APExtended }     from 'libs/rc/utils/src/types/ap'
import { omit, uniqueId } from 'lodash'

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
    aps: APExtended[]
  })[]
}

function cleanResponse (response: APExtendedGroupedResponse) {
  return response.data.map(apGroup => {
    const parent = omit(apGroup, ['deviceGroupName', 'clients', 'aps'])
    const { aps } = apGroup
    return {
      ...parent,
      id: uniqueId(), // hacky trick, set the parent's device group as serialNumber since the table's id focuses on aps serial number
      children: aps.map(ap => ({
        ...ap,
        deviceGroupName: (ap.deviceGroupName !== '')
          ? ap.deviceGroupName
          : 'Uncategorized',
        id: uniqueId()
      }))
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
          tags: '',
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
          tags: '',
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
      aps: [ {
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
          tags: '',
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
          tags: '',
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
          tags: '',
          deviceGroupName: 'AP_GROUP'
        }
      ]
    }
  ]
}

const cleanedData = cleanResponse(apGroupResponse)

export function GroupTable () {
  const [ currData, setCurrData ] = React.useState<typeof cleanedData>(() => cleanedData)

  const groupableCallback = (key: 'deviceStatus' | 'model' | 'deviceGroupName') => {
    let response: APExtendedGroupedResponse
    switch (key) {
      case 'deviceGroupName': {
        response = apGroupResponse
        break
      }
      case 'deviceStatus': {
        response = deviceStatusResponse
        break
      }
      case 'model' : {
        response = modelResponse
        break
      }
    }
    if (!response) return []
    const data = cleanResponse(response)
    setCurrData(() => data)
    return data
  }

  // can do mocked table query here with pagination and delay + loader
  const columns: TableProps<typeof cleanedData[0]>['columns'] = [
    {
      title: 'AP Name',
      dataIndex: 'name',
      key: 'name',
      searchable: true
    },
    {
      title: 'Status',
      dataIndex: 'deviceStatus',
      key: 'deviceStatus',
      filterable: true
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: 'IP Address',
      dataIndex: 'IP',
      key: 'ip'
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
      filterable: true
    },
    {
      title: 'Switch',
      key: 'switchName',
      dataIndex: 'switchName'
    },
    {
      title: 'Connected Clients',
      key: 'clients',
      dataIndex: 'clients'
    },
    {
      title: 'AP Group',
      key: 'deviceGroupName',
      dataIndex: 'deviceGroupName',
      filterable: true
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

  return (
    <>
    with groupby:
      <Table<typeof cleanedData[0]>
        columns={columns}
        dataSource={currData as unknown as TableProps<typeof cleanedData[0]>['dataSource']}
        rowKey='id' // need to set unique entry per record to ensure proper behaviour
        indentSize={6}
        columnEmptyText='-'
        groupable={{
          selectors: [
            { key: 'deviceGroupName', label: 'AP Group', actionEnable: true },
            { key: 'deviceStatus' , label: 'Status' },
            { key: 'model', label: 'Model' }
          ],
          onChange: groupableCallback,
          actions: [{
            key: 'edit',
            label: <Button>Edit</Button>
          }],
          onClear: () => {
            // eslint-disable-next-line no-console
            console.log('clear data, reset to AP Group')
            // reset table to default
            setCurrData(groupableCallback('deviceGroupName'))
          }
        }}
      />
    </>
  )
}
