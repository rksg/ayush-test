import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import { useDpskPassphraseListQuery }                 from '@acx-ui/rc/services'
import { DpskPassphrase, useTableQuery }              from '@acx-ui/rc/utils'
import { formatter }                                  from '@acx-ui/utils'


export default function DpskPassphraseManagement () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useDpskPassphraseListQuery,
    defaultPayload: {
      fields: ['check-all', 'id', 'passphrase', 'username',
        'vlanId', 'mac', 'numberOfDevices', 'createdDate', 'expirationDate']
    }
  })

  const handleAddPassphrasesAction = () => {
  }

  const columns: TableProps<DpskPassphrase>['columns'] = [
    {
      key: 'createdDate',
      title: $t({ defaultMessage: 'Passphrase Created' }),
      dataIndex: 'createdDate',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data) {
        return formatter('dateTimeFormat')(data)
      }
    },
    {
      key: 'username',
      title: $t({ defaultMessage: 'User Name' }),
      dataIndex: 'username',
      sorter: true
    },
    {
      key: 'numberOfDevices',
      title: $t({ defaultMessage: 'No. of Devices' }),
      dataIndex: 'numberOfDevices',
      sorter: false
    },
    {
      key: 'mac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      sorter: false
    },
    {
      key: 'passphrase',
      title: $t({ defaultMessage: 'Passphrase' }),
      dataIndex: 'passphrase',
      sorter: false
    },
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlanId',
      sorter: false
    },
    {
      key: 'expirationDate',
      title: $t({ defaultMessage: 'Expires' }),
      dataIndex: 'expirationDate',
      sorter: true,
      render: function (data) {
        return formatter('dateTimeFormat')(data)
      }
    }
  ]

  const rowActions: TableProps<DpskPassphrase>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows: DpskPassphrase[], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Passphrase' }),
            numOfEntities: selectedRows.length
          },
          onOk: () => {
            // TODO: API is not ready
            clearSelection()
          }
        })
      }
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Passphrases' }),
      onClick: handleAddPassphrasesAction
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table<DpskPassphrase>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
        rowKey='id'
      />
    </Loader>
  )
}
