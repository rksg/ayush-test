import { Key, useState } from 'react'

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
import {
  AccountType
} from '@acx-ui/utils'

interface IntegratorDrawerProps {
  visible: boolean
  tenantId?: string
  tenantType?: string
  setVisible: (visible: boolean) => void
  setSelected: (tenantType: string, selected: MspEc[]) => void
}

export const SelectIntegratorDrawer = (props: IntegratorDrawerProps) => {
  const { $t } = useIntl()

  const { visible, tenantId, tenantType, setVisible, setSelected } = props
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
    const selectedRows = form.getFieldsValue(['integrator'])
    if (tenantId) {
      let payload = {
        delegation_type: tenantType ? tenantType : AccountType.MSP_INTEGRATOR,
        number_of_days: '',
        mspec_list: [] as string[]
      }
      if (selectedRows && selectedRows.integrator) {
        selectedRows.integrator.forEach((element: MspEc) => {
          payload.mspec_list.push (element.id)
        })
      }
      assignMspCustomers({ payload, params: { mspIntegratorId: tenantId } })
        .then(() => {
          setVisible(false)
          resetFields()
        })
    } else {
      setSelected(tenantType as string, selectedRows.integrator)
    }
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
        return row.assignedMspEcList?.length > 0 ? row.assignedMspEcList.length : 0
      }
    }
  ]

  const defaultPayload = {
    searchString: '',
    filters: {
      tenantType: tenantType === AccountType.MSP_INTEGRATOR
        ? [AccountType.MSP_INTEGRATOR] : [AccountType.MSP_INSTALLER]
    },
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

    let selectedKeys = [] as Key[]
    if (tableQuery?.data && tenantId) {
      selectedKeys = tableQuery?.data.data.filter(
        mspEc => mspEc.assignedMspEcList.includes(tenantId)).map(mspEc => mspEc.id)
      const selRows = tableQuery?.data.data.filter(
        mspEc => mspEc.assignedMspEcList.includes(tenantId))
      form.setFieldValue('integrator', selRows)
    }

    return (
      <Loader states={[tableQuery
      ]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          rowKey='id'
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedKeys,
            onChange (selectedRowKeys, selectedRows) {
              form.setFieldValue('integrator', selectedRows)
            }
          }}
        />
      </Loader>
    )
  }
  const selectedCustomer = tenantType === AccountType.MSP_INTEGRATOR
    ? $t({ defaultMessage: 'Select customer\'s Integrator' })
    : $t({ defaultMessage: 'Select customer\'s Installer' })
  const content =
  <Form layout='vertical' form={form} onFinish={onClose}>
    <Subtitle level={3}>{selectedCustomer}</Subtitle>
    <IntegratorTable />
  </Form>

  const footer =
    <Drawer.FormFooter
      onCancel={resetFields}
      onSave={async () => handleSave()}
    />

  const title = tenantType === AccountType.MSP_INTEGRATOR
    ? $t({ defaultMessage: 'Manage Integrator' })
    : $t({ defaultMessage: 'Manage Installer' })

  return (
    <Drawer
      title={title}
      onBackClick={onClose}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={500}
    />
  )
}
