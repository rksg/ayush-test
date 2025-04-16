import { useEffect, useState } from 'react'

import { FormattedMessage, useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                       from '@acx-ui/feature-toggle'
import { useGetNetworkTemplateListQuery, useNetworkListQuery, useWifiNetworkListQuery } from '@acx-ui/rc/services'
import {
  ConfigTemplateType,
  GuestNetworkTypeEnum, Network, NetworkTypeEnum, networkTypes,
  useConfigTemplate, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { renderConfigTemplateDetailsComponent } from '../../configTemplates'
import { captiveNetworkTypes }                  from '../../NetworkForm/contentsMap'
import { useGetAAAPolicyInstanceList }          from '../AAAForm/aaaPolicyQuerySwitcher'

export default function AAAInstancesTable () {
  const { isTemplate } = useConfigTemplate()
  const { $t } = useIntl()

  const tableQuery = useAaaInstanceTableQuery()

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


function useAaaInstanceTableQuery () {
  const { isTemplate } = useConfigTemplate()
  const enableWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const params = useParams()
  const { data: aaaPolicyViewModel } = useGetAAAPolicyInstanceList({
    customPayload: { filters: { id: [ params?.policyId ] } }
  })
  const [ aaaPolicyDataReady, setAaaPolicyDataReady ] = useState(false)

  const getNetworkListQuery = enableWifiRbac? useWifiNetworkListQuery : useNetworkListQuery
  const useQuery = isTemplate ? useGetNetworkTemplateListQuery : getNetworkListQuery
  const tableQuery = useTableQuery<Network>({
    useQuery,
    defaultPayload: {
      fields: ['name', 'id', 'captiveType', 'nwSubType']
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
    enableRbac: isTemplate ? enableTemplateRbac : enableWifiRbac,
    option: {
      skip: !aaaPolicyDataReady
    }
  })

  useEffect(() => {
    if (!aaaPolicyViewModel) return

    const networkIds = aaaPolicyViewModel.data[0]?.networkIds ?? []

    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { id: networkIds.length > 0 ? networkIds : ['NO_NETWORK'] }
    })

    setAaaPolicyDataReady(true)
  }, [aaaPolicyViewModel])

  return tableQuery
}
