import { Key, useEffect, useState } from 'react'

import { Select, Space } from 'antd'
import { useIntl }       from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import {
  MspAdministrator,
  MspEcDelegatedAdmins
} from '@acx-ui/msp/utils'
import {
  defaultSort,
  roleDisplayText,
  sortProp
} from '@acx-ui/rc/utils'
import { RolesEnum } from '@acx-ui/types'

interface SelectUsersProps {
  tenantId?: string
  setSelected: (selected: MspAdministrator[]) => void
  selected?: MspAdministrator[],
  usersData?: MspAdministrator[],
  delegatedAdminsData?: MspEcDelegatedAdmins[]
}

export const SelectUsers = (props: SelectUsersProps) => {
  const { $t } = useIntl()

  const { tenantId, setSelected, selected, usersData, delegatedAdminsData } = props
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

  function getSelectedRowsFromKeys (mspAdmins: MspAdministrator[], keys: string[]) {
    return mspAdmins.filter(rec => keys.includes(rec.email))
  }

  function rowNotSelected (email: string) {
    return selectedRows.find(rec => rec.email === email) ? false : true
  }

  useEffect(() => {
    if (usersData && delegatedAdminsData) {
      const selRoles = delegatedAdminsData.map((admin) => {
        return { id: admin.msp_admin_id, role: admin.msp_admin_role }
      })
      // If given selected users, i.e. edit, then set selected rows to those users
      if (selected && selected.length > 0) {
        setSelectedKeys(selected.map(sel => sel.email))
        setSelectedRows(selected)
        const nonselectedRoles = selRoles.filter(rec =>
          !selected.map(sel => sel.id).includes(rec.id))
        setSelectedRoles([ ...nonselectedRoles,
          ...selected.map(sel => { return { id: sel.id, role: sel.role as string } })
        ])
      }
      // Otherwise set selected rows according to delegated admins data
      else {
        const admins = delegatedAdminsData.map((admin: MspEcDelegatedAdmins) => admin.msp_admin_id)
        setSelectedKeys(getSelectedKeys(usersData, admins))
        const selRows = getSelectedRows(usersData, admins)
        setSelectedRows(selRows)
        setSelected(selRows)
        setSelectedRoles(selRoles)
      }
    }
    setIsLoaded(isSkip || (usersData && delegatedAdminsData) as unknown as boolean)
  }, [usersData, delegatedAdminsData])

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
    const selRow = selectedRows?.find(sel => sel.id === id)
    if (selRow) {
      const updatedSelRows = [ ...selectedRows.filter(row => row.id !== id),
        { ...selRow, role: value as RolesEnum } ]
      setSelectedRows(updatedSelRows)
      setSelected(updatedSelRows)
    }
  }

  const transformAdminRole = (id: string, initialRole: RolesEnum) => {
    const role = selectedRoles.find(sel => sel.id === id)?.role
    ?? delegatedAdminsData?.find((admin) => admin.msp_admin_id === id)?.msp_admin_role
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
    <Table
      columns={columns}
      dataSource={usersData}
      rowKey='email'
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys: selectedKeys,
        onChange (selectedRowKeys, selRows) {
          if (selectedRowKeys.length === selRows.length) {
            setSelectedRows(selRows)
            setSelected(selRows)
          }
          else {
            // On row click to deselect (i.e. clicking on row itself not checkbox) selRows is empty array
            // On row click to select (i.e. clicking on row itself not checkbox) selRows only has newly selected row
            // So in these scenarios, get selected rows from selectedRowKeys instead
            const rows = getSelectedRowsFromKeys(usersData ?? [], selectedRowKeys as string[])
            setSelectedRows(rows)
            setSelected(rows)
          }
          setSelectedKeys(selectedRowKeys)
        },
        getCheckboxProps: (record: MspAdministrator) => ({
          disabled:
                 record.role === RolesEnum.DPSK_ADMIN ||
                (record.role === RolesEnum.GUEST_MANAGER && rowNotSelected(record.email))
        })
      }}
    />
  </Space>
}
