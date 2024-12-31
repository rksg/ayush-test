import { useIntl } from 'react-intl'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { useSwitchPortProfileAppliedListQuery, useVenuesListQuery }              from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  SwitchPortProfilesAppliedTargets,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import SwitchPortProfileWidget from './SwitchPortProfileWidget'

export default function SwitchPortProfileDetail () {
  const { $t } = useIntl()
  const { portProfileId } = useParams()

  const portProfileRoute = getPolicyListRoutePath(true) + '/portProfile/switch/profiles'
  const settingsId = 'switch-port-profile-detail'

  const defaultPayload = {
    fields: [ 'id' ],
    pagination: { settingsId }
  }

  const { venueFilterOptions } = useVenuesListQuery({
    payload: {
      fields: ['name', 'country', 'latitude', 'longitude', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data
        .map(v => ({ key: v.id, value: v.name }))
        .sort((a, b) => a.value.localeCompare(b.value)) || true
    })
  })

  const tableQuery = useTableQuery({
    useQuery: useSwitchPortProfileAppliedListQuery,
    defaultPayload
  })

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<SwitchPortProfilesAppliedTargets>['columns'] = [
      {
        key: 'switchName',
        title: $t({ defaultMessage: 'Switch' }),
        dataIndex: 'switchName',
        searchable: true,
        sorter: true,
        render: function (_, row, __, highlightFn) {
          return (
            <TenantLink
              to={`/devices/switch/${row.switchId}/${row.serialNumber}/details/overview`}
              style={{ lineHeight: '20px' }}
            >
              {highlightFn(row.switchName)}
            </TenantLink>
          )
        }
      },
      {
        key: 'model',
        title: $t({ defaultMessage: 'Model' }),
        dataIndex: 'model',
        filterable: true,
        sorter: true
      },
      {
        key: 'venueName',
        title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        dataIndex: 'venueName',
        filterable: venueFilterOptions,
        filterKey: 'venueId',
        sorter: true,
        render: function (_, row) {
          return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}</TenantLink>
        }
      }
    ]
    return columns
  }


  const getConfigureButton = () => {
    return (
      <TenantLink to={`/policies/portProfile/switch/profiles/${portProfileId}/edit`}>
        <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
      </TenantLink>
    )
  }

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Port Profile' }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Port Profiles' }),
            link: portProfileRoute
          }
        ]}

        extra={getConfigureButton()}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SwitchPortProfileWidget />
        </GridCol>

        <GridCol col={{ span: 24 }}>
          <Card>
            <Card.Title style={{ marginTop: '16px', marginBottom: '16px' }}>
              {$t({ defaultMessage: 'Instances({count})' },
                { count: tableQuery.data?.data?.length })}</Card.Title>
            <Loader states={[tableQuery]}>
              <Table<SwitchPortProfilesAppliedTargets>
                settingsId={settingsId}
                columns={useColumns()}
                dataSource={tableQuery.data?.data}
                pagination={tableQuery.pagination}
                onChange={tableQuery.handleTableChange}
                rowKey='switchId'
                onFilterChange={tableQuery.handleFilterChange}
              />
            </Loader>
          </Card>
        </GridCol>
      </GridRow>
    </>
  )
}
