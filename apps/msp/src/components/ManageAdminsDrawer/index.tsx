import { useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useMspAdminListQuery
} from '@acx-ui/rc/services'
import {
  MspAdministrator,
  RolesEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

interface ManageAdminsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const ManageAdminsDrawer = (props: ManageAdminsDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()
  const [ search, setSearch ] = useState('')

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const { Option } = Select

  const columns: TableProps<MspAdministrator>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
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
      render: function (data, row) {
        return transformAdminRole(row.role)
      }
    }
  ]

  const transformAdminRole = (value: RolesEnum) => {
    return <Select defaultValue={value} style={{ width: '200px' }}>
      <Option value={'PRIME_ADMIN'}>{$t({ defaultMessage: 'Prime Admin' })}</Option>
      <Option value={'ADMIN'}>{$t({ defaultMessage: 'Administrator' })}</Option>
      <Option value={'OFFICE_ADMIN'}>{$t({ defaultMessage: 'Guest Manager' })}</Option>
      <Option value={'READ_ONLY'}>{$t({ defaultMessage: 'Read Only' })}</Option>
    </Select>
  }

  const MspAdminTable = () => {
    const queryResults = useMspAdminListQuery({
      params: useParams()
    },{
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest
      })
    })

    return (
      <Loader states={[queryResults
      ]}>
        <Table
          columns={columns}
          dataSource={queryResults?.data}
          rowKey='id'
          rowSelection={{ type: 'checkbox' }}
        />
      </Loader>
    )
  }

  const content =
  <Form layout='vertical' form={form} onFinish={onClose}>
    <h4>Select customer's MSP administrators</h4>
    <MspAdminTable />
  </Form>

  const footer = [
    <Button onClick={() => form.submit()} type={'secondary'}>{$t({ defaultMessage: 'Save' })}</Button>,
    <Button onClick={resetFields}>{$t({ defaultMessage: 'Cancel' })}</Button>
  ]

  return (
    <Drawer
      title={'Manage MSP Administrators'}
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
