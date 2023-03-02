import { useEffect, useState } from 'react'

import { Form, Modal, Radio, RadioChangeEvent, Select, SelectProps, Space } from 'antd'
import moment                                                               from 'moment'
// import { FieldData }                                                                    from 'rc-field-form/lib/interface'
import { useIntl } from 'react-intl'
// import { useParams }                                                                    from 'react-router-dom'

import { showActionModal, Subtitle } from '@acx-ui/components'
import {
  useMspCustomerListQuery
} from '@acx-ui/rc/services'
import {
  CommonErrorsResult,
  CatchErrorDetails,
  useTableQuery
} from '@acx-ui/rc/utils'

interface SubscriptionUsageReportDialogProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const SubscriptionUsageReportDialog = (props: SubscriptionUsageReportDialogProps) =>{
  const { visible, setVisible } = props
  const [isValid, setIsValid] = useState<boolean>(true)
  const { $t } = useIntl()
  // const params = useParams()
  const [form] = Form.useForm()
  const [selectedPeriod, setSelectedPeriod] = useState('calendar')
  const [periodOptions, setPeriodOptions] = useState<SelectProps['options']>([])
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [selectedCustomers, setSelectedCustomers] = useState('all')
  const [selectedCustomerOption, setSelectedCustomerOption] = useState()
  const [customerOptions, setCustomerOptions] = useState<SelectProps['options']>([])

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
  const { data: customers } = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload
  })

  useEffect(() => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const today = new Date()
    let month = today.getMonth()
    let year = today.getFullYear()
    const opts = []
    for (let i = 0; i < 12; i++) {
      opts.push({
        label: months.at(month) + ' ' + year.toString(),
        value: months.at(month) + ' ' + year.toString()
      })
      if (month === 0) {
        month = 12
        year -=1
      }
      else {
        month -=1
      }
    }
    setPeriodOptions([ ...opts ])
    setCustomerOptions(customers?.data?.map(customer => {
      return {
        label: customer.name, value: customer.id
      }
    }))
  }, [customers])

  const onSelectCustomerChange = () => {

  }

  const handleGenerate = async () => {
    // try {
    // } catch(error) {
    //   const respData = error as CommonErrorsResult<CatchErrorDetails>
    //   const errors = respData.data.errors

    // }
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Generate Usage Report' })}
      width={500}
      visible={visible}
      okText={$t({ defaultMessage: 'Generate' })}
      onCancel={handleCancel}
      onOk={handleGenerate}
      maskClosable={false}
      okButtonProps={{
        disabled: selectedCustomers === 'specific' && !selectedCustomerOption
      }}
    >
      <Form
        form={form}
        layout='vertical'
      >
        <Subtitle level={4} style={{ marginTop: '5px', marginBottom: '5px' }}>
          {$t({ defaultMessage: 'Period' })}</Subtitle>
        <Form.Item
          name='period'
          initialValue={selectedPeriod}
        >
          <Radio.Group
            style={{ paddingLeft: '2px' }}
            onChange={(e: RadioChangeEvent) => setSelectedPeriod(e.target.value)}
            value={selectedPeriod}
            // initialValue={periodOptions?.at(0)?.value}
          >
            <Space direction='vertical'>
              <Space direction='horizontal'>
                <Radio value='calendar'>
                  { $t({ defaultMessage: 'Calendar Month' }) }
                </Radio>
                {selectedPeriod === 'calendar' &&
                  <Select
                    defaultValue={periodOptions?.at(0)?.value}
                    // onChange={}
                    options={periodOptions}
                    style={{ width: '200px' }}
                  />
                }
              </Space>
              <Radio value='hours'>
                { $t({ defaultMessage: 'Last 24 Hours' }) }
              </Radio>
              <Radio value='week'>
                { $t({ defaultMessage: 'Last 7 Days' }) }
              </Radio>
              <Radio value='month'>
                { $t({ defaultMessage: 'Last 30 Days' }) }
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Subtitle level={4} style={{ marginTop: '5px', marginBottom: '5px' }}>
          {$t({ defaultMessage: 'Format' })}</Subtitle>
        <Form.Item
          name='format'
          initialValue={selectedFormat}
        >
          <Radio.Group
            style={{ paddingLeft: '2px' }}
            onChange={(e: RadioChangeEvent) => setSelectedFormat(e.target.value)}
            value={selectedFormat}
          >
            <Space direction='vertical'>
              <Radio value='csv'>
                { $t({ defaultMessage: 'CSV' }) }
              </Radio>
              <Radio value='json'>
                { $t({ defaultMessage: 'JSON' }) }
              </Radio>
              <Radio value='pdf'>
                { $t({ defaultMessage: 'PDF' }) }
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Subtitle level={4} style={{ marginTop: '5px', marginBottom: '5px' }}>
          {$t({ defaultMessage: 'Select Customers' })}</Subtitle>
        <Form.Item
          name='customers'
          initialValue={selectedCustomers}
        >
          <Radio.Group
            style={{ paddingLeft: '2px' }}
            onChange={(e: RadioChangeEvent) => setSelectedCustomers(e.target.value)}
            value={selectedCustomers}
          >
            <Space direction='vertical'>
              <Radio value='all'>
                { $t({ defaultMessage: 'All Customers' }) }
              </Radio>
              <Space direction='horizontal'>
                <Radio value='specific'>
                  { $t({ defaultMessage: 'Specific Customers' }) }
                </Radio>
                {selectedCustomers === 'specific' &&
                  <Select
                    onChange={onSelectCustomerChange}
                    placeholder='Select a customer'
                    options={customerOptions}
                    style={{ width: '200px' }}
                  />
                }
              </Space>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}

