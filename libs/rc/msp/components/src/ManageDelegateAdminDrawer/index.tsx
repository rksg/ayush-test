import { Key, useEffect, useState } from 'react'

import { Select, Space, Tooltip } from 'antd'
import { useIntl }                from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Subtitle,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useGetMspEcDelegatedAdminsQuery,
  useMspAdminListQuery,
  useUpdateMspEcDelegatedAdminsMutation
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
import { useParams }                          from '@acx-ui/react-router-dom'
import { RolesEnum, SupportedDelegatedRoles } from '@acx-ui/types'
import { AccountType }                        from '@acx-ui/utils'

import * as UI from './styledComponents'

interface ManageDelegateAdminDrawerProps {
  visible: boolean
  tenantId?: string
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspAdministrator[]) => void
  tenantType?: string
}

interface TooltipRowProps extends React.PropsWithChildren {
  'data-row-key': string;
}

export const ManageDelegateAdminDrawer = (props: ManageDelegateAdminDrawerProps) => {
  const { $t } = useIntl()

  const { visible, tenantId, setVisible, setSelected, tenantType } = props
  const [isLoaded, setIsLoaded] = useState(false)
  const [resetField, setResetField] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<MspAdministrator[]>([])
  const [selectedRoles, setSelectedRoles] = useState<{ id: string, role: string }[]>([])
  const [mspAdminsToAllEcs, setMspAdminsToAllEcs] = useState<MspAdministrator[]>([])
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)

  const isSkip = tenantId === undefined
  const isTechPartner =
    (tenantType === AccountType.MSP_INSTALLER ||
     tenantType === AccountType.MSP_INTEGRATOR)

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
        enableRbac: isRbacEnabled }, { skip: isSkip })
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
    if (queryResults?.data) {
      setMspAdminsToAllEcs(queryResults?.data.filter(admin => admin.delegateToAllECs))
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
    const rbacPayload = {
      delegation_type: 'MSP',
      mspec_list: payload
    }
    if (tenantId) {
      saveMspAdmins({ payload: isRbacEnabled ? rbacPayload : payload,
        params: { mspEcTenantId: tenantId }, enableRbac: isRbacEnabled })
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
      title: $t({ defaultMessage: 'Prvilege Group' }),
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
        const selRole = selectedRoles.find((sel) => sel.id === row.id)
        return row.role === RolesEnum.DPSK_ADMIN ||
              (row.role === RolesEnum.GUEST_MANAGER && rowNotSelected(row.email)) ||
              (selRole && !SupportedDelegatedRoles.includes(selRole.role as RolesEnum)) ||
              mspAdminsToAllEcs.some(admin => admin.id === row.id)
          ? <span>
            {roleDisplayText[row.role] ? $t(roleDisplayText[row.role]) : row.role}
          </span>
          : transformAdminRole(row.id, row.role)
      }
    }
  ]

  const handleRoleChange = (id: string, value: string) => {
    const updatedRole = { id: id, role: value }
    setSelectedRoles([ ...selectedRoles.filter(row => row.id !== id), updatedRole ])
  }

  const transformAdminRole = (id: string, initialRole: RolesEnum) => {
    const role = selectedRoles.find(row => row.id === id)?.role
    ?? (SupportedDelegatedRoles.includes(initialRole)
      ? initialRole : RolesEnum.ADMINISTRATOR)

    return isLoaded &&
    <Select defaultValue={role}
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

  const TooltipRow: React.FC<TooltipRowProps> = (props) => {
    const showTooltip = mspAdminsToAllEcs.some(admin => admin.email === props['data-row-key'])

    return showTooltip ?
      <Tooltip
        title={$t({ defaultMessage: 'This administrator has been delegated to all ecs' })}
      >
        <tr {...props} />
      </Tooltip>
      : <tr {...props} />
  }

  const content =
    <Space direction='vertical'>
      <Subtitle level={4}>
        { isTechPartner ? $t({ defaultMessage: 'Select customer\'s Tech Partner administrators' })
          : $t({ defaultMessage: 'Select customer\'s MSP administrators' }) }
      </Subtitle>
      <Loader states={[queryResults
      ]}>
        <UI.TableWrapper>
          <Table
            columns={columns}
            dataSource={queryResults?.data}
            rowKey='email'
            alwaysShowFilters={true}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedKeys,
              onChange (selectedRowKeys, selRows) {
                const updatedSelRows = selRows.map((element:MspAdministrator) => {
                  const role = selectedRoles.find(row => row.id === element.id)?.role
                  ?? SupportedDelegatedRoles.includes(element.role)
                    ? element.role
                    : RolesEnum.ADMINISTRATOR
                  const rowEntry = { ...element }
                  rowEntry.role = role as RolesEnum
                  return rowEntry
                })
                if (selectedRowKeys.length === selRows.length) {
                  setSelectedRows(updatedSelRows)
                }
                else {
                // On row click to deselect (i.e. clicking on row itself not checkbox) selRows is empty array
                  if (selRows.length === 0) {
                    setSelectedRows([...selectedRows.filter(row =>
                      selectedRowKeys.includes(row.email))])
                  }
                  // On row click to select (i.e. clicking on row itself not checkbox) selRows only has newly selected row
                  else {
                    setSelectedRows([...selectedRows, ...updatedSelRows])
                  }
                }
                setSelectedKeys(selectedRowKeys)
              },
              getCheckboxProps: (record: MspAdministrator) => ({
                disabled:
              record.role === RolesEnum.DPSK_ADMIN ||
                (record.role === RolesEnum.GUEST_MANAGER && rowNotSelected(record.email)) ||
                (selectedRoles.find((sel) => sel.id === record.id)
                  && !SupportedDelegatedRoles.includes(selectedRoles.find((sel) =>
                    sel.id === record.id)?.role as RolesEnum)) ||
                mspAdminsToAllEcs.some(admin => admin.id === record.id)
              })
            }}
            components={{
              body: {
                row: TooltipRow
              }
            }}
          />
        </UI.TableWrapper>
      </Loader>
    </Space>

  const footer =<div>
    <Button
      disabled={selectedKeys.length === 0}
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
      title={isTechPartner ? $t({ defaultMessage: 'Manage Tech Partner Users' })
        : $t({ defaultMessage: 'Manage MSP Users' })}
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
