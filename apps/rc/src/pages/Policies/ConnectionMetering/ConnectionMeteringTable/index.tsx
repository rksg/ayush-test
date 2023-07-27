import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  showToast,
  Loader
} from '@acx-ui/components'
import { SimpleListTooltip }            from '@acx-ui/rc/components'
import {
  useDeleteConnectionMeteringMutation,
  useSearchConnectionMeteringListQuery,
  useVenuesListQuery,
  doProfileDelete,
  useGetQueriablePropertyConfigsQuery
} from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  ConnectionMetering,
  getPolicyDetailsLink,
  FILTER,
  SEARCH,
  PropertyConfigs,
  PropertyConfigQuery
} from '@acx-ui/rc/utils'
import {
  TenantLink,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import {
  DataConsumptionLabel
} from '../DataConsumptionHelper'
import { ConnectionMeteringLink } from '../LinkHelper'
import { RateLimitingTableCell }  from '../RateLimitingHelper'

function useColumns (venueMap: Map<string, string>, propertyMap: Map<string, PropertyConfigs>) {
  const { $t } = useIntl()

  const columns: TableProps<ConnectionMetering>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) => <ConnectionMeteringLink name={row.name} id={row.id}/>
    },
    {
      key: 'rateLimit',
      title: $t({ defaultMessage: 'Rate Limiting' }),
      dataIndex: 'rateLimit',
      sorter: false,
      render: (_, row) =>
        <RateLimitingTableCell uploadRate={row.uploadRate} downloadRate={row.downloadRate}/>
    },
    {
      key: 'dataConsumption',
      title: $t({ defaultMessage: 'Data Consumption' }),
      dataIndex: 'dataConsumption',
      render: (_, row) => {
        return <DataConsumptionLabel {...{ ...row }}/>
      }
    },
    {
      key: 'unitCount',
      title: $t({ defaultMessage: 'Units' }),
      dataIndex: 'unitCount',
      sorter: true,
      align: 'center',
      render: (_, row) => {
        const tooltipItems = row.personas?.filter(v=>v.identityId && v.primary).map(v=>v.name)
        return <SimpleListTooltip items={tooltipItems ?? []} displayText={row.unitCount ?? 0} />
      }
    },
    {
      key: 'venueCount',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueCount',
      sorter: true,
      align: 'center',
      render: (_, row) => {
        const groupIds = new Set(row.personas?.map(v=>v.groupId))
        const venues: string[] = []
        groupIds.forEach(id => {
          const venueName = propertyMap.get(id)?.venueName
          if (venueName) {
            venues.push(venueName)
          }
        })
        return <SimpleListTooltip items={venues ?? []} displayText={row.venueCount ?? 0} />
      }
    },
    {
      key: 'venue',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venue',
      show: false,
      filterable: Array.from(venueMap, (entry) => {
        return { key: entry[0], value: entry[1] }
      }),
      filterMultiple: false
    }
  ]

  return columns
}


export default function ConnectionMeteringTable () {
  const { $t } = useIntl()
  const tenantBasePath = useTenantLink('')
  const navigate = useNavigate()
  const [venueMap, setVenueMap] = useState(new Map())
  const [propertyMap, setPropertyMap] = useState(new Map<string, PropertyConfigs>())

  const { tenantId } = useParams()
  const venueListPayload = {
    fields: [
      'id',
      'name'
    ],
    filters: { id: [] }
  }

  const venues = useVenuesListQuery({ params: { tenantId }, payload: { ...venueListPayload } })
  const propertyConfigs = useGetQueriablePropertyConfigsQuery({ payload: {
    sortOrder: 'ASC',
    sortField: 'venueName',
    page: 1,
    pageSize: 2147483647
  } as PropertyConfigQuery })
  const [deleteConnectionMetering,
    { isLoading: isDeleteConnectionMetering }
  ] = useDeleteConnectionMeteringMutation()
  const tableQuery = useTableQuery( {
    useQuery: useSearchConnectionMeteringListQuery,
    defaultPayload: { keyword: '' }
  })

  useEffect(()=>{
    if (venues.isLoading) return
    const map = new Map()
    // FIXME: After the property id does not present in UUID format, I will remove .replace()
    venues.data?.data.forEach(venue=> map.set(venue?.id.replaceAll('-', ''), venue?.name))
    setVenueMap(map)
  }, [venues])

  useEffect(()=> {
    if (propertyConfigs.isLoading) return
    const map = new Map()
    propertyConfigs.data?.data.filter(config => config.personaGroupId)
      .forEach(config => map.set(config.personaGroupId, config))
    setPropertyMap(map)
  }, [propertyConfigs])

  const rowActions: TableProps<ConnectionMetering>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([data],clearSelection) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.CONNECTION_METERING,
            oper: PolicyOperation.EDIT,
            policyId: data.id
          })
        })
        clearSelection()
      },
      disabled: (selectedItems => selectedItems.length > 1)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedItems, clearSelection) => {
        doProfileDelete(selectedItems,
          $t({ defaultMessage: 'Profile' }),
          selectedItems[0].name,
          [{ fieldName: 'unitCount', fieldText: $t({ defaultMessage: 'Unit' }) }],
          async () => {
            const id = selectedItems[0].id
            const name = selectedItems[0].name
            deleteConnectionMetering({ params: { id } })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  content: $t({ defaultMessage: 'Data Usage Metering {name} was deleted' },
                    { name })
                })
                clearSelection()
              }).catch((e) => {
                // eslint-disable-next-line no-console
                console.log(e)
              })
          })
      }
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      keyword: customSearch?.searchString ?? '',
      venueIds: Array.isArray(customFilters?.venue) ?
        [customFilters?.venue[0]]: undefined
    }
    tableQuery.setPayload(payload)
  }

  return (
    <Loader
      states={[
        tableQuery,
        { isLoading: false, isFetching: venues.isLoading && isDeleteConnectionMetering }
      ]}
    >
      <PageHeader
        breadcrumb={
          [
            { text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true) }
          ]}
        title={$t({ defaultMessage: 'Data Usage Metering' })}
        extra={filterByAccess([
          <TenantLink
            to={getPolicyRoutePath({
              type: PolicyType.CONNECTION_METERING,
              oper: PolicyOperation.CREATE
            })}
          >
            <Button type='primary'>
              { $t({ defaultMessage: 'Add Data Usage Metering Profile' }) }
            </Button>
          </TenantLink>
        ])}
      />
      <Table
        enableApiFilter
        columns={useColumns(venueMap, propertyMap)}
        rowActions={rowActions}
        onFilterChange={handleFilterChange}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowSelection={{ type: 'radio' }}
      />
    </Loader>
  )
}