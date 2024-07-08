/* eslint-disable max-len */

import { useEffect, useMemo, useState } from 'react'

import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Table, TableProps, Card, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useGetEnhancedPortalProfileListQuery,
  useGetEnhancedPortalTemplateListQuery,
  useGetNetworkTemplateListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery,
  useLazyGetClientsQuery
} from '@acx-ui/rc/services'
import {
  Network,
  WifiNetwork,
  NetworkType,
  NetworkTypeEnum,
  useConfigTemplate,
  useTableQuery,
  ConfigTemplateType,
  useConfigTemplateQueryFnSwitcher,
  TableResult,
  Portal
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { renderConfigTemplateDetailsComponent } from '../../configTemplates'


export function PortalInstancesTable (){

  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const isEnabledWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isEnabledTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const [ tableData, setTableData ] = useState<(Network|WifiNetwork)[]>([])
  const [ getClients ] = useLazyGetClientsQuery()
  const isNewDefined = isTemplate || isEnabledRbacService
  const isEnabledNonTemplateWifiRbac = !isTemplate && isEnabledWifiRbac
  const defaultPayload = {
    fields: ['id', 'name', 'wifiNetworkIds', 'displayLangCode'],
    filters: {
      id: [params.serviceId]
    },
    pageSize: 256
  }

  const { data } = useConfigTemplateQueryFnSwitcher<TableResult<Portal>>({
    useQueryFn: useGetEnhancedPortalProfileListQuery,
    useTemplateQueryFn: useGetEnhancedPortalTemplateListQuery,
    payload: { ...defaultPayload },
    enableRbac: isEnabledRbacService
  })

  const useQuery = useMemo(() => {
    const useNetworkQuery = isEnabledWifiRbac ? useWifiNetworkListQuery : useNetworkListQuery
    return isTemplate ? useGetNetworkTemplateListQuery : useNetworkQuery
  }, [isTemplate, isEnabledWifiRbac])

  const networkQueryFields = useMemo(() => {
    const isEnabledNetworkRbac = isTemplate ? isEnabledTemplateRbac : isEnabledNonTemplateWifiRbac
    return isEnabledNetworkRbac ?
      ['name', 'id', 'captiveType', 'nwSubType', 'venueApGroups.venueId'] :
      ['name', 'id', 'captiveType', 'nwSubType', 'venues', 'clients']
  }, [isTemplate,isEnabledTemplateRbac, isEnabledNonTemplateWifiRbac])

  const tableQuery = useTableQuery<WifiNetwork|Network>({
    useQuery,
    defaultPayload: {
      fields: networkQueryFields,
      filters: {
        id: isNewDefined ? data?.data?.[0]?.wifiNetworkIds?.length? data.data[0]?.wifiNetworkIds: ['none'] :
          (data?.data?.[0]?.networkIds?.length? data.data[0]?.networkIds: ['none'])
      }
    },
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    },
    enableRbac: isTemplate ? isEnabledTemplateRbac : isEnabledNonTemplateWifiRbac
  })

  useEffect(()=>{
    if(data){
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: {
          id: isNewDefined ? data?.data?.[0]?.wifiNetworkIds?.length? data.data[0]?.wifiNetworkIds: ['none'] :
            (data?.data?.[0]?.networkIds?.length? data.data[0]?.networkIds: ['none'])
        }
      })

    }
  },[data])

  useEffect(() => {
    const fetchClients = async (networkIds: string[]) => {
      const clientsResult = await getClients({
        payload: {
          fields: ['networkInformation','macAddress'],
          page: 1,
          pageSize: 256,
          filters: {
            'networkInformation.id': networkIds
          }
        }
      }).unwrap()
      const networkCounts: { [networkId: string]: number } = {}
      if (tableQuery.data?.data && clientsResult.data) {
        const clients = clientsResult.data
        clients.forEach(({ networkInformation }) => {
          if (networkInformation && networkInformation.id) {
            const networkId = networkInformation.id
            if (networkCounts[networkId]) {
              networkCounts[networkId] += 1
            } else {
              networkCounts[networkId] = 1
            }

          }
        })
        const newTableData = tableQuery.data.data.map((network) => {
          return {
            ...network,
            clients: networkCounts[network.id] ?? 0
          } as WifiNetwork
        })
        setTableData(newTableData)
      }
    }
    if (tableQuery.data) {
      if (isEnabledNonTemplateWifiRbac &&
        tableQuery.data?.data && tableQuery.data?.data.length > 0) {
        const networkIds = tableQuery.data.data.map(({ id }) => id)
        fetchClients(networkIds)
      }
      setTableData(tableQuery.data?.data)
    }

  }, [tableQuery.data])

  const columns: TableProps<WifiNetwork|Network>['columns'] = [
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
        networkType={NetworkTypeEnum.CAPTIVEPORTAL}
        row={row}
      />
    },
    {
      key: 'Venues',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: isEnabledNonTemplateWifiRbac ? ['venueApGroups', 'venueId'] : ['venues', 'count'],
      align: 'center',
      sorter: true,
      render: function (_, row) {
        const value = (isEnabledNonTemplateWifiRbac ?
          (row as WifiNetwork).venueApGroups?.length : row.venues?.count) ?? 0
        return isTemplate ?
          renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, value, 'venues') :
          <TenantLink
            to={`/networks/wireless/${row.id}/network-details/venues`}
            children={value}
          />
      }
    },
    ...(isTemplate ? []: [{
      key: 'clients',
      title: $t({ defaultMessage: 'Number of Clients' }),
      align: 'center' as AlignType,
      dataIndex: 'clients',
      sorter: true
    }])
  ]
  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount })}>
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={isEnabledNonTemplateWifiRbac ? tableData : tableQuery.data?.data}
          rowKey='id'
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Card>
    </Loader>
  )
}
