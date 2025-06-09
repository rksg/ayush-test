import { Key } from 'react'

import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Loader, Table, TableProps, Tooltip }       from '@acx-ui/components'
import { useGetClientsQuery }                       from '@acx-ui/rc/services'
import { ClientInfo, getOsTypeIcon, useTableQuery } from '@acx-ui/rc/utils'


export const OSIconContainer = styled.div`
  svg {
    height: 24px
  }
`

export interface SelectConnectedDevicesProps {
  onRowChange: (_: Key[], selectedRows: ClientInfo[]) => void,
  getCheckboxProps?: (row: ClientInfo) => object
}

const defaultPayload = {
  searchString: '',
  searchTargetFields: ['macAddress', 'ipAddress', 'username', 'hostname', 'osType'],
  fields: ['macAddress','ipAddress','username', 'hostname', 'osType',
    'venueInformation.name', 'apInformation.name']
}

export function SelectConnectedClientsTable (props: SelectConnectedDevicesProps) {
  const { $t } = useIntl()
  const { onRowChange, getCheckboxProps } = props

  const tableQuery = useTableQuery({
    useQuery: useGetClientsQuery,
    defaultPayload
  })

  const columns: TableProps<ClientInfo>['columns'] = [
    {
      key: 'osType',
      title: $t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      searchable: true,
      disable: true,
      sorter: true,
      render: (_, { osType }) => {
        return <OSIconContainer>
          <Tooltip title={osType}>
            { getOsTypeIcon(osType) }
          </Tooltip>
        </OSIconContainer>
      }
    },
    {
      key: 'macAddress',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      searchable: true,
      sorter: true,
      disable: true,
      render: (_, { macAddress }) => macAddress || '--'
    },
    {
      key: 'ipAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      searchable: true,
      sorter: true,
      render: (_, { ipAddress }) => ipAddress || '--'
    },
    {
      key: 'username',
      title: $t({ defaultMessage: 'Username' }),
      dataIndex: 'username',
      searchable: true,
      sorter: true,
      render: (_, { username }) => username || '--'
    },
    {
      key: 'hostname',
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      searchable: true,
      sorter: true
    },
    {
      key: 'venueInformation.name',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueInformation.name',
      render: (_, { venueInformation }) => venueInformation?.name ?? ''
    },
    {
      key: 'apInformation.name',
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: 'apInformation.name',
      render: (_, { apInformation }) => apInformation?.name ?? ''
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table<ClientInfo>
        enableApiFilter
        columns={columns}
        dataSource={tableQuery.data?.data}
        rowKey='macAddress'
        rowSelection={{
          type: 'checkbox',
          onChange: onRowChange,
          getCheckboxProps
        }}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
      />
    </Loader>
  )
}
