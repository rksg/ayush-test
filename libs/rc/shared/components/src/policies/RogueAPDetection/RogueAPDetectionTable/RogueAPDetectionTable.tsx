import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import {
  doProfileDelete,
  useDelRoguePoliciesMutation,
  useEnhancedRoguePoliciesQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  EnhancedRoguePolicyType,
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  Venue
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload }                                          from '@acx-ui/types'

import { SimpleListTooltip } from '../../../SimpleListTooltip'
import { useIsEdgeReady }    from '../../../useEdgeActions'
import { PROFILE_MAX_COUNT } from '../contentsMap'

const useDefaultVenuePayload = (): RequestPayload => {
  const isEdgeEnabled = useIsEdgeReady()

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
    'venueCount',
    'rules',
    'rule'
  ]
}

export function RogueAPDetectionTable () {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const DEFAULT_PROFILE = 'Default profile'
  const [ deleteFn ] = useDelRoguePoliciesMutation()

  const settingsId = 'policies-rogue-ap-detection-table'
  const tableQuery = useTableQuery({
    useQuery: useEnhancedRoguePoliciesQuery,
    defaultPayload,
    enableRbac,
    pagination: { settingsId }
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
      // eslint-disable-next-line max-len
      [{ fieldName: 'venueIds', fieldText: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }) }],
      // eslint-disable-next-line max-len
      async () => deleteFn({ params, payload: selectedRows.map(row => row.id), enableRbac }).then(callback)
    )
  }

  const rowActions: TableProps<EnhancedRoguePolicyType>['rowActions'] = [
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.ROGUE_AP_DETECTION, PolicyOperation.DELETE),
      scopeKey: getScopeKeyByPolicy(PolicyType.ROGUE_AP_DETECTION, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedItems =>
        selectedItems.length > 0 && !selectedItems.map(item => item.name).includes(DEFAULT_PROFILE)
      ),
      onClick: (rows, clearSelection) => {
        doDelete(rows, clearSelection)
      }
    },
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.ROGUE_AP_DETECTION, PolicyOperation.EDIT),
      scopeKey: getScopeKeyByPolicy(PolicyType.ROGUE_AP_DETECTION, PolicyOperation.EDIT),
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

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'Rogue AP Detection' })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE })}
            // eslint-disable-next-line max-len
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.ROGUE_AP_DETECTION, PolicyOperation.CREATE)}
            scopeKey={getScopeKeyByPolicy(PolicyType.ROGUE_AP_DETECTION, PolicyOperation.CREATE)}
          >
            <Button type='primary' disabled={tableQuery.data?.totalCount! >= PROFILE_MAX_COUNT}>
              {$t({ defaultMessage: 'Add Rogue AP Detection Policy' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<EnhancedRoguePolicyType>
          settingsId={settingsId}
          columns={useColumns(venueIds)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
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
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ROGUE_AP_DETECTION,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
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
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venueCount',
      filterable: venueFilterOptions,
      align: 'center',
      sorter: true,
      render: (_, row) => {
        if (!row.venueIds || row.venueIds.length === 0) return 0

        // eslint-disable-next-line max-len
        const tooltipItems = venueFilterOptions.filter(v => row.venueIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={row.venueIds.length} />
      }
    }
  ]

  return columns
}
