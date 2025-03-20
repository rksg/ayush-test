import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Select, SelectProps, Space } from 'antd'
import moment                                                        from 'moment-timezone'
import { useIntl }                                                   from 'react-intl'
import { useParams }                                                 from 'react-router-dom'

import { Subtitle, Modal }  from '@acx-ui/components'
import {
  useGetGenerateLicenseUsageRptQuery,
  useMspCustomerListQuery
} from '@acx-ui/msp/services'
import { useTableQuery } from '@acx-ui/rc/utils'
interface SubscriptionUsageReportDialogProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const SubscriptionUsageReportDialog = (props: SubscriptionUsageReportDialogProps) =>{
  const { visible, setVisible } = props
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState('')
  const [periodOptions, setPeriodOptions] = useState<SelectProps['options']>([])
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [selectedCustomers, setSelectedCustomers] = useState('all')
  const [selectedCustomerOption, setSelectedCustomerOption] = useState('')
  const [customerOptions, setCustomerOptions] = useState<SelectProps['options']>([])
  const [payload, setPayload] = useState('')
  const { data } = useGetGenerateLicenseUsageRptQuery({ params, payload, selectedFormat },
    { skip: payload === '' })

  const { data: customers } = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: {
      filters: {},
      fields: [
        'id',
        'name'
      ],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  useEffect(() => {
    const months = [
      $t({ defaultMessage: 'January' }),
      $t({ defaultMessage: 'February' }),
      $t({ defaultMessage: 'March' }),
      $t({ defaultMessage: 'April' }),
      $t({ defaultMessage: 'May' }),
      $t({ defaultMessage: 'June' }),
      $t({ defaultMessage: 'July' }),
      $t({ defaultMessage: 'August' }),
      $t({ defaultMessage: 'September' }),
      $t({ defaultMessage: 'October' }),
      $t({ defaultMessage: 'November' }),
      $t({ defaultMessage: 'December' })
    ]
    const today = new Date()
    let month = today.getMonth()
    let year = today.getFullYear()
    const opts = []
    for (let i = 0; i < 12; i++) {
      opts.push({
        label: months.at(month) + ' ' + year.toString(),
        value: (month + 1).toString() + ' ' + year.toString()
      })
      if (month === 0) {
        month = 11
        year--
      }
      else {
        month--
      }
    }
    setPeriodOptions([ ...opts ])
    setSelectedPeriod('calendar')
    const defaultCalendarMonth = opts?.at(0)?.value
    setSelectedCalendarMonth(defaultCalendarMonth ?? '')
    setCustomerOptions(customers?.data?.map(customer => {
      return {
        label: customer.name, value: customer.id
      }
    }))
  }, [customers])

  useEffect(() => {
    if (data && data.status === 200) {
      setVisible(false)
      setSelectedPeriod('calendar')
      setSelectedFormat('csv')
      setSelectedCustomers('all')
    }
  }, [data])

  /* eslint-disable max-len */
  const getGenerateUsagePayload = (currentmonth: boolean, startMonth: string, startYear: string, startDate: string, endDate: string, mspEcTenantId: string) => {
    const deviceDetails = false
    const page = 1
    const dailyReportsPerPage = '31'
    const url = 'usage-report'
    let payload = `${url}`
    if (currentmonth && startMonth && startYear) {
      if (mspEcTenantId !== '') {
        payload = `${url}?month=${startMonth}&year=${startYear}&mspEcTenantId=${mspEcTenantId}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
      } else {
        payload = `${url}?month=${startMonth}&year=${startYear}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
      }
    } else if (startDate && endDate) {
      if (mspEcTenantId !== '') {
        payload = `${url}?startDate=${startDate}&endDate=${endDate}&mspEcTenantId=${mspEcTenantId}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
      } else {
        payload = `${url}?startDate=${startDate}&endDate=${endDate}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
      }
    }
    return payload
  }

  const handleGenerate = async () => {
    const dateFormat = 'YYYY-MM-DD'
    const currentMonth = selectedPeriod === 'calendar'
    const selectedMonth = selectedCalendarMonth.split(' ').at(0)
    const selectedYear = selectedCalendarMonth.split(' ').at(1)
    const startMonth = selectedPeriod === 'calendar' && selectedMonth ? selectedMonth : ''
    const startYear = selectedPeriod === 'calendar' && selectedYear ? selectedYear : ''
    const startDate = selectedPeriod === 'hours'
      ? moment().subtract(1, 'days').format(dateFormat)
      : selectedPeriod === 'week'
        ? moment().subtract(7, 'days').format(dateFormat)
        : selectedPeriod === 'month'
          ? moment().subtract(30, 'days').format(dateFormat)
          : ''
    const endDate = moment().subtract(1, 'days').format(dateFormat)

    const mspEcTenantId = selectedCustomerOption ?? ''
    setPayload(getGenerateUsagePayload(currentMonth, startMonth, startYear, startDate, endDate, mspEcTenantId))
  }

  const handleCancel = () => {
    setVisible(false)
    setSelectedPeriod('calendar')
    setSelectedFormat('csv')
    setSelectedCustomers('all')
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
        <Radio.Group
          style={{ paddingLeft: '2px' }}
          onChange={(e: RadioChangeEvent) => setSelectedPeriod(e.target.value)}
          value={selectedPeriod}
        >
          <Space direction='vertical'>
            <Space direction='horizontal'>
              <Radio value='calendar'>
                { $t({ defaultMessage: 'Calendar Month' }) }
              </Radio>
              {selectedPeriod === 'calendar' &&
                <Select
                  defaultValue={periodOptions?.at(0)?.value?.toString()}
                  onChange={(value: string) => setSelectedCalendarMonth(value)}
                  options={periodOptions}
                  style={{ width: '200px', marginTop: '-10px', marginBottom: '-10px' }}
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

        <Subtitle level={4} style={{ marginTop: '5px', marginBottom: '5px' }}>
          {$t({ defaultMessage: 'Format' })}</Subtitle>
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

        <Subtitle level={4} style={{ marginTop: '5px', marginBottom: '5px' }}>
          {$t({ defaultMessage: 'Select Customers' })}</Subtitle>
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
                { $t({ defaultMessage: 'Specific Customer' }) }
              </Radio>
              {selectedCustomers === 'specific' &&
                <Select
                  onChange={(value: string) => setSelectedCustomerOption(value)}
                  placeholder='Select a customer'
                  options={customerOptions}
                  style={{ width: '200px', marginTop: '-10px', marginBottom: '-10px' }}
                />
              }
            </Space>
          </Space>
        </Radio.Group>
      </Form>
    </Modal>
  )
}

