import React, { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Card, Table, TableProps }                                                      from '@acx-ui/components'
import { Features, useIsSplitOn }                                                       from '@acx-ui/feature-toggle'
import { useGetNetworkTemplateListQuery, useNetworkListQuery, useWifiNetworkListQuery } from '@acx-ui/rc/services'
import { Network, NetworkTypeEnum, networkTypes, useConfigTemplate, WifiNetwork }       from '@acx-ui/rc/utils'
import { useTableQuery }                                                                from '@acx-ui/utils'

import { WifiCallingDetailContext } from './WifiCallingDetailView'


const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'nwSubType',
    'venues',
    'id',
    'venueApGroups'
  ]
}

const WifiCallingNetworksDetail = () => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const enableWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

  const basicColumns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      searchable: true,
      key: 'name',
      fixed: 'left',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      key: 'nwSubType',
      sorter: true,
      render: (_, row) => {
        return $t(networkTypes[row.nwSubType as NetworkTypeEnum])
      }
    },
    {
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venues',
      key: 'venues',
      sorter: true,
      renderText: (_, row) => {
        return (enableWifiRbac || enableTemplateRbac)
          ? (row as WifiNetwork).venueApGroups.length
          : row.venues.count
      }
    }
  ]

  const { networkIds } = useContext(WifiCallingDetailContext)

  useEffect(() => {
    if (networkIds && networkIds?.length) {
      tableQuery.setPayload({
        ...defaultPayload,
        filters: {
          id: networkIds
        }
      })
    }
  }, [networkIds])

  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetNetworkTemplateListQuery :
      enableWifiRbac? useWifiNetworkListQuery : useNetworkListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        id: networkIds?.length ? networkIds : ['none']
      }
    },
    enableRbac: isTemplate ? enableTemplateRbac : enableWifiRbac
  })

  return (
    <Card title={`${$t({ defaultMessage: 'Instance' })} (${tableQuery.data?.totalCount})`}>
      <div style={{ width: '100%' }}>
        <Table
          columns={basicColumns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
        />
      </div>
    </Card>
  )
}

export default WifiCallingNetworksDetail
