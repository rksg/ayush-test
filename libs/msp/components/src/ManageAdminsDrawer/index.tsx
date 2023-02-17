import { Key, useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

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
  roleDisplayText,
  RolesEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

interface ManageAdminsDrawerProps {
  visible: boolean
  tenantId?: string
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspAdministrator[]) => void
}

export const ManageAdminsDrawer = (props: ManageAdminsDrawerProps) => {
  const { $t } = useIntl()

  const { visible, tenantId, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()

  const isSkip = tenantId === undefined

  function getSelectedKeys (mspAdmins: MspAdministrator[], admins: string[]) {
    return mspAdmins.filter(rec => admins.includes(rec.id)).map(rec => rec.email)
  }

  function getSelectedRows (mspAdmins: MspAdministrator[], admins: string[]) {
    return mspAdmins.filter(rec => admins.includes(rec.id))
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const [ saveMspAdmins ] = useUpdateMspEcDelegatedAdminsMutation()

  const handleSave = () => {
    let payload: MspEcDelegatedAdmins[] = []
    const selectedRows = form.getFieldsValue(['mspAdmins'])
    if (selectedRows && selectedRows.mspAdmins) {
      selectedRows.mspAdmins.forEach((element:MspAdministrator) => {
        payload.push ({
          msp_admin_id: element.id,
          msp_admin_role: element.role
        }
        )})
    }
    if (tenantId) {
      saveMspAdmins({ payload, params: { mspEcTenantId: tenantId } })
        .then(() => {
          setTimeout(() => {
            setSelected(selectedRows.mspAdmins)
            setVisible(false)
            resetFields()
          }, 1000)
        })
    } else {
      setSelected(selectedRows.mspAdmins)
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
        return transformAdminRole(row.role)
      }
    }
  ]

  const transformAdminRole = (value: RolesEnum) => {
    return <Select defaultValue={value} style={{ width: '200px' }}>
      {
        Object.entries(RolesEnum).map(([label, value]) => (
          <Option
            key={label}
            value={value}>{$t(roleDisplayText[value])}
          </Option>
        ))
      }
    </Select>
  }

  const MspAdminTable = () => {
    const delegatedAdmins =
      useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId: tenantId } },
        { skip: isSkip })
    const queryResults = useMspAdminListQuery({
      params: useParams()
    },{
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    })

    let selectedKeys = [] as Key[]
    if (queryResults?.data && delegatedAdmins?.data) {
      const admins = delegatedAdmins?.data.map((admin: MspEcDelegatedAdmins)=> admin.msp_admin_id)
      selectedKeys = getSelectedKeys(queryResults?.data as MspAdministrator[], admins)
      const selRows = getSelectedRows(queryResults?.data as MspAdministrator[], admins)
      form.setFieldValue('mspAdmins', selRows)
    }

    return (
      <Loader states={[queryResults
      ]}>
        <Table
          columns={columns}
          dataSource={queryResults?.data}
          rowKey='email'
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedKeys,
            onChange (selectedRowKeys, selectedRows) {
              form.setFieldValue('mspAdmins', selectedRows)
            }
          }}
        />
      </Loader>
    )
  }

  const content =
  <Form layout='vertical' form={form} onFinish={onClose}>
    <Subtitle level={3}>
      { $t({ defaultMessage: 'Select customer\'s MSP administrators' }) }</Subtitle>
    <MspAdminTable />
  </Form>

  const footer = [
    <Drawer.FormFooter
      onCancel={resetFields}
      onSave={async () => handleSave()}
    />
  ]

  return (
    <Drawer
      title={$t({ defaultMessage: 'Manage MSP Administrators' })}
      onBackClick={onClose}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={'700px'}
    />
  )
}
