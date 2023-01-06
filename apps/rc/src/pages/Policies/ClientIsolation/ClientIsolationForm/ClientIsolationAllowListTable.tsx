import { useState } from 'react'

import { useIntl } from 'react-intl'

import { showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  ClientIsolationClient
} from '@acx-ui/rc/utils'

import { AddNewClientDrawer } from './AddNewClientDrawer'

interface ClientIsolationClientsTableProps {
  allowList?: ClientIsolationClient[];
  setAllowList?: (c: ClientIsolationClient[]) => void;
}

export function ClientIsolationClientsTable (props: ClientIsolationClientsTableProps) {
  const { allowList = [], setAllowList = () => null } = props
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const [ drawerFormClientEntries, setDrawerFormClientEntries ] = useState<ClientIsolationClient>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ drawerVisible, setDrawerVisible ] = useState(false)

  const handleSelectConnectedClientAction = () => {

  }

  const handleAddNewClientAction = () => {
    setDrawerEditMode(false)
    setDrawerVisible(true)
    setDrawerFormClientEntries({} as ClientIsolationClient)
  }

  const handleSetClient = (data: ClientIsolationClient) => {
    const newAllowList: ClientIsolationClient[] = allowList ? allowList.slice() : []

    if (drawerEditMode) {
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
      setDrawerVisible(true)
      setDrawerEditMode(true)
      setDrawerFormClientEntries(selectedRows[0])
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
        editMode={drawerEditMode}
        client={(drawerFormClientEntries)}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        setClient={handleSetClient}
        isRuleUnique={(comingClient: ClientIsolationClient) => {
          return allowList.every((c: ClientIsolationClient) => comingClient.mac !== c.mac)
        }} />
      <Table<ClientIsolationClient>
        columns={columns}
        dataSource={allowList}
        rowKey='id'
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
