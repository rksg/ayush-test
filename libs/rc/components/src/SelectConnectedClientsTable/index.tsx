import { Key } from 'react'

import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Loader, Table, TableProps, Tooltip }       from '@acx-ui/components'
import { useGetClientListQuery }                    from '@acx-ui/rc/services'
import { ClientList, getOsTypeIcon, useTableQuery } from '@acx-ui/rc/utils'


export const OSIconContainer = styled.div`
  svg {
    height: 24px
  }
`

export interface SelectConnectedDevicesProps {
  onRowChange: (_: Key[], selectedRows: ClientList[]) => void,
  getCheckboxProps?: (row: ClientList) => object
}

const defaultPayload = {
  searchString: '',
  searchTargetFields: ['clientMac', 'ipAddress', 'Username', 'hostname', 'osType'],
  fields: ['hostname','osType','clientMac','ipAddress','Username', 'venueName', 'apName']
}

export function SelectConnectedClientsTable (props: SelectConnectedDevicesProps) {
  const { $t } = useIntl()
  const { onRowChange, getCheckboxProps } = props

  const tableQuery = useTableQuery({
    useQuery: useGetClientListQuery,
    defaultPayload
  })

  const columns: TableProps<ClientList>['columns'] = [
    {
      key: 'osType',
      title: $t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      searchable: true,
      disable: true,
      sorter: true,
      render: (data) => {
        return <OSIconContainer>
          <Tooltip title={data}>
            { getOsTypeIcon(data as string) }
          </Tooltip>
        </OSIconContainer>
      }
    },
    {
      key: 'clientMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      searchable: true,
      sorter: true,
      disable: true,
      render: (data) => data || '--'
    },
    {
      key: 'ipAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      searchable: true,
      sorter: true,
      render: (data) => data || '--'
    },
    {
      key: 'Username',
      title: $t({ defaultMessage: 'Username' }),
      dataIndex: 'Username',
      searchable: true,
      sorter: true,
      render: (data) => data || '--'
    },
    {
      key: 'hostname',
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      searchable: true,
      sorter: true
    },
    {
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName'
    },
    {
      key: 'apName',
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: 'apName'
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table<ClientList>
        enableApiFilter
        columns={columns}
        dataSource={tableQuery.data?.data}
        rowKey='clientMac'
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
