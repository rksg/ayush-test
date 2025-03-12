import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Card, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  useGetNetworkTemplateListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  EnhancedAccessControlInfoType,
  Network,
  NetworkTypeEnum,
  networkTypes,
  useConfigTemplate,
  useTableQuery
} from '@acx-ui/rc/utils'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'nwSubType',
    'venues',
    'id'
  ]
}

// eslint-disable-next-line max-len
const AccessControlNetworksDetail = (props: { data: EnhancedAccessControlInfoType | undefined }) => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const enableWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const { data } = props

  const basicColumns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      align: 'left',
      searchable: true,
      key: 'name',
      fixed: 'left',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      align: 'left',
      key: 'nwSubType',
      sorter: true,
      render: (_, row) => {
        return $t(networkTypes[row.nwSubType as NetworkTypeEnum])
      }
    },
    {
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venues',
      align: 'center',
      key: 'venues',
      sorter: true,
      renderText: (row) => row?.count ?? 0
    }
  ]

  useEffect(() => {
    if (data?.wifiNetworkIds?.length) {
      tableQuery.setPayload({
        ...defaultPayload,
        filters: {
          id: data.wifiNetworkIds
        }
      })
    }
  }, [data])

  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetNetworkTemplateListQuery :
      enableWifiRbac? useWifiNetworkListQuery : useNetworkListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        id: data?.networkIds?.length ? data?.networkIds : ['none']
      }
    },
    enableRbac: isTemplate ? enableTemplateRbac : enableWifiRbac
  })

  return (
    <Card title={$t({ defaultMessage: 'Instance ({count})' }, {
      count: tableQuery.data?.totalCount
    })}>
      <Table
        columns={basicColumns}
        enableApiFilter={true}
        dataSource={tableQuery.data?.data}
        onFilterChange={tableQuery.handleFilterChange}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Card>
  )
}

export default AccessControlNetworksDetail
