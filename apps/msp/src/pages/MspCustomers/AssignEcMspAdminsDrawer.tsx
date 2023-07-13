import { useState } from 'react'

import { Select, Space } from 'antd'
import { useIntl }       from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useMspAdminListQuery,
  useUpdateMspEcDelegatedAdminsMutation
} from '@acx-ui/msp/services'
import {
  MspAdministrator,
  MspEcDelegatedAdmins
} from '@acx-ui/msp/utils'
import {
  roleDisplayText
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'

interface AssignEcMspAdminsDrawerProps {
  visible: boolean
  tenantId?: string
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspAdministrator[]) => void
}

export const AssignEcMspAdminsDrawer = (props: AssignEcMspAdminsDrawerProps) => {
  const { $t } = useIntl()

  const { visible, tenantId, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [selectedRows, setSelectedRows] = useState<MspAdministrator[]>([])

  const queryResults = useMspAdminListQuery({ params: useParams() })

  const onClose = () => {
    setVisible(false)
    setSelectedRows([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const [ saveMspAdmins ] = useUpdateMspEcDelegatedAdminsMutation()

  const handleSave = () => {
    let payload: MspEcDelegatedAdmins[] = []
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((element:MspAdministrator) => {
        payload.push ({
          msp_admin_id: element.id,
          msp_admin_role: element.role
        })
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
        return row.role === RolesEnum.GUEST_MANAGER || row.role === RolesEnum.DPSK_ADMIN
          ? <span>{$t(roleDisplayText[row.role])}</span>
          : transformAdminRole(row.id, row.role)
      }
    }
  ]

  const transformAdminRole = (id: string, initialRole: RolesEnum) => {
    const role = initialRole
    return <Select defaultValue={role}
      style={{ width: '200px' }}>
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
      <Loader states={[queryResults
      ]}>
        <Table
          columns={columns}
          dataSource={queryResults?.data}
          rowKey='email'
          rowSelection={{
            type: 'checkbox',
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
            },
            getCheckboxProps: (record: MspAdministrator) => ({
              disabled: record.role === RolesEnum.GUEST_MANAGER ||
                        record.role === RolesEnum.DPSK_ADMIN
            })
          }}
        />
      </Loader>
    </Space>

  const footer =<div>
    <Button
      disabled={selectedRows.length === 0}
      onClick={() => handleSave()}
      type={'secondary'}
    >
      {$t({ defaultMessage: 'Assign' })}
    </Button>

    <Button onClick={() => {
      setVisible(false)
    }}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Assign MSP Administrators' })}
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
