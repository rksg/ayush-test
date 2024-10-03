import { Col, DatePicker, Form, Input, Radio, Row, Space, Typography } from 'antd'
import moment                                                          from 'moment'
import { useIntl }                                                     from 'react-intl'

import { Button } from '@acx-ui/components'

export default function MaxPeriod () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  return <div>
    <Form
      form={form}
      layout='vertical'
      size={'small'}
    >
      <Form.Item
        name={'licenses'}
        initialValue={'paidLicenses'}
        children={<Radio.Group>
          <Space direction='vertical'>
            <Radio value={'paidLicenses'}>{ $t({ defaultMessage: 'Paid Licenses' })}</Radio>
            <Radio value={'extendedTrialLicenses'}>{
              $t({ defaultMessage: 'Extended Trial Licenses' }) }</Radio>
          </Space>
        </Radio.Group>}/>
      <Form.Item
        name={'startDate'}
        style={{ display: 'inline-block', width: '80px' }}
        children={<DatePicker
          allowClear={false}
          disabledDate={(current) => {
            return current && current < moment().endOf('day')
          }}
          style={{ marginLeft: '4px' }}
        />}/>
      <Form.Item
        name={'endDate'}
        style={{ display: 'inline-block', width: '80px', margin: '0 6px' }}
        children={<Input />}/>
      <Form.Item
        name={'calculate'}
        style={{ display: 'inline-block', width: '80px', margin: '0 6px' }}
        children={<Button type='default'>CALCULATE</Button>}/>
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
        <Typography.Title> 05/12/2025 </Typography.Title>
      </Col>
    </Row>
  </div>
}