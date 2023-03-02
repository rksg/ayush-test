import React from 'react'

import { APExtended } from '../../../../../../rc/utils/src/index'

import { Table, TableProps } from '..'
import { showToast }         from '../../Toast'

type RecordType = {
  key: string
  name: string
  givenName: string
  surname: string
  age: number
  description: string
  address: string,
  children?: RecordType[]
}

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

// group-by apGroup
const rawResponse: APExtendedGroupedResponse = {
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




export const columns: TableProps<APExtendedGroupedResponse['data']>['columns'] = [
  {
    title: 'AP Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Status',
    dataIndex: 'deviceStatus',
    key: 'deviceStatus',
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
    title: 'MAC Addresse',
    dataIndex: 'apMac',
    key: 'apMac'
  },
  {
    title: 'Venue',
    key: 'venueName',
    dataIndex: 'venueId'
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
    dataIndex: 'deviceGroupName'
  }
]

export const data = rawResponse.data.map(ap => ({
  ...ap,
  children: ap.aps
})) as unknown as TableProps<APExtendedGroupedResponse['data']>['dataSource']

const rowActions: TableProps<APExtendedGroupedResponse['data']>['rowActions'] = [
  {
    label: 'Edit',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Edit ${selectedRows.length} item(s)`
    })
  },
  {
    label: 'Delete',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Delete ${selectedRows.length} item(s)`
    })
  }
]

export function GroupTable () {
  return (
    <>
    with selection:
      <Table<APExtendedGroupedResponse['data']>
        columns={columns}
        rowActions={rowActions}
        dataSource={data}
        rowSelection={{ defaultSelectedRowKeys: [] }}
        rowKey="serialNumber"
      />
    </>
  )
}
