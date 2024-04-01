/* eslint-disable max-len */

import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps, Card, Loader }                                                                                            from '@acx-ui/components'
import { useGetPortalProfileDetailQuery, useGetEnhancedPortalTemplateListQuery, useGetNetworkTemplateListQuery, useNetworkListQuery } from '@acx-ui/rc/services'
import { Network, NetworkType, NetworkTypeEnum, useConfigTemplate, useTableQuery, ConfigTemplateType }                                from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                                      from '@acx-ui/react-router-dom'

import { renderConfigTemplateDetailsComponent } from '../../configTemplates'

export function PortalInstancesTable (){

  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const { data } = useGetPortalProfileDetailQuery({ params }, { skip: isTemplate })
  const templatePayload = {
    fields: ['id', 'name', 'wifiNetworkIds', 'displayLangCode'],
    filters: {
      id: [params.serviceId]
    },
    pageSize: 1024
  }
  const { data: templateData } = useGetEnhancedPortalTemplateListQuery({ params, payload: templatePayload }, { skip: !isTemplate })
  const useQuery = isTemplate ? useGetNetworkTemplateListQuery : useNetworkListQuery

  const tableQuery = useTableQuery<Network>({
    useQuery,
    defaultPayload: {
      fields: ['name', 'id', 'captiveType', 'nwSubType', 'venues', 'clients'],
      filters: {
        id: isTemplate ? templateData?.data?.[0]?.wifiNetworkIds?.length? templateData.data[0]?.wifiNetworkIds: ['none'] :
          (data?.networkIds?.length? data?.networkIds: ['none'])
      }
    },
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    }
  })

  useEffect(()=>{
    if(data){
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: {
          id: data?.networkIds?.length? data?.networkIds : ['none']
        }
      })
    }
  },[data])

  useEffect(()=>{
    if(templateData){
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: {
          id: templateData?.data?.[0]?.wifiNetworkIds?.length? templateData.data[0]?.wifiNetworkIds: ['none']
        }
      })
    }
  },[templateData])

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'NetworkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: function (_, row) {
        return isTemplate ?
          renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, row.name) :
          (
            <TenantLink
              to={`/networks/wireless/${row.id}/network-details/overview`}>
              {row.name}</TenantLink>
          )
      }
    },
    {
      key: 'Type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'Venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      align: 'center',
      sorter: true,
      render: function (_, row) {
        const value = row.venues?.count ?? 0
        return isTemplate ?
          renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, value, 'venues') :
          <TenantLink
            to={`/networks/wireless/${row.id}/network-details/venues`}
            children={value}
          />
      }
    },
    {
      key: 'clients',
      title: $t({ defaultMessage: 'Number of Clients' }),
      align: 'center',
      dataIndex: 'clients',
      sorter: true
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
          enableApiFilter={true}
        />
      </Card>
    </Loader>
  )
}
