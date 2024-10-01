import { useState } from 'react'

import { Col, DatePickerProps, Form, Radio, Row, Space, Typography } from 'antd'
import { RangePickerProps }                    from 'antd/lib/date-picker'
import moment                                  from 'moment'
import { useIntl }                             from 'react-intl'

import { Button, DatePicker } from '@acx-ui/components'

export default function MaxLicenses () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [ selectedDate, setSelectedDate ] = useState(moment().endOf('day'))

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && (current < selectedDate || current > selectedDate)
  }

  const onDateChange: DatePickerProps['onChange'] = (dateString: moment.Moment | null) => {
    if (dateString) {
      setSelectedDate(dateString)
      if (dateString.isBefore(moment(selectedDate).add(1, 'days'))) {
        form.setFieldValue('endDate', moment(selectedDate).add(1, 'days'))
      }
    }
  }
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
            <Radio value={'paidLicenses'}>{$t({ defaultMessage: 'Paid Licenses' })}</Radio>
            <Radio value={'extendedTrialLicenses'}>{
              $t({ defaultMessage: 'Extended Trial Licenses' }) }</Radio>
          </Space>
        </Radio.Group>}/>
      <Form.Item
        name={'startDate'}
        label={$t({ defaultMessage: 'Start Date' })}
        style={{ display: 'inline-block', width: '80px' }}
        children={<DatePicker
          allowClear={false}
          onChange={onDateChange}
          disabledDate={(current) => {
            return current && current < moment().add(1, 'day')
          }}
        />}/>
      <Form.Item
        name={'endDate'}
        label={$t({ defaultMessage: 'End Date' })}
        style={{ display: 'inline-block', width: '80px', margin: '0 6px' }}
        children={<DatePicker
          allowClear={false}
          disabledDate={(date) => date.isBefore(moment(selectedDate).add(1, 'days'))}
        />}/>
      <Form.Item
        name={'calculate'}
        style={{ display: 'inline-block', width: '80px', margin: '27px 6px 0px 0px' }}
        children={<Button style={{
          background: 'var(--acx-primary-black)',
          color: 'var(--acx-primary-white)'
        }}
        type='default'>{ $t({ defaultMessage: 'CALCULATE' }) }</Button>}/>
    </Form>
    <Row style={{
          alignItems: 'baseline'
    }}>
      <Col style={{
        marginRight: '4px'
      }}>
        <Typography.Text>
          { $t({ defaultMessage: 'Available Licenses:' }) }
        </Typography.Text>
      </Col>
      <Col>
        <Typography.Title> 34 </Typography.Title>
      </Col>
    </Row>
  </div>
}