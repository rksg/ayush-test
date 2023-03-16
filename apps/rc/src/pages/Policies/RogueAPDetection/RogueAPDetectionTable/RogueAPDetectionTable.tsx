import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import {
  useDelRoguePolicyMutation,
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

const useDefaultVenuePayload = (): RequestPayload => {
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

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
    sortOrder: 'ASC'
  }
}

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'description',
    'numOfRules',
    'venueIds'
  ]
}

export default function RogueAPDetectionTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const DEFAULT_PROFILE = 'Default profile'
  const [ deleteFn ] = useDelRoguePolicyMutation()

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

  const rowActions: TableProps<EnhancedRoguePolicyType>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, name, venueIds }], clearSelection) => {
        if (Number(venueIds.length) !== 0 || name === DEFAULT_PROFILE) {
          showActionModal({
            type: 'error',
            content: $t({
              // eslint-disable-next-line max-len
              defaultMessage: 'This policy has been applied in network or it is default profile policy.'
            })
          })
          clearSelection()
        } else {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Policy' }),
              entityValue: name
            },
            onOk: () => {
              deleteFn({ params: { ...params, policyId: id } }).then(clearSelection)
            }
          })
        }
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
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
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE })}>
            <Button type='primary'>
              {$t({ defaultMessage: 'Add Rogue AP Detection Policy' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<EnhancedRoguePolicyType>
          columns={useColumns(venueIds)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
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
      dataIndex: 'description'
    },
    {
      key: 'numOfRules',
      title: $t({ defaultMessage: 'Classification Rules' }),
      dataIndex: 'numOfRules',
      align: 'center'
    },
    {
      key: 'venueIds',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueIds',
      filterable: venueFilterOptions,
      align: 'center',
      render: (data, row) => row.venueIds.length
    }
  ]

  return columns
}
