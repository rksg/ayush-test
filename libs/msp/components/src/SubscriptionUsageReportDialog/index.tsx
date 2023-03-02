import { useEffect, useState } from 'react'

import { Form, Modal, Radio, RadioChangeEvent, Select, SelectProps, Space } from 'antd'
import moment                                                               from 'moment'
// import { FieldData }                                                                    from 'rc-field-form/lib/interface'
import { useIntl } from 'react-intl'
// import { useParams }                                                                    from 'react-router-dom'

import { showActionModal, Subtitle } from '@acx-ui/components'
import {
  useGetGenerateLicenseUsageRptQuery,
  useMspCustomerListQuery
} from '@acx-ui/rc/services'
import {
  // CommonErrorsResult,
  // CatchErrorDetails,
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
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [periodOptions, setPeriodOptions] = useState<SelectProps['options']>([])
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [selectedCustomers, setSelectedCustomers] = useState('all')
  const [selectedCustomerOption, setSelectedCustomerOption] = useState()
  const [customerOptions, setCustomerOptions] = useState<SelectProps['options']>([])

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
    setSelectedPeriod('calendar')
    setCustomerOptions(customers?.data?.map(customer => {
      return {
        label: customer.name, value: customer.id
      }
    }))
  }, [customers])

  const onSelectCustomerChange = () => {

  }

  // api/entitlement-assign/tenant/3061bd56e37445a8993ac834c01e2710/usage-report?month=03&year=2023&deviceDetails=false&page=1&dailyReportsPerPage=31
  // api/entitlement-assign/tenant/3061bd56e37445a8993ac834c01e2710/usage-report?startDate=2023-02-28&endDate=2023-02-28&deviceDetails=false&page=1&dailyReportsPerPage=31
  // api/entitlement-assign/tenant/3061bd56e37445a8993ac834c01e2710/usage-report?month=03&year=2023&mspEcTenantId=4bd80809ee7d48efb2b84ec7469cca67&deviceDetails=false&page=1&dailyReportsPerPage=31

  /* eslint-disable max-len */
  const getGenerateUsagePayload = (currentmonth: boolean, startMonth: string, startYear: string, startDate: string, endDate: string, mspEcTenantId: string) => {
    const deviceDetails = false
    const page = 1
    const dailyReportsPerPage = '31'
    const url = 'usage-report'
    let payload = `${url}`
    if (currentmonth && startMonth && startYear) {
      if (mspEcTenantId) {
        payload = `${url}?month=${startMonth}&year=${startYear}&mspEcTenantId=${mspEcTenantId}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
      } else {
        payload = `${url}?month=${startMonth}&year=${startYear}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
      }
    } else if (startDate && endDate) {
      if (mspEcTenantId) {
        payload = `${url}?startDate=${startDate}&endDate=${endDate}&mspEcTenantId=${mspEcTenantId}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
      } else {
        payload = `${url}?startDate=${startDate}&endDate=${endDate}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
      }
    }
    return payload
  }

  const handleGenerate = async () => {
    const currentMonth = true
    const startMonth = '3'
    const startYear = '2022'
    const startDate = '2023-02-28'
    const endDate = '2023-02-28'
    const selectTenant = '3061bd56e37445a8993ac834c01e2710'
    const urlPayload =
      getGenerateUsagePayload(currentMonth, startMonth, startYear, startDate, endDate, selectTenant)

    // this.entitlementService.getGenerateLicenseUsageRpt(urlPayload, selectedFormat).subscribe(res => {
    const nowTime = '20230301121212' //DateTimeUtilsService.getCurrentDate('YYYYMMDDHHMMSS')

    let filename = 'Licenses Usage Report - ' + nowTime + '.' + selectedFormat

    // if (selectedFormat === 'CSV') {
    //   const blob = new Blob([res.body], { type: 'text/csv;charset=utf-8;' });
    //   const url = window.URL.createObjectURL(blob);
    //   that.fileService.downloadFile(url, filename);
    // }
    // else if (selectedFormat === 'JSON') {
    //   const blob = new Blob([res.body], { type: 'text/json;charset=utf-8;' });
    //   const url = window.URL.createObjectURL(blob);
    //   that.fileService.downloadFile(url, filename);
    // }
    // else if (selectedFormat === 'PDF') {
    //   const blob = new Blob([res.body]);
    //   const url = window.URL.createObjectURL(blob);
    //   that.fileService.downloadFile(url, filename);

    // } else {
    // const title = 'Generate Usage Report';
    // const msg = `format is not supported. `;
    // this.notificationService.showInfo(msg, title, 'Ok')
    // .then(result => {
    // });
    // }
    // this.showSpinner = false;
    // this.dialogService.close('MspLicensesUsageRptComponent');
    // },
    // error => {
    // this.showSpinner = false;
    // });

  }

  const handleCancel = () => {
    setVisible(false)
    // form.resetFields()
    setSelectedPeriod('calendar')
    setSelectedFormat('csv')
    setSelectedCustomers('all')
  }

  // public getGenerateLicenseUsageRpt(urlUsageReport, selectedFormat): Observable<any> {
  //   const payload = urlUsageReport;
  //   let customHeaders: { [index: string]: any; };
  //   let hasOptions: any = true;
  //   customHeaders = {};
  //   if (selectedFormat === 'CSV') {
  //     customHeaders['Content-Type'] = 'text/csv';
  //   } else if (selectedFormat === 'JSON') {
  //     customHeaders['Content-Type'] = 'text/json';
  //   } else if (selectedFormat === 'PDF') {
  //     customHeaders['Content-Type'] = 'application/pdf';
  //     hasOptions = {
  //       observe: 'response',
  //       responseType: 'blob'
  //     };
  //   } else {
  //     customHeaders = null;
  //   }
  //   return this.apiService.get<any[]>(`/api/entitlement-assign/tenant/${this.tenantId}/${payload}`, null, customHeaders, true, hasOptions);
  // }


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
        {/* <Form.Item
          name='period'
          initialValue={selectedPeriod}
        > */}
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
        {/* </Form.Item> */}

        <Subtitle level={4} style={{ marginTop: '5px', marginBottom: '5px' }}>
          {$t({ defaultMessage: 'Format' })}</Subtitle>
        {/* <Form.Item
          name='format'
          initialValue={selectedFormat}
        > */}
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
        {/* </Form.Item> */}

        <Subtitle level={4} style={{ marginTop: '5px', marginBottom: '5px' }}>
          {$t({ defaultMessage: 'Select Customers' })}</Subtitle>
        {/* <Form.Item
          name='customers'
          initialValue={selectedCustomers}
        > */}
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
        {/* </Form.Item> */}
      </Form>
    </Modal>
  )
}

