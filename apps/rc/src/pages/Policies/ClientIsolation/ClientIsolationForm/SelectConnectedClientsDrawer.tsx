import { Key, useState } from 'react'

import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Loader, Drawer, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useGetClientListQuery }                      from '@acx-ui/rc/services'
import {
  ClientList,
  getOsTypeIcon,
  useTableQuery
} from '@acx-ui/rc/utils'

export type SimpleClientRecord = Pick<ClientList, 'clientMac'>

export interface SelectConnectedClientsDrawerProps {
  incomingClientsMac?: string[];
  addClients: (clients: SimpleClientRecord[]) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
}

const defaultPayload = {
  searchString: '',
  searchTargetFields: ['clientMac', 'ipAddress', 'Username', 'hostname', 'osType'],
  fields: ['hostname','osType','clientMac','ipAddress','Username', 'venueName', 'apName']
}

export const IconContainer = styled.div`
  svg {
    height: 24px
  }
`
export function SelectConnectedClientsDrawer (props: SelectConnectedClientsDrawerProps) {
  const { $t } = useIntl()
  const { incomingClientsMac, addClients, visible, setVisible } = props
  const [ selectedClients, setSelectedClients ] = useState<ClientList[]>([])

  const tableQuery = useTableQuery({
    useQuery: useGetClientListQuery,
    defaultPayload,
    option: {
      skip: !visible
    }
  })

  const onClose = () => {
    setVisible(false)
  }

  const onSave = async () => {
    addClients(selectedClients.map(c => ({ clientMac: c.clientMac })))

    onClose()
  }

  const onRowChange = (_: Key[], selectedRows: ClientList[]) => {
    setSelectedClients(selectedRows)
  }

  const getCheckboxProps = (row: ClientList) => {
    return {
      disabled: incomingClientsMac?.includes(row.clientMac)
    }
  }

  const columns: TableProps<ClientList>['columns'] = [
    {
      key: 'osType',
      title: $t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      disable: true,
      sorter: true,
      render: (data) => {
        return <IconContainer>
          <Tooltip title={data}>
            { getOsTypeIcon(data as string) }
          </Tooltip>
        </IconContainer>
      }
    },
    {
      key: 'clientMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      sorter: true,
      disable: true,
      render: (data) => data || '--'
    },
    {
      key: 'ipAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      sorter: true,
      render: (data) => data || '--'
    },
    {
      key: 'Username',
      title: $t({ defaultMessage: 'Username' }),
      dataIndex: 'Username',
      sorter: true,
      render: (data) => data || '--'
    },
    {
      key: 'hostname',
      title: $t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
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

  const content = <>
    <p>{ $t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Select the Clients that the Client Isolation Allowlist Policy will be applied to.'
    }) }</p>
    <Loader states={[tableQuery]}>
      <Table<ClientList>
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
      />
    </Loader>
  </>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Select Connected Clients' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={({
            save: $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
      width={'850px'}
    />
  )
}
