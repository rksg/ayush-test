import { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Drawer,
  Loader,
  Subtitle,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAssignMspEcToIntegratorMutation,
  useMspCustomerListQuery
} from '@acx-ui/rc/services'
import {
  MspEc,
  useTableQuery
} from '@acx-ui/rc/utils'
// import { useParams } from '@acx-ui/react-router-dom'

interface IntegratorDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  tenantId: string
}

export const SelectIntegratorDrawer = (props: IntegratorDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, tenantId } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const [ assignMspCustomers ] = useAssignMspEcToIntegratorMutation()

  const handleSave = () => {
    let payload = {
      delegation_type: 'MSP_INTEGRATOR',
      number_of_days: '',
      mspec_list: [] as string[]
    }
    const selectedRows = form.getFieldsValue(['integrators'])
    if (selectedRows && selectedRows.integrators) {
      selectedRows.ecCustomers.forEach((element: MspEc) => {
        payload.mspec_list.push (element.id)
      })
    }

    assignMspCustomers({ payload, params: { mspIntegratorId: tenantId } })
      .then(() => {
        setVisible(false)
        resetFields()
      })
    setVisible(false)
  }

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: '# of Customers' }),
      dataIndex: 'assignedMspEcList',
      key: 'assignedMspEcList',
      align: 'center',
      render: function (data, row) {
        return row.assignedMspEcList.length > 0 ? row.assignedMspEcList.length : 0
      }
    }
  ]

  const defaultPayload = {
    searchString: '',
    filters: { tenantType: ['MSP_INTEGRATOR'] },
    fields: [
      'id',
      'name',
      'tenantType',
      'status'
    ]
  }

  const IntegratorTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload
    })

    return (
      <Loader states={[tableQuery
      ]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          rowKey='id'
          rowSelection={{
            type: 'radio',
            onChange (selectedRowKeys, selectedRows) {
              form.setFieldValue('integrator', selectedRows)
            }
          }}

        />
      </Loader>
    )
  }

  const content =
  <Form layout='vertical' form={form} onFinish={onClose}>
    <Subtitle level={3}>
      { $t({ defaultMessage: 'Select customer\'s Integrator' }) }</Subtitle>
    <IntegratorTable />
  </Form>

  const footer = [
    <Drawer.FormFooter
      onCancel={resetFields}
      onSave={async () => handleSave()}
    />
  ]

  return (
    <Drawer
      title={'Manage Integrator'}
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
