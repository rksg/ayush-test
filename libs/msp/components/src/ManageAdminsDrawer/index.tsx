import { Key, useEffect, useState } from 'react'

import { Typography, Select, Space } from 'antd'
import { useIntl }                   from 'react-intl'

import {
  Drawer,
  Loader,
  Subtitle,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetMspEcDelegatedAdminsQuery,
  useMspAdminListQuery,
  useUpdateMspEcDelegatedAdminsMutation
} from '@acx-ui/rc/services'
import {
  MspAdministrator,
  MspEcDelegatedAdmins,
  roleDisplayText
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'

interface ManageAdminsDrawerProps {
  visible: boolean
  tenantId?: string
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspAdministrator[]) => void
}

export const ManageAdminsDrawer = (props: ManageAdminsDrawerProps) => {
  const { $t } = useIntl()

  const { visible, tenantId, setVisible, setSelected } = props
  const [isLoaded, setIsLoaded] = useState(false)
  const [resetField, setResetField] = useState(false)
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

  const delegatedAdmins =
      useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId: tenantId } },
        { skip: isSkip })
  const queryResults = useMspAdminListQuery({ params: useParams() })

  useEffect(() => {
    if (queryResults?.data && delegatedAdmins?.data) {
      const selRoles = delegatedAdmins?.data?.map((admin) => {
        return { id: admin.msp_admin_id, role: admin.msp_admin_role }
      })
      setSelectedRoles(selRoles)
      const admins = delegatedAdmins?.data.map((admin: MspEcDelegatedAdmins)=> admin.msp_admin_id)
      setSelectedKeys(getSelectedKeys(queryResults?.data as MspAdministrator[], admins))
      const selRows = getSelectedRows(queryResults?.data as MspAdministrator[], admins)
      setSelectedRows(selRows)
    }
    setIsLoaded(isSkip || (queryResults?.data && delegatedAdmins?.data) as unknown as boolean)
  }, [queryResults?.data, delegatedAdmins?.data])

  const onClose = () => {
    setVisible(false)
    setSelectedRows([])
    setSelectedRoles([])
    setSelectedKeys([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const [ saveMspAdmins ] = useUpdateMspEcDelegatedAdminsMutation()

  const handleSave = () => {
    let payload: MspEcDelegatedAdmins[] = []
    let returnRows: MspAdministrator[] = []
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((element:MspAdministrator) => {
        const role = selectedRoles.find(row => row.id === element.id)?.role ?? element.role
        payload.push ({
          msp_admin_id: element.id,
          msp_admin_role: role
        })
        const rowEntry = { ...element }
        rowEntry.role = role as RolesEnum
        returnRows.push(rowEntry)
      })
    } else {
      return
    }
    if (tenantId) {
      saveMspAdmins({ payload, params: { mspEcTenantId: tenantId } })
        .then(() => {
          setSelected(selectedRows)
          setVisible(false)
          resetFields()
        })
    } else {
      setSelected(returnRows)
    }
    setVisible(false)
  }

  const { Option } = Select

  const columns: TableProps<MspAdministrator>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      key: 'email',
      sorter: true,
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
      render: function (data, row) {
        return row.role === RolesEnum.DPSK_ADMIN
          ? <span>DPSK Manager</span>
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
      style={{ width: '200px' }}
      onChange={value => handleRoleChange(id, value)}>
      {
        Object.entries(RolesEnum).map(([label, value]) => (
          !(value === RolesEnum.DPSK_ADMIN)
          && <Option
            key={label}
            value={value}>{$t(roleDisplayText[value])}
          </Option>
        ))
      }
    </Select>
  }

  const content =
    <Space direction='vertical'>
      <Subtitle level={4}>
        { $t({ defaultMessage: 'Select customer\'s MSP administrators' }) }</Subtitle>
      <Loader states={[queryResults
      ]}>
        <Table
          columns={columns}
          dataSource={queryResults?.data}
          rowKey='email'
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedKeys,
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
            },
            getCheckboxProps: (record: MspAdministrator) => ({
              disabled: record.role === RolesEnum.DPSK_ADMIN
            })
          }}
        />
        {selectedRows.length === 0 &&
        <Typography.Text
          type='danger'
          style={{ marginTop: '20px' }}>
          Please select at least one MSP administrator
        </Typography.Text>}
      </Loader>
    </Space>

  const footer =
    <Drawer.FormFooter
      onCancel={resetFields}
      onSave={async () => handleSave()}
    />

  return (
    <Drawer
      title={$t({ defaultMessage: 'Manage MSP Administrators' })}
      onBackClick={onClose}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose={resetField}
      width={700}
    >
      {content}
    </Drawer>
  )
}
