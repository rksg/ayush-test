import { FormattedMessage, useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                     from '@acx-ui/components'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { useGetNetworkTemplateListQuery, useNetworkListQuery } from '@acx-ui/rc/services'
import {
  captiveNetworkTypes, ConfigTemplateType,
  GuestNetworkTypeEnum, Network, NetworkTypeEnum, networkTypes,
  useConfigTemplate, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { renderConfigTemplateDetailsComponent } from '../../configTemplates'

export default function AAAInstancesTable (props: { networkIds: string[] }) {
  const { networkIds } = props
  const { isTemplate } = useConfigTemplate()
  const { $t } = useIntl()
  const enableRbac = useIsSplitOn(Features.ACX_UI_RBAC_SERVICE_POLICY_TOGGLE)

  const useQuery = isTemplate ? useGetNetworkTemplateListQuery : useNetworkListQuery
  const tableQuery = useTableQuery<Network>({
    useQuery,
    defaultPayload: {
      fields: ['name', 'id', 'captiveType', 'nwSubType'],
      filters: { id: networkIds?.length > 0 ? networkIds : [''] }
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 10000
    },
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    },
    enableRbac
  })

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: function (_, row) {
        return isTemplate
          // eslint-disable-next-line max-len
          ? renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, row.name)
          // eslint-disable-next-line max-len
          : <TenantLink to={`/networks/wireless/${row.id}/network-details/aps`}>{row.name}</TenantLink>
      }
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => {
        const message = networkTypes[row.nwSubType.toLowerCase() as NetworkTypeEnum]
        return row.nwSubType === 'GUEST'
          ? <FormattedMessage
            defaultMessage={'Captive Portal - {captiveNetworkType}'}
            values={{
              captiveNetworkType: $t(captiveNetworkTypes[
                row.captiveType as GuestNetworkTypeEnum || GuestNetworkTypeEnum.Cloudpath
              ])
            }}
          />
          : <FormattedMessage {...message}/>
      }
    }
  ]
  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount })}>
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='id'
          onFilterChange={tableQuery.handleFilterChange}
        />
      </Card>
    </Loader>
  )
}
