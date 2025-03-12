
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip } from '@acx-ui/components'
import { CountAndNamesTooltip }               from '@acx-ui/rc/components'
import { usePortProfilesListBySwitchIdQuery } from '@acx-ui/rc/services'
import {
  SwitchPortProfiles,
  SwitchViewModel,
  useTableQuery,
  vlanPortsParser
} from '@acx-ui/rc/utils'

export default function SwitchOverviewPortProfiles (props: {
    switchDetail?: SwitchViewModel
}) {
  const { switchDetail } = props
  const settingsId = 'switch-overview-port-profile-table'

  const defaultPayload = {
    fields: [
      'id'
    ]
  }

  const tableQuery = useTableQuery<SwitchPortProfiles>({
    useQuery: usePortProfilesListBySwitchIdQuery,
    apiParams: {
      venueId: switchDetail?.venueId || '',
      switchId: switchDetail?.id || ''
    },
    defaultPayload,
    pagination: { settingsId },
    sorter: {
      sortField: 'id',
      sortOrder: 'ASC'
    }
  })

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<SwitchPortProfiles>['columns'] = [
      {
        key: 'name',
        title: $t({ defaultMessage: 'Name' }),
        dataIndex: 'name',
        sorter: true,
        defaultSortOrder: 'ascend'
      },
      {
        key: 'type',
        title: $t({ defaultMessage: 'Type' }),
        dataIndex: 'type'
      },
      {
        key: 'untaggedVlan',
        title: $t({ defaultMessage: 'Untagged VLAN' }),
        dataIndex: 'untaggedVlan'
      },
      {
        key: 'taggedVlans',
        title: $t({ defaultMessage: 'Tagged VLAN' }),
        dataIndex: 'taggedVlans',
        render: (_, row) => {
          return <Tooltip
            // eslint-disable-next-line max-len
            title={row.taggedVlans ? vlanPortsParser(row.taggedVlans?.join(' ') || '', 200, $t({ defaultMessage: 'Tagged VLANs' })) : ''}
            dottedUnderline={row.taggedVlans?.length ? true : false}
            placement='bottom'
          >
            {row.taggedVlans ? row.taggedVlans.length : 0}
          </Tooltip>
        }
      },
      {
        key: 'macOuis',
        title: $t({ defaultMessage: 'MAC OUI' }),
        dataIndex: 'macOuis',
        render: (_, row) => {
          return <CountAndNamesTooltip
            data={{ count: row.macOuis?.length ||
              0, names: row.macOuis?.map(item=> item.oui) || [] }}
            maxShow={25}
          />
        }
      },
      {
        key: 'lldpTlvs',
        title: $t({ defaultMessage: 'LLDP TLV' }),
        dataIndex: 'lldpTlvs',
        render: (_, row) => {
          return <CountAndNamesTooltip
            data={{ count: row.lldpTlvs?.length ||
              0, names: row.lldpTlvs?.map(item=> item.systemName) || [] }}
            maxShow={25}
          />
        }
      },
      {
        key: 'dot1x',
        title: $t({ defaultMessage: '802.1x' }),
        dataIndex: 'dot1x',
        show: false,
        render: function (_, row) {
          return row.dot1x ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
        }
      },
      {
        key: 'macAuth',
        title: $t({ defaultMessage: 'MAC Auth' }),
        dataIndex: 'macAuth',
        show: false,
        render: function (_, row) {
          return row.macAuth ?
            $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
        }
      }
    ]
    return columns
  }

  return (
    <Loader states={[tableQuery]}>
      <Table<SwitchPortProfiles>
        settingsId={settingsId}
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}
