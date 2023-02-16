import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip }       from '@acx-ui/components'
import { useGetProfilesQuery }                      from '@acx-ui/rc/services'
import { SwitchProfileModel, usePollingTableQuery } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }               from '@acx-ui/react-router-dom'

export function ProfilesTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToProfiles = useTenantLink('/networks/wired/profiles')

  const tableQuery = usePollingTableQuery<SwitchProfileModel>({
    useQuery: useGetProfilesQuery,
    defaultPayload: {}
  })

  const columns: TableProps<SwitchProfileModel>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Profile Name' }),
    dataIndex: 'name',
    sorter: true
  },{
    key: 'profileType',
    title: $t({ defaultMessage: 'Type' }),
    dataIndex: 'profileType',
    sorter: true
  },{
    key: 'venueCount',
    title: $t({ defaultMessage: 'Venues' }),
    dataIndex: 'venueCount',
    sorter: true,
    render: function (data, row) {
      if (row.venues) {
        return <Tooltip
          title={row.venues.join('\n')}>
          {row.venues.length}
        </Tooltip>
      }
      return 0
    }
  }]

  const rowActions: TableProps<SwitchProfileModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate(`${selectedRows[0].id}/edit`, { replace: false })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: true, //Waiting for support
      onClick: () => {}
    }
  ]

  return (
    <> <Loader states={[
      tableQuery
    ]}>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
        actions={[{
          label: $t({ defaultMessage: 'Add Regular Profile' }),
          onClick: () => navigate(`${linkToProfiles.pathname}/add`)
        },
        {
          label: $t({ defaultMessage: 'Add CLI Profile' }),
          disabled: true //Waiting for support
          // onClick: () => {}
        }]}
      />
    </Loader></>
  )
}
