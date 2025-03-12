import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip } from '@acx-ui/components'
import {
  defaultSort,
  AccessSwitch,
  Persona, sortProp,
  TableQuery,
  PropertyUnitLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export interface PersonaTableProps extends Omit<TableProps<Persona>, 'columns'>{
  tableQuery: TableQuery<Persona,
  { keyword: string, groupId: string },
  unknown>
  switchInfo?: AccessSwitch[]
  venueId: string
}

export const AssignedSegmentsTable = (props: PersonaTableProps) => {

  const { $t } = useIntl()

  const personaListTableQuery = props.tableQuery
  const switchNameMapping = props.switchInfo?.reduce((acc, item) => ({
    ...acc,
    [item.id]: item.name
  }), {}) ?? {}

  const columns: TableProps<Persona>['columns'] = [
    {
      title: $t({ defaultMessage: 'Segment No.' }),
      key: 'vni',
      dataIndex: 'vni',
      sorter: { compare: sortProp('vni', defaultSort) },
      fixed: 'left' as const
    },
    {
      title: $t({ defaultMessage: 'Identity' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      render: (_, row) => {
        return <TenantLink
          to={`users/identity-management/identity-group/${row.groupId}/identity/${row.id}`}
        >
          {row.name ?? row.id}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Devices' }),
      key: 'deviceCount',
      dataIndex: 'deviceCount'
    },
    {
      title: $t({ defaultMessage: 'AP' }),
      key: 'ethernetPorts[0].name',
      dataIndex: 'ethernetPorts[0].name',
      render: (_, row) => {
        return row?.ethernetPorts?.[0]?.name
      }
    },
    {
      title: $t({ defaultMessage: 'Switch' }),
      key: 'switches',
      dataIndex: 'switches',
      render: (_, row) => {
        const switchItem = row?.switches
          ?.find(item => Object.keys(switchNameMapping).includes(item.macAddress))
        return switchNameMapping[switchItem?.macAddress as keyof typeof switchNameMapping]
          || row.switches?.map(item => item.macAddress).join(', ')
      }
    },
    {
      title: () => (
        <>
          <span className='text-align'>{$t({ defaultMessage: 'Assigned Port' })}</span>
          <Tooltip.Question
            title={$t(
              { defaultMessage: 'To assign AP ports for a specific unit/identity, '
                + 'please go to the {navigateToVenues} and configure a unit.' },
              {
                navigateToVenues: <PropertyUnitLink
                  venueId={props.venueId}
                  unitId='0'
                  name={$t({ defaultMessage: '<VenueSingular></VenueSingular>/Property Units' })} />
              }
            )}
            placement='bottom'
            iconStyle={UI.QuestionIconStyle}/>
        </>
      ),
      key: 'ethernetPorts[0].portIndex',
      dataIndex: 'ethernetPorts[0].portIndex',
      render: (_, row) => {
        return row.ethernetPorts?.map(port => `LAN ${port.portIndex}`).join(', ')
      }
    }
  ]

  return (
    <Loader>
      <Table
        columns={columns}
        rowKey='vni'
        dataSource={personaListTableQuery.data?.data}
        pagination={personaListTableQuery.pagination}
        onChange={personaListTableQuery.handleTableChange}
      />
    </Loader>
  )
}
