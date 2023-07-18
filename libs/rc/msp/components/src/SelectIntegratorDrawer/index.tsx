import { Key, useEffect, useState } from 'react'

import { Form }    from 'antd'
import moment      from 'moment-timezone'
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
  useMspCustomerListQuery,
  useLazyGetAssignedMspEcToIntegratorQuery
} from '@acx-ui/msp/services'
import {
  MspEc
} from '@acx-ui/msp/utils'
import { useTableQuery } from '@acx-ui/rc/utils'
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
  const [original, setOriginal] = useState({} as MspEc)
  const [form] = Form.useForm()
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])

  const [getAssignedEc] = useLazyGetAssignedMspEcToIntegratorQuery()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const [ assignMspCustomers ] = useAssignMspEcToIntegratorMutation()

  const handleSave = async () => {
    const selectedRows = form.getFieldsValue(['integrator'])
    if (tenantId && tenantType) {
      // remove from orginal one, then add to the new one
      if (original?.assignedMspEcList) {
        const integrtorId = original.id
        const ecData =
          await getAssignedEc({ params: { mspIntegratorId: integrtorId,
            mspIntegratorType: tenantType } }).unwrap()
        const newEcList = ecData?.mspec_list.filter(e => e !== tenantId)
        const numOfDays = moment(ecData?.expiry_date).diff(moment(Date()), 'days')

        let payload = {
          delegation_type: tenantType,
          number_of_days: numOfDays,
          mspec_list: newEcList
        }
        assignMspCustomers({ payload, params: { mspIntegratorId: integrtorId } })
          .then(() => {
            if (selectedRows?.integrator.length === 0) {
              setVisible(false)
              resetFields()
            }
          })
      }
      if (selectedRows?.integrator.length > 0) {
        const integrtorId = selectedRows.integrator[0].id
        const ecData = await getAssignedEc({ params: { mspIntegratorId: integrtorId,
          mspIntegratorType: tenantType } }).unwrap()

        let payload = {
          delegation_type: tenantType,
          number_of_days: '',
          mspec_list: [] as string[]
        }

        let newEcList = ecData?.mspec_list ? ecData.mspec_list : []
        newEcList = newEcList.concat([tenantId])
        const numOfDays =
          ecData?.expiry_date ? moment(ecData?.expiry_date).diff(moment(Date()), 'days') : ''

        payload.number_of_days = numOfDays as string
        payload.mspec_list = newEcList as string[]

        assignMspCustomers({ payload, params: { mspIntegratorId: integrtorId } })
          .then(() => {
            setVisible(false)
            resetFields()
          })
      }
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

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload
  })

  useEffect(() => {
    if (tableQuery?.data && tenantId) {
      setSelectedKeys(tableQuery?.data.data.filter(
        mspEc => mspEc.assignedMspEcList.includes(tenantId)).map(mspEc => mspEc.id))
      const selRows = tableQuery?.data.data.filter(
        mspEc => mspEc.assignedMspEcList.includes(tenantId))
      setOriginal(selRows?.[0])
      form.setFieldValue('integrator', selRows)
    }
  }, [tableQuery.data])

  const IntegratorTable = () => {
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
    <Subtitle level={4}>{selectedCustomer}</Subtitle>
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
