import { Key, useState } from 'react'

import {
  Form,
  Input
  // Radio,
  // RadioChangeEvent,
  // Space
} from 'antd'
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
  useGetAssignedMspEcToIntegratorQuery,
  useMspCustomerListQuery
} from '@acx-ui/msp/services'
import {
  MspEc
} from '@acx-ui/msp/utils'
import { useTableQuery } from '@acx-ui/rc/utils'
import { AccountType }   from '@acx-ui/utils'

import * as UI from '../styledComponents'

interface IntegratorDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspEc[]) => void
  tenantId?: string
  tenantType?: string
}

export const AssignEcDrawer = (props: IntegratorDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, setSelected, tenantId, tenantType } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()

  const isSkip = tenantId === undefined

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
      delegation_type: tenantType,
      number_of_days: form.getFieldValue(['number_of_days']),
      mspec_list: [] as string[]
    }
    const selectedRows = form.getFieldsValue(['ecCustomers'])
    if (selectedRows && selectedRows.ecCustomers) {
      selectedRows.ecCustomers.forEach((element: MspEc) => {
        payload.mspec_list.push ( element.id)
      })
    }

    if (tenantId) {
      assignMspCustomers({ payload, params: { mspIntegratorId: tenantId } })
        .then(() => {
          setVisible(false)
          resetFields()
        })
    } else {
      setSelected(selectedRows.ecCustomers)
    }

    setVisible(false)
  }

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'streetAddress',
      key: 'streetAddress',
      width: 200,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicenses',
      key: 'wifiLicenses',
      align: 'center',
      render: function (data, row) {
        return row.wifiLicenses ? row.wifiLicenses : 0
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Licenses' }),
      dataIndex: 'switchLicenses',
      key: 'switchLicenses',
      align: 'center',
      render: function (data, row) {
        return row.switchLicenses ? row.switchLicenses : 0
      }
    }
  ]

  const defaultPayload = {
    searchString: '',
    filters: { tenantType: ['MSP_EC'] },
    fields: [
      'id',
      'name',
      'tenantType',
      'status',
      'wifiLicense',
      'switchLicens',
      'streetAddress'
    ]
  }

  const CustomerTable = () => {
    const assignedEcs =
      useGetAssignedMspEcToIntegratorQuery(
        { params: { mspIntegratorId: tenantId, mspIntegratorType: tenantType } },
        { skip: isSkip })
    const queryResults = useTableQuery({
      useQuery: useMspCustomerListQuery,
      pagination: {
        pageSize: 10000
      },
      defaultPayload
    })

    let dataSource = queryResults.data?.data
    let selectedKeys = [] as Key[]
    if (queryResults?.data && (isSkip || assignedEcs?.data)) {
      selectedKeys = queryResults.data.data.filter(
        rec => assignedEcs.data?.mspec_list?.includes(rec.id)).map(rec => rec.id)
      const selRows = queryResults.data.data.filter(
        rec => assignedEcs.data?.mspec_list?.includes(rec.id))
      form.setFieldValue('ecCustomers', selRows)
      assignedEcs.data?.expiry_date
        ? form.setFieldValue(['number_of_days'],
          moment(assignedEcs.data.expiry_date).diff(moment(Date()), 'days'))
        : form.setFieldValue(['number_of_days'], '')

      dataSource = tenantType === AccountType.MSP_INSTALLER
        ? queryResults.data.data.filter(rec => !rec.installer || selectedKeys.includes(rec.id))
        : queryResults.data.data.filter(rec => !rec.integrator || selectedKeys.includes(rec.id))
    }

    return (
      <Loader states={[queryResults
      ]}>
        <Table
          columns={columns}
          dataSource={dataSource}
          type='form'
          rowKey='id'
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedKeys,
            onChange (selectedRowKeys, selectedRows) {
              form.setFieldValue('ecCustomers', selectedRows)
            }
          }}
        />
      </Loader>
    )
  }

  const content =
  <Form layout='vertical' form={form} onFinish={onClose}>
    {tenantId && <div>
      <Subtitle level={4}>{$t({ defaultMessage: 'Access Periods' })}</Subtitle>
      {tenantType === AccountType.MSP_INTEGRATOR && <label>Not Limited</label>}
      {tenantType === AccountType.MSP_INSTALLER && <UI.FieldLabelAccessPeriod width='275px'>
        <label>{$t({ defaultMessage: 'Limited To' })}</label>
        <Form.Item
          name='number_of_days'
          initialValue={'7'}
          rules={[{ validator: (_, value) =>
          {
            if(parseInt(value, 10) > 60 || parseInt(value, 10) < 1) {
              return Promise.reject(
                `${$t({ defaultMessage: 'Value must be between 1 and 60 days' })} `
              )
            }
            return Promise.resolve()
          }
          }]}
          children={<Input type='number'/>}
          style={{ marginLeft: '10px', paddingRight: '20px' }}
        />
        <label>{$t({ defaultMessage: 'Day(s)' })}</label>
      </UI.FieldLabelAccessPeriod>}</div>}


    <Subtitle level={4} style={{ marginTop: '20px' }}>
      { $t({ defaultMessage: 'Select customer accounts to assign to this tech partner:' }) }
    </Subtitle>

    <CustomerTable />
  </Form>

  const footer =
    <Drawer.FormFooter
      onCancel={resetFields}
      // disabled={disableSave}
      onSave={async () => handleSave()}
    />


  return (
    <Drawer
      title={$t({ defaultMessage: 'Manage Customers Assigned' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={800}
    />
  )
}
