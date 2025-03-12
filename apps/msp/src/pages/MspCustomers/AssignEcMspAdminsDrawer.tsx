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
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import {
  useMspAdminListQuery,
  useAssignMultiMspEcDelegatedAdminsMutation
} from '@acx-ui/msp/services'
import {
  AssignedMultiEcMspAdmins,
  MspAdministrator,
  SelectedMspMspAdmins
} from '@acx-ui/msp/utils'
import {
  defaultSort,
  roleDisplayText,
  sortProp
} from '@acx-ui/rc/utils'
import { useParams }                          from '@acx-ui/react-router-dom'
import { RolesEnum, SupportedDelegatedRoles } from '@acx-ui/types'

interface AssignEcMspAdminsDrawerProps {
  visible: boolean
  tenantIds: string[]
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspAdministrator[]) => void
}

export const AssignEcMspAdminsDrawer = (props: AssignEcMspAdminsDrawerProps) => {
  const { $t } = useIntl()
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)

  const { visible, tenantIds, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [selectedRows, setSelectedRows] = useState<MspAdministrator[]>([])
  const [selectedRoles, setSelectedRoles] = useState<{ id: string, role: string }[]>([])
  const params = useParams()

  const queryResults = useMspAdminListQuery({ params: useParams() })

  const onClose = () => {
    setVisible(false)
    setSelectedRows([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const [ saveMspAdmins ] = useAssignMultiMspEcDelegatedAdminsMutation()

  const handleSave = () => {
    let selMspAdmins: SelectedMspMspAdmins[] = []
    selectedRows.forEach((element:MspAdministrator) => {
      const role = selectedRoles.find(row => row.id === element.id)?.role ?? element.role
      selMspAdmins.push ({
        mspAdminId: element.id,
        mspAdminRole: role as RolesEnum
      })
    })
    let assignedEcMspAdmins: AssignedMultiEcMspAdmins[] = []
    tenantIds.forEach((id: string) => {
      assignedEcMspAdmins.push ({
        operation: 'ADD',
        mspEcId: id,
        mspAdminRoles: selMspAdmins
      })
    })

    saveMspAdmins({ params, payload: { associations: assignedEcMspAdmins },
      enableRbac: isRbacEnabled })
      .then(() => {
        setSelected(selectedRows)
        setVisible(false)
        resetFields()
      })
    setVisible(false)
  }

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
      title: isAbacToggleEnabled
        ? $t({ defaultMessage: 'Privilege Group' }) : $t({ defaultMessage: 'Role' }),
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
        return row.role === RolesEnum.GUEST_MANAGER || row.role === RolesEnum.DPSK_ADMIN ||
          !SupportedDelegatedRoles.includes(row.role)
          ? <span>{roleDisplayText[row.role] ? $t(roleDisplayText[row.role]) : row.role}</span>
          : transformAdminRole(row.id, row.role)
      }
    }
  ]

  const handleRoleChange = (id: string, value: string) => {
    const updatedRole = { id: id, role: value }
    setSelectedRoles([ ...selectedRoles.filter(row => row.id !== id), updatedRole ])
  }

  const transformAdminRole = (id: string, initialRole: RolesEnum) => {
    const role = SupportedDelegatedRoles.includes(initialRole)
      ? initialRole : RolesEnum.ADMINISTRATOR
    return <Select defaultValue={role}
      style={{ width: '150px' }}
      onChange={value => handleRoleChange(id, value)}>
      {
        Object.entries(RolesEnum).map(([label, value]) => (
          SupportedDelegatedRoles.includes(value)
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
          alwaysShowFilters={true}
          rowSelection={{
            type: 'checkbox',
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
            },
            getCheckboxProps: (record: MspAdministrator) => ({
              disabled: record.role === RolesEnum.GUEST_MANAGER ||
                        record.role === RolesEnum.DPSK_ADMIN ||
                        !SupportedDelegatedRoles.includes(record.role)
            })
          }}
        />
      </Loader>
    </Space>

  const footer =<div>
    <Button
      disabled={selectedRows.length === 0}
      onClick={() => handleSave()}
      type='primary'
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
