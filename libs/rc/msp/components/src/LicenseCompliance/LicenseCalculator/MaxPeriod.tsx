import { useState } from 'react'

import { Col, DatePicker, Form, InputNumber, Radio, Row, Space, Typography } from 'antd'
import { isNumber }                                                          from 'lodash'
import moment                                                                from 'moment'
import { useIntl }                                                           from 'react-intl'

import { Button, Loader, showToast }        from '@acx-ui/components'
import { useGetCalculatedLicencesMutation } from '@acx-ui/msp/services'
import { LicenseCalculatorData }            from '@acx-ui/msp/utils'
import { EntitlementDeviceType }            from '@acx-ui/rc/utils'
import { noDataDisplay }                    from '@acx-ui/utils'

export default function MaxPeriod (props: { showExtendedTrial: boolean }) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [ maxPeriod, setMaxPeriod ] = useState<string>()

  const [
    getCalculatedLicense,
    { isLoading }
  ] = useGetCalculatedLicencesMutation()

  async function calculatePeriod () {
    form.validateFields()
    const startDate = form.getFieldsValue().startDate
    const noOfLicenses = form.getFieldsValue().noOfLicenses
    const isTrial = form.getFieldsValue().licenses === 'extendedTrialLicenses'
    if (startDate && isNumber(noOfLicenses)) {
      const payload = {
        operator: 'MAX_PERIOD',
        effectiveDate: moment(startDate).format('YYYY-MM-DD'),
        quantity: noOfLicenses,
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
            setMaxPeriod(data?.expirationDate)
          } else {
            setMaxPeriod('')
            showError(message)
          }
        }).catch(error => {
          if(error.data.message) {
            showError(error.data.message)
          }
        })
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
      onFinish={calculatePeriod}
    >
      { props.showExtendedTrial && <Form.Item
        name={'licenses'}
        initialValue={'paidLicenses'}
        children={<Radio.Group>
          <Space direction='vertical'>
            <Radio value={'paidLicenses'}>{ $t({ defaultMessage: 'Paid Licenses' })}</Radio>
            <Radio value={'extendedTrialLicenses'}>{
              $t({ defaultMessage: 'Extended Trial Licenses' }) }</Radio>
          </Space>
        </Radio.Group>}/> }
      <Form.Item
        name={'startDate'}
        label={$t({ defaultMessage: 'Start Date' })}
        style={{ display: 'inline-block', width: '90px' }}
        rules={[
          { required: true }
        ]}
        children={<DatePicker
          allowClear={false}
          suffixIcon={null}
          style={{
            height: '28px'
          }}
          disabledDate={(current) => {
            return current && current <= moment().startOf('day')
          }}
        />}/>
      <Form.Item
        name={'noOfLicenses'}
        label={$t({ defaultMessage: '# of Licenses' })}
        style={{ display: 'inline-block', width: '90px', margin: '0 6px' }}
        rules={[
          { required: true },
          { type: 'number', min: 1, max: 10000 }
        ]}
        children={<InputNumber
          style={{
            height: '28px'
          }}/>}/>
      <Form.Item
        name={'calculate'}
        style={{ display: 'inline-block', width: '90px',
          margin: '22px 6px 0px 0px' }}
        children={<Button style={{
          background: 'var(--acx-primary-black)',
          color: 'var(--acx-primary-white)',
          minHeight: '28px'
        }}
        htmlType='submit'
        type='default'>{ $t({ defaultMessage: 'CALCULATE' }) }</Button>}/>
    </Form>
    <Row style={{
      alignItems: 'baseline'
    }}>
      <Col style={{
        marginRight: '4px'
      }}>
        <Typography.Text>
          { $t({ defaultMessage: 'End Date:' }) }
        </Typography.Text>
      </Col>
      <Col>
        <Typography.Title> <Loader states={[{ isLoading }]}>
          {maxPeriod || noDataDisplay}
        </Loader> </Typography.Title>
      </Col>
    </Row>
  </div>
}