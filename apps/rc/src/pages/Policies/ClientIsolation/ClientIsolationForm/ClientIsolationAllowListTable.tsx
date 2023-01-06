import { useState } from 'react'

import { useIntl } from 'react-intl'

import { showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  ClientIsolationClient
} from '@acx-ui/rc/utils'

import { AddNewClientDrawer }                               from './AddNewClientDrawer'
import { SelectConnectedClientsDrawer, SimpleClientRecord } from './SelectConnectedClientsDrawer'

interface ClientIsolationClientsTableProps {
  allowList?: ClientIsolationClient[];
  setAllowList?: (c: ClientIsolationClient[]) => void;
}

export function ClientIsolationAllowListTable (props: ClientIsolationClientsTableProps) {
  const { allowList = [], setAllowList = () => null } = props
  const { $t } = useIntl()
  const [ addNewClientDrawerProps, setAddNewClientDrawerProps ] = useState({
    client: {},
    editMode: false,
    visible: false
  })
  const [ selectConnectedClientDrawerProps, setSelectConnectedClientDrawerProps ] = useState<{
    selectedClientsMac: string[],
    visible: boolean
  }>({
    selectedClientsMac: [],
    visible: false
  })

  const handleSelectConnectedClientAction = () => {
    setSelectConnectedClientDrawerProps({
      visible: true,
      selectedClientsMac: allowList.map(c => c.mac)
    })
  }

  const handleAddNewClientAction = (client?: ClientIsolationClient) => {
    setAddNewClientDrawerProps({
      editMode: client ? true : false,
      visible: true,
      client: client ?? {}
    })
  }

  const handleSetClient = (data: ClientIsolationClient) => {
    const newAllowList: ClientIsolationClient[] = allowList ? allowList.slice() : []

    if (addNewClientDrawerProps.editMode) {
      const targetIdx = newAllowList.findIndex((c: ClientIsolationClient) => c.mac === data.mac)
      newAllowList.splice(targetIdx, 1, data)
    } else {
      newAllowList.push(data)
    }

    setAllowList(newAllowList)
  }

  const columns: TableProps<ClientIsolationClient>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      key: 'mac',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      key: 'description',
      sorter: false
    }
  ]

  const rowActions: TableProps<ClientIsolationClient>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      handleAddNewClientAction(selectedRows[0])
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows: ClientIsolationClient[], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Client' }),
          entityValue: selectedRows[0].mac
        },
        onOk: () => {
          const newAllowList = allowList.filter((c: ClientIsolationClient) => {
            return selectedRows[0].mac !== c.mac
          })

          setAllowList(newAllowList)
          clearSelection()
        }
      })
    }
  }]

  return (
    <>
      <AddNewClientDrawer
        editMode={addNewClientDrawerProps.editMode}
        client={addNewClientDrawerProps.client as ClientIsolationClient}
        visible={addNewClientDrawerProps.visible}
        setVisible={(visible: boolean) => {
          setAddNewClientDrawerProps({
            ...addNewClientDrawerProps,
            visible
          })
        }}
        setClient={handleSetClient}
        isRuleUnique={(comingClient: ClientIsolationClient) => {
          return allowList.every((c: ClientIsolationClient) => comingClient.mac !== c.mac)
        }}
      />
      <SelectConnectedClientsDrawer
        visible={selectConnectedClientDrawerProps.visible}
        incomingClientsMac={selectConnectedClientDrawerProps.selectedClientsMac}
        setVisible={(visible: boolean) => {
          setSelectConnectedClientDrawerProps({
            ...selectConnectedClientDrawerProps,
            visible
          })
        }}
        addClients={(clients: SimpleClientRecord[]) => {
          setAllowList(clients.map(c => ({ mac: c.clientMac, ipAddress: c.ipAddress })))
        }}
      />
      <Table<ClientIsolationClient>
        columns={columns}
        dataSource={allowList}
        rowKey='mac'
        actions={[
          {
            label: $t({ defaultMessage: 'Select from Connected Clients' }),
            onClick: handleSelectConnectedClientAction
          },
          {
            label: $t({ defaultMessage: 'Add New Client' }),
            onClick: handleAddNewClientAction
          }
        ]}
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
      />
    </>
  )
}
