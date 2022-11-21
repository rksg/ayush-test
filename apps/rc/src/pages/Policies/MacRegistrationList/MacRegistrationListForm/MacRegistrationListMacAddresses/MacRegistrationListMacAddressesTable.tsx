import { useContext, useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { showActionModal, Table, TableProps }                    from '@acx-ui/components'
import { useDeleteMacRegListMutation, useMacRegistrationsQuery } from '@acx-ui/rc/services'
import { MacRegistration, useMacTableQuery }                     from '@acx-ui/rc/utils'
import { useNavigate, useParams }                                from '@acx-ui/react-router-dom'

import MacRegistrationListFormContext from '../MacRegistrationListFormContext'

function useColumns () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data } = useContext(MacRegistrationListFormContext)

  useEffect(()=>{
    if(data){
      form.setFieldValue('name', data.name )
    }
  })

  const columns: TableProps<MacRegistration>['columns'] = [
    {
      title: $t({ defaultMessage: 'Mac Address' }),
      key: 'mac_address',
      dataIndex: 'mac_address',
      render: function (data, row) {
        return `${row.macAddress}`
      }
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: $t({ defaultMessage: 'Status' }),
      render: function (data, row) {
        return `${row.revoked}`
      }
    },
    {
      key: 'username',
      dataIndex: 'username',
      title: $t({ defaultMessage: 'Username' }),
      render: function (data, row) {
        return `${row.username}`
      }
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: $t({ defaultMessage: 'E-mail' }),
      render: function (data, row) {
        return `${row.email}`
      }
    },
    {
      key: 'registrationDate',
      dataIndex: 'registrationDate',
      title: $t({ defaultMessage: 'Registration Date' }),
      render: function (data, row) {
        return `${row.expirationDate}`
      }
    },
    {
      key: 'expirationDate',
      dataIndex: 'expirationDate',
      title: $t({ defaultMessage: 'Expiration Date' }),
      render: function (data, row) {
        return `${row.expirationDate}`
      }
    }
  ]

  return columns
}

const defaultPayload = {
  fields: [
  ],
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC'
}

interface MacAddressDrawerProps {
  setVisible: (visible: boolean) => void
  setMacRegistrationData: (data: MacRegistration) => void
}

export default function MacRegistrationListMacAddressesFormTable (props: MacAddressDrawerProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { setVisible } = props

  const MacRegistrationListMacAddressesFormTable = () => {
    const tableQuery = useMacTableQuery({
      useQuery: useMacRegistrationsQuery,
      defaultPayload
    })

    const { tenantId } = useParams()
    const [
      deleteMacRegList
    ] = useDeleteMacRegListMutation()

    const rowActions: TableProps<MacRegistration>['rowActions'] = [{
      label: $t({ defaultMessage: 'Revoke' }),
      onClick: (selectedRows) => {
        navigate(`${selectedRows[0].id}/edit`, { replace: false })
      }
    },
    {
      label: $t({ defaultMessage: 'Unrevoke' }),
      onClick: (selectedRows) => {
        navigate(`${selectedRows[0].id}/edit`, { replace: false })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Lists' }),
            entityValue: rows.length === 1 ? rows[0].macAddress : undefined,
            numOfEntities: rows.length,
            confirmationText: 'Delete'
          },
          onOk: () => {
            deleteMacRegList({ params: { tenantId, macRegistrationsId: rows[0].id } })
              .then(clearSelection)
          }
        })
      }
    }]

    return (
      <Table
        rowKey='id'
        columns={useColumns()}
        dataSource={tableQuery.data?.content}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
        actions={[{
          label: 'Add Mac Address',
          onClick: () => setVisible(true)
        }]}
      />
    )
  }

  return (
    <>
      Review and manage the list of registered MAC addresses
      <MacRegistrationListMacAddressesFormTable />
    </>
  )
}
