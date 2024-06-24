import { useState } from 'react'

import { useIntl } from 'react-intl'

import { showActionModal, Table, TableProps }    from '@acx-ui/components'
import {
  ClientIsolationClient, defaultSort, sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { AddNewClientDrawer }                               from './AddNewClientDrawer'
import { ALLOW_LIST_MAX_COUNT }                             from './ClientIsolationSettingsForm'
import { SelectConnectedClientsDrawer, SimpleClientRecord } from './SelectConnectedClientsDrawer'

interface ClientIsolationAllowListTableProps {
  allowList?: ClientIsolationClient[];
  setAllowList?: (c: ClientIsolationClient[]) => void;
  showIpAddress: boolean;
}

interface AddNewClientDrawerProps {
  client: ClientIsolationClient | {}
  editMode: boolean
  visible: boolean
}

interface SelectConnectedClientDrawerProps {
  selectedClientsMac: string[]
  visible: boolean
}

export function ClientIsolationAllowListTable (props: ClientIsolationAllowListTableProps) {
  const { allowList = [], setAllowList = () => null, showIpAddress } = props
  const { $t } = useIntl()
  const [ selectedClientIndex, setSelectedClientIndex ] = useState(-1)
  // eslint-disable-next-line max-len
  const [ addNewClientDrawerProps, setAddNewClientDrawerProps ] = useState<AddNewClientDrawerProps>({
    client: {},
    editMode: false,
    visible: false
  })
  // eslint-disable-next-line max-len
  const [ selectConnectedClientDrawerProps, setSelectConnectedClientDrawerProps ] = useState<SelectConnectedClientDrawerProps>({
    selectedClientsMac: [],
    visible: false
  })

  const handleSelectConnectedClientAction = () => {
    setSelectConnectedClientDrawerProps({
      visible: true,
      selectedClientsMac: allowList.map(c => c.mac)
    })

    setAddNewClientDrawerVisible(false)
  }

  const handleAddNewClientAction = (client?: ClientIsolationClient) => {
    if (client) {
      const idx = allowList.findIndex((c: ClientIsolationClient) => c.mac === client.mac)
      setSelectedClientIndex(idx)
    }

    setAddNewClientDrawerProps({
      editMode: client ? true : false,
      visible: true,
      client: client ?? {}
    })

    setSelectConnectedClientDrawerVisible(false)
  }

  const handleSetClient = (data: ClientIsolationClient) => {
    const newAllowList: ClientIsolationClient[] = allowList ? allowList.slice() : []

    if (addNewClientDrawerProps.editMode) {
      newAllowList.splice(selectedClientIndex, 1, data)
    } else {
      newAllowList.push(data)
    }

    setAllowList(newAllowList)
  }

  const handleAddClients = (clients: SimpleClientRecord[]) => {
    const newClients: ClientIsolationClient[] = clients.map((c: SimpleClientRecord) => {
      return { mac: c.clientMac, ipAddress: c.ipAddress }
    })

    setAllowList([ ...allowList, ...newClients ])
  }

  const setAddNewClientDrawerVisible = (visible: boolean) => {
    setAddNewClientDrawerProps({
      ...addNewClientDrawerProps,
      visible
    })
  }

  const setSelectConnectedClientDrawerVisible = (visible: boolean) => {
    setSelectConnectedClientDrawerProps({
      ...selectConnectedClientDrawerProps,
      visible
    })
  }

  const columns: TableProps<ClientIsolationClient>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      key: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      show: showIpAddress,
      sorter: { compare: sortProp('ipAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      key: 'description',
      sorter: { compare: sortProp('description', defaultSort) }
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
        setVisible={setAddNewClientDrawerVisible}
        setClient={handleSetClient}
        isRuleUnique={(comingClient: ClientIsolationClient) => {
          return allowList.every((client: ClientIsolationClient, index: number) => {
            if (addNewClientDrawerProps.editMode && index === selectedClientIndex) {
              return true
            }
            return comingClient.mac !== client.mac
          })
        }}
      />
      <SelectConnectedClientsDrawer
        visible={selectConnectedClientDrawerProps.visible}
        incomingClientsMac={selectConnectedClientDrawerProps.selectedClientsMac}
        setVisible={setSelectConnectedClientDrawerVisible}
        addClients={handleAddClients}
      />
      <Table<ClientIsolationClient>
        columns={columns}
        dataSource={allowList}
        rowKey='mac'
        actions={filterByAccess([
          {
            label: $t({ defaultMessage: 'Select from Connected Clients' }),
            onClick: () => handleSelectConnectedClientAction(),
            disabled: allowList.length === ALLOW_LIST_MAX_COUNT
          },
          {
            label: $t({ defaultMessage: 'Add New Client' }),
            onClick: () => handleAddNewClientAction(),
            disabled: allowList.length === ALLOW_LIST_MAX_COUNT
          }
        ])}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'radio' }}
      />
    </>
  )
}
