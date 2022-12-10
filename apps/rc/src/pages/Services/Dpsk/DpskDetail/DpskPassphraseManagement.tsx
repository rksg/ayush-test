import { useState } from 'react'

import { Input }   from 'antd'
import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useDeleteDpskPassphraseListMutation,
  useDpskPassphraseListQuery
} from '@acx-ui/rc/services'
import { NewDpskPassphrase, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'
import { formatter }                        from '@acx-ui/utils'

import DpskPassphraseDrawer from './DpskPassphraseDrawer'


export default function DpskPassphraseManagement () {
  const { $t } = useIntl()
  const [ addPassphrasesDrawerVisible, setAddPassphrasesDrawerVisible ] = useState(false)
  const [ deletePassphrases ] = useDeleteDpskPassphraseListMutation()
  const params = useParams()
  const tableQuery = useTableQuery({
    useQuery: useDpskPassphraseListQuery,
    defaultPayload: {
      fields: ['check-all', 'id', 'passphrase', 'username',
        'vlanId', 'mac', 'numberOfDevices', 'createdDate', 'expirationDate']
    }
  })

  const columns: TableProps<NewDpskPassphrase>['columns'] = [
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
      sorter: false,
      render: function (data) {
        return <div onClick={(e)=> {e.stopPropagation()}}>
          <Input.Password
            readOnly
            bordered={false}
            value={data as string}
          />
        </div>
      }
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

  const rowActions: TableProps<NewDpskPassphrase>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Passphrase' }),
            entityValue: selectedRows[0].username,
            numOfEntities: selectedRows.length
          },
          onOk: () => {
            const passphraseIds = selectedRows.map(p => p.id)
            deletePassphrases({ params, payload: passphraseIds })
            clearSelection()
          }
        })
      }
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Passphrases' }),
      onClick: () => setAddPassphrasesDrawerVisible(true)
    }
  ]

  return (<>
    <DpskPassphraseDrawer
      visible={addPassphrasesDrawerVisible}
      setVisible={setAddPassphrasesDrawerVisible}
    />
    <Loader states={[tableQuery]}>
      <Table<NewDpskPassphrase>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
        rowKey='id'
      />
    </Loader>
  </>)
}
