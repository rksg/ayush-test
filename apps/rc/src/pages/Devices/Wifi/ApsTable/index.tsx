import { useEffect, useState } from 'react'
import React                   from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Menu, MenuProps }     from 'antd'
import { omit, uniqueId }      from 'lodash'
import { useIntl }             from 'react-intl'

import {
  Button,
  Dropdown,
  PageHeader
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import { ApTable, CsvSize, ImportFileDrawer }                            from '@acx-ui/rc/components'
import { useApGroupsListQuery, useImportApMutation, useVenuesListQuery } from '@acx-ui/rc/services'
import { APExtended }                                                    from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                         from '@acx-ui/react-router-dom'
import { filterByAccess }                                                from '@acx-ui/user'



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
    const { deviceGroupName, members, incidents, clients, networks, aps } = apGroup
    return {
      ...parent,
      id: uniqueId(), // hacky trick, set the parent's device group as serialNumber since the table's id focuses on aps serial number
      name: `${deviceGroupName !== ' ' ? deviceGroupName : 'Uncategorized'} 
      Members: ${members} 
      Incidents: ${incidents} 
      Connected Clients: ${clients} 
      Wireless Networks: ${networks.count}`,
      children: aps.map(ap => ({ ...ap, deviceGroupName: (ap.deviceGroupName !== '')
        ? ap.deviceGroupName
        : 'Uncategorized',
      id: uniqueId() }))
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
export default function ApsTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [ importVisible, setImportVisible ] = useState(false)
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

  const { venueFilterOptions } = useVenuesListQuery({ params: { tenantId }, payload: {
    fields: ['name', 'country', 'latitude', 'longitude', 'id'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  } }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data.map(v=>({ key: v.id, value: v.name })) || true
    })
  })

  const { apgroupFilterOptions } = useApGroupsListQuery({ params: { tenantId }, payload: {
    fields: ['name', 'venueId', 'clients', 'networks', 'venueName', 'id'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC',
    filters: { isDefault: [false] },
    groupBy: 'deviceGroupName'
  } }, {
    selectFromResult: ({ data }) => ({
      apgroupFilterOptions: data?.data.map(v=>({ key: v.id, value: v.name })) || true
    })
  })

  const [ importCsv, importResult ] = useImportApMutation()

  const apGpsFlag = useIsSplitOn(Features.AP_GPS)
  const importTemplateLink = apGpsFlag ?
    'assets/templates/aps_import_template_with_gps.csv' :
    'assets/templates/aps_import_template.csv'

  useEffect(()=>{
    if (importResult.isSuccess) {
      setImportVisible(false)
    }
  },[importResult])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'import-from-file') {
      setImportVisible(true)
    }
  }

  const addMenu = <Menu
    onClick={handleMenuClick}
    items={[{
      key: 'ap',
      label: <TenantLink to='devices/wifi/add'>{$t({ defaultMessage: 'AP' })}</TenantLink>
    }, {
      key: 'import-from-file',
      label: $t({ defaultMessage: 'Import from file' })
    }, {
      key: 'ap-group',
      label: <TenantLink to='devices/apgroups/add'>
        {$t({ defaultMessage: 'AP Group' })}</TenantLink> }
    ]}
  />
  console.log('parent')

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Wi-Fi' })}
        extra={filterByAccess([
          <Dropdown overlay={addMenu}>{() =>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          }</Dropdown>
        ])}
      />
      <ApTable
        searchable={true}
        filterables={{
          venueId: venueFilterOptions,
          deviceGroupId: apgroupFilterOptions
        }}
        rowSelection={{
          type: 'checkbox'
        }}
        groupable={{
          selectors: [
            { key: 'deviceGroupName', label: 'AP Group' },
            { key: 'deviceStatus' , label: 'Status' },
            { key: 'model', label: 'Model' }
          ],
          onChange: groupableCallback,
          onClear: () => setCurrData([])
        }}
      />
      <ImportFileDrawer
        type='AP'
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        acceptType={['csv']}
        templateLink={importTemplateLink}
        visible={importVisible}
        isLoading={importResult.isLoading}
        importError={importResult.error as FetchBaseQueryError}
        importRequest={(formData)=>{
          importCsv({ params: { tenantId }, payload: formData })
        }}
        onClose={()=>setImportVisible(false)}/>
    </>
  )
}
