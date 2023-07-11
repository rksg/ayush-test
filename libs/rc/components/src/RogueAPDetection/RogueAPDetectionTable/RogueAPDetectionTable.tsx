import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }      from '@acx-ui/feature-toggle'
import {
  doProfileDelete,
  useDelRoguePoliciesMutation,
  useEnhancedRoguePoliciesQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  EnhancedRoguePolicyType,
  Venue,
  RequestPayload
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

import { SimpleListTooltip } from '../../SimpleListTooltip'
import { PROFILE_MAX_COUNT } from '../contentsMap'

const useDefaultVenuePayload = (): RequestPayload => {
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)

  return {
    fields: [
      'check-all',
      'name',
      'description',
      'city',
      'country',
      'networks',
      'aggregatedApStatus',
      'switches',
      'switchClients',
      'clients',
      ...(isEdgeEnabled ? ['edges'] : []),
      'cog',
      'latitude',
      'longitude',
      'status',
      'id'
    ],
    searchTargetFields: ['name', 'description'],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC',
    page: 1,
    pageSize: 2048
  }
}

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'description',
    'numOfRules',
    'venueIds',
    'venueCount'
  ]
}

export function RogueAPDetectionTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const DEFAULT_PROFILE = 'Default profile'
  const [ deleteFn ] = useDelRoguePoliciesMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const tableQuery = useTableQuery({
    useQuery: useEnhancedRoguePoliciesQuery,
    defaultPayload
  })

  const [venueIds, setVenueIds] = useState([] as string[])

  useEffect(() => {
    if (tableQuery.data) {
      let unionVenueIds = [] as string[]
      tableQuery.data.data.map(rogueAp => {
        if (rogueAp.venueIds) {
          unionVenueIds.push(...rogueAp.venueIds)
        }
      })
      setVenueIds([...new Set(unionVenueIds)])
    }
  }, [tableQuery.data])

  const doDelete = (selectedRows: EnhancedRoguePolicyType[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [{ fieldName: 'venueIds', fieldText: $t({ defaultMessage: 'Venue' }) }],
      async () => deleteFn({ params, payload: selectedRows.map(row => row.id) }).then(callback)
    )
  }

  const rowActions: TableProps<EnhancedRoguePolicyType>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedItems =>
        selectedItems.length > 0 && !selectedItems.map(item => item.name).includes(DEFAULT_PROFILE)
      ),
      onClick: (rows, clearSelection) => {
        doDelete(rows, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedItems =>
        selectedItems.length === 1 && selectedItems[0].name !== DEFAULT_PROFILE
      ),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.ROGUE_AP_DETECTION,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t({
            defaultMessage: 'Rogue AP Detection'
          })
        }
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ] : [{
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE })}>
            <Button type='primary' disabled={tableQuery.data?.totalCount! >= PROFILE_MAX_COUNT}>
              {$t({ defaultMessage: 'Add Rogue AP Detection Policy' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<EnhancedRoguePolicyType>
          settingsId='policies-rogue-ap-detection-table'
          columns={useColumns(venueIds)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'checkbox' }}
        />
      </Loader>
    </>
  )
}

function useColumns (venueIds: string[]) {
  const { $t } = useIntl()

  const [venueFilterOptions, setVenueFilterOptions] = useState(
    [] as { key: string, value: string }[]
  )

  const venueTableQuery = useTableQuery<Venue>({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      ...useDefaultVenuePayload()
    }
  })

  useEffect(() => {

    venueTableQuery.setPayload({
      ...defaultPayload,
      filters: {
        id: [...venueIds]
      }
    })

    if (venueTableQuery.data && venueIds.length) {
      setVenueFilterOptions(
        [...venueTableQuery.data.data.map(
          (venue) => {
            return { key: venue.id, value: venue.name }
          })]
      )
    }
  }, [venueTableQuery.data, venueIds])

  const columns: TableProps<EnhancedRoguePolicyType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ROGUE_AP_DETECTION,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'numOfRules',
      title: $t({ defaultMessage: 'Classification Rules' }),
      dataIndex: 'numOfRules',
      align: 'center',
      sorter: true
    },
    {
      key: 'venueCount',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueCount',
      filterable: venueFilterOptions,
      align: 'center',
      sorter: true,
      render: (data, row) => {
        if (!row.venueIds || row.venueIds.length === 0) return 0

        // eslint-disable-next-line max-len
        const tooltipItems = venueFilterOptions.filter(v => row.venueIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={row.venueIds.length} />
      }
    }
  ]

  return columns
}
