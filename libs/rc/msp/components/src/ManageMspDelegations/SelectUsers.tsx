import { Key, useEffect, useState } from 'react'

import { Select, Space } from 'antd'
import { useIntl }       from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetMspEcDelegatedAdminsQuery,
  useMspAdminListQuery
} from '@acx-ui/msp/services'
import {
  MspAdministrator,
  MspEcDelegatedAdmins
} from '@acx-ui/msp/utils'
import {
  defaultSort,
  roleDisplayText,
  sortProp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'

import { SystemRoles } from '.'

interface SelectUsersProps {
  tenantId?: string
  setSelected?: (selected: MspAdministrator[]) => void
}

export const SelectUsers = (props: SelectUsersProps) => {
  const { $t } = useIntl()

  const { tenantId, setSelected } = props
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<MspAdministrator[]>([])
  const [selectedRoles, setSelectedRoles] = useState<{ id: string, role: string }[]>([])

  const isSkip = tenantId === undefined

  function getSelectedKeys (mspAdmins: MspAdministrator[], admins: string[]) {
    return mspAdmins.filter(rec => admins.includes(rec.id)).map(rec => rec.email)
  }

  function getSelectedRows (mspAdmins: MspAdministrator[], admins: string[]) {
    return mspAdmins.filter(rec => admins.includes(rec.id))
  }

  function rowNotSelected (email: string) {
    return selectedRows.find(rec => rec.email === email) ? false : true
  }

  const delegatedAdmins =
      useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId: tenantId },
        enableRbac: true }, { skip: isSkip })
  const queryResults = useMspAdminListQuery({ params: useParams() })

  const usersQueryResults = queryResults.data?.filter(admin => SystemRoles.includes(admin.role))

  useEffect(() => {
    if (usersQueryResults && delegatedAdmins?.data) {
      const selRoles = delegatedAdmins?.data?.map((admin) => {
        return { id: admin.msp_admin_id, role: admin.msp_admin_role }
      })
      setSelectedRoles(selRoles)
      const admins = delegatedAdmins?.data.map((admin: MspEcDelegatedAdmins)=> admin.msp_admin_id)
      setSelectedKeys(getSelectedKeys(usersQueryResults as MspAdministrator[], admins))
      const selRows = getSelectedRows(usersQueryResults as MspAdministrator[], admins)
      setSelectedRows(selRows)
    }
    setIsLoaded(isSkip || (usersQueryResults && delegatedAdmins?.data) as unknown as boolean)
  }, [queryResults?.data, delegatedAdmins?.data])

  const { Option } = Select

  const columns: TableProps<MspAdministrator>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      key: 'email',
      sorter: { compare: sortProp('email', defaultSort) },
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      dataIndex: 'role',
      key: 'role',
      sorter: false,
      onCell: () => {
        return {
          onClick: (event) => {
            event.stopPropagation()
          }
        }
      },
      render: function (_, row) {
        return row.role === RolesEnum.DPSK_ADMIN ||
              (row.role === RolesEnum.GUEST_MANAGER && rowNotSelected(row.email))
          ? <span>{$t(roleDisplayText[row.role])}</span>
          : transformAdminRole(row.id, row.role)
      }
    }
  ]

  const handleRoleChange = (id: string, value: string) => {
    const updatedRole = { id: id, role: value }
    setSelectedRoles([ ...selectedRoles.filter(row => row.id !== id), updatedRole ])
  }

  const transformAdminRole = (id: string, initialRole: RolesEnum) => {
    const role = delegatedAdmins?.data?.find((admin) => admin.msp_admin_id === id)?.msp_admin_role
      ?? initialRole
    return isLoaded && <Select defaultValue={role}
      style={{ width: '150px' }}
      onChange={value => handleRoleChange(id, value)}>
      {
        Object.entries(RolesEnum).map(([label, value]) => (
          !(value === RolesEnum.DPSK_ADMIN ||value === RolesEnum.TEMPLATES_ADMIN ||
            value === RolesEnum.REPORTS_ADMIN
          )
          && <Option
            key={label}
            value={value}>{$t(roleDisplayText[value])}
          </Option>
        ))
      }
    </Select>
  }

  return <Space direction='vertical'>
    <Loader states={[queryResults]}>
      <Table
        columns={columns}
        dataSource={usersQueryResults}
        rowKey='email'
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedKeys,
          onChange (selectedRowKeys, selRows) {
            if (selectedRowKeys.length === selRows.length) {
              setSelectedRows(selRows)
            }
            else {
              // On row click to deselect (i.e. clicking on row itself not checkbox) selRows is empty array
              if (selRows.length === 0) {
                setSelectedRows([...selectedRows.filter(row =>
                  selectedRowKeys.includes(row.email))])
              }
              // On row click to select (i.e. clicking on row itself not checkbox) selRows only has newly selected row
              else {
                setSelectedRows([...selectedRows, ...selRows])
              }
            }
            // setSelected(selectedRows)
            setSelectedKeys(selectedRowKeys)
          },
          getCheckboxProps: (record: MspAdministrator) => ({
            disabled:
                 record.role === RolesEnum.DPSK_ADMIN ||
                (record.role === RolesEnum.GUEST_MANAGER && rowNotSelected(record.email))
          })
        }}
      />
    </Loader>
  </Space>
}
