import { useState } from 'react'

import { Col, DatePickerProps, Form, Radio, Row, Space, Typography } from 'antd'
import moment                                                        from 'moment'
import { useIntl }                                                   from 'react-intl'

import { Button, DatePicker, Loader, showToast } from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useGetCalculatedLicencesMutation }      from '@acx-ui/msp/services'
import { LicenseCalculatorData }                 from '@acx-ui/msp/utils'
import { EntitlementDeviceType }                 from '@acx-ui/rc/utils'
import { noDataDisplay }                         from '@acx-ui/utils'

export default function MaxLicenses (props: { showExtendedTrial: boolean }) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [ selectedDate, setSelectedDate ] = useState(moment().endOf('day'))
  const [ maxLicenceCount, setMaxLicenceCount ] = useState<number>()

  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)

  const onDateChange: DatePickerProps['onChange'] = (dateString: moment.Moment | null) => {
    if (dateString) {
      setSelectedDate(dateString)
      form.setFieldValue('endDate', '')
    }
  }

  const [
    getCalculatedLicense,
    { isLoading }
  ] = useGetCalculatedLicencesMutation()

  async function calculateLicences () {
    form.validateFields()
    const startDate = form.getFieldsValue().startDate
    const endDate = form.getFieldsValue().endDate
    const isTrial = form.getFieldsValue().licenses === 'extendedTrialLicenses'
    if (startDate && endDate) {
      const diff = startDate.diff(endDate)
      if (diff < 0) {
        const payload = {
          operator: 'MAX_QUANTITY',
          effectiveDate: moment(startDate).format('YYYY-MM-DD'),
          expirationDate: moment(endDate).format('YYYY-MM-DD'),
          filters: {
            usageType: 'ASSIGNED',
            licenseType: EntitlementDeviceType.APSW,
            isTrial
          }
        }

        await getCalculatedLicense({ payload })
          .unwrap()
          .then(( { data, message }: { data: LicenseCalculatorData, message: string }) => {
            if (!message) {
              setMaxLicenceCount(data?.quantity || 0)
            } else {
              setMaxLicenceCount(undefined)
              showError(message)
            }
          }).catch(error => {
            if(error.data.message) {
              showError(error.data.message)
            }
          })
      }
    }
  }

  function showError (errorMessage: string) {
    showToast({
      type: 'error',
      content: errorMessage
    })
  }
  return <div>
    <Form
      form={form}
      layout='vertical'
      size={'middle'}
    >
      { props.showExtendedTrial && <Form.Item
        name={'licenses'}
        initialValue={'paidLicenses'}
        children={<Radio.Group>
          <Space direction='vertical'>
            <Radio value={'paidLicenses'}>{
              solutionTokenFFToggled
                ? $t({ defaultMessage: 'Device Networking Paid Licenses' })
                : $t({ defaultMessage: 'Paid Licenses' })}</Radio>
            <Radio value={'extendedTrialLicenses'}>{
              solutionTokenFFToggled
                ? $t({ defaultMessage: 'Device Networking Trial Licenses' })
                : $t({ defaultMessage: 'Trial Licenses' }) }</Radio>
          </Space>
        </Radio.Group>}/>}
      <Form.Item
        name={'startDate'}
        label={$t({ defaultMessage: 'Start Date' })}
        style={{ display: 'inline-block', width: '90px' }}
        validateFirst
        rules={[
          { required: true }
        ]}
        children={<DatePicker
          suffixIcon={null}
          allowClear={false}
          size='small'
          style={{
            height: '28px'
          }}
          onChange={onDateChange}
          disabledDate={(current) => {
            return current && current <= moment().startOf('day')
          }}
        />}/>
      <Form.Item
        name={'endDate'}
        label={$t({ defaultMessage: 'End Date' })}
        style={{ display: 'inline-block', width: '90px', margin: '0 6px' }}
        validateFirst
        rules={[
          { required: true }
        ]}
        children={<DatePicker
          allowClear={false}
          suffixIcon={null}
          size='small'
          style={{
            height: '28px'
          }}
          disabledDate={(date) => date.isBefore(moment(selectedDate).add(1, 'days'))}
        />}/>
      <Form.Item
        name={'calculate'}
        style={{ display: 'inline-block',
          width: '90px',
          margin: '22px 0px 0px 0px' }}
        children={<Button style={{
          background: 'var(--acx-primary-black)',
          color: 'var(--acx-primary-white)',
          minHeight: '28px',
          width: '90px'
        }}
        onClick={calculateLicences}
        type='default'>{ $t({ defaultMessage: 'CALCULATE' }) }</Button>}/>
    </Form>
    <Row style={{
      alignItems: 'center'
    }}>
      <Col style={{
        marginRight: '4px'
      }}>
        <Typography.Text>
          { $t({ defaultMessage: 'Available Licenses:' }) }
        </Typography.Text>
      </Col>
      <Col>
        <Typography.Title style={{
          margin: '0px'
        }}> <Loader states={[{ isLoading }]}>
            {maxLicenceCount || noDataDisplay}
          </Loader> </Typography.Title>
      </Col>
    </Row>
  </div>
}