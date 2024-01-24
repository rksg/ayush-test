import { useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Row,
  Col,
  Select,
  Input,
  Space,
  Switch,
  Button,
  InputNumber
} from 'antd'
import TextArea                                     from 'antd/lib/input/TextArea'
import { DefaultOptionType }                        from 'antd/lib/select'
import moment                                       from 'moment-timezone'
import { useIntl, defineMessage, FormattedMessage } from 'react-intl'
import styled                                       from 'styled-components/macro'

import { Loader }                                      from '@acx-ui/components'
import { EventExportSchedule, EventScheduleFrequency } from '@acx-ui/rc/utils'

import { EmailRecipientDialog }                              from '../EmailRecipientDialog'
import { eventTypeMapping, productMapping, severityMapping } from '../mapping'


export interface ScheduleExportFormProps {
  form: FormInstance,
  scheduleExportData?: EventExportSchedule,
  fetchingEditData: boolean,
  onSubmit: () => void
}

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-50);
  margin-top: 4px;
`
export const AtCol = styled(Col)`
  text-align: center;
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-5-font-weight);
`

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
  align-items: baseline;
`
const atMonthDayHourMinute = defineMessage({
  defaultMessage: '<d>Day</d> <dayMonth></dayMonth> <at> of every month, at</at>' +
    ' <hour></hour> <at2>:</at2> <minute></minute>'
})

const atDayHourMinute = defineMessage({
  defaultMessage: '<day></day> <at>at</at> <hour></hour> <at2>:</at2> <minute></minute>'
})

const context = 'context' as const

const dayOfWeekOptions: Array<{ value: string, label: string }> = [
  { value: 'SUN', label: 'Sunday' },
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
  { value: 'SAT', label: 'Saturday' }
]

function dayOfMonthMap () {
  const dayOfMonthMap = new Map<number, string>()
  const monthDays = [...Array.from(Array(31), (_, i) =>
    moment(`2021-1-${i + 1}`, 'YYYY-MM-DD').format('Do')
  )]
  monthDays.forEach((day, i) => dayOfMonthMap.set(i + 1, day))
  return dayOfMonthMap
}

function dayOfMonthOptions () {
  const dayOfMonthOptions = []
  for (const [value, day] of dayOfMonthMap().entries()) {
    dayOfMonthOptions.push({ value, label: day })
  }
  return dayOfMonthOptions
}

const frequencyListOptions: Array<{ value: string, label: string }> = [
  {
    label: EventScheduleFrequency.Weekly,
    value: EventScheduleFrequency.Weekly
  },
  {
    label: EventScheduleFrequency.Monthly,
    value: EventScheduleFrequency.Monthly
  }
]

export function ScheduleExportForm (props: ScheduleExportFormProps) {
  const { $t } = useIntl()

  const eventTypeList: DefaultOptionType[] =
  Object.entries(eventTypeMapping).map(([key, value]) => ({ value: key, label: $t(value) }))

  const severityList: DefaultOptionType[] =
  Object.entries(severityMapping).map(([key, value]) => ({ value: key, label: $t(value) }))

  const productList: DefaultOptionType[] =
  Object.entries(productMapping).map(([key, value]) => ({ value: key, label: $t(value) }))

  const { form, scheduleExportData, fetchingEditData } = props
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRecipientsList, setSelectedRecipientsList] = useState([] as string[])
  const exportScheduleEnabled = Form.useWatch('enable', form)
  const frequency = Form.useWatch('type', form)


  useEffect(() => {
    if (scheduleExportData) {
      const formScheduleExportData = { ...scheduleExportData }
      form.setFieldValue('enable', formScheduleExportData.enable || false)
      if (formScheduleExportData.reportSchedule) {
        form.setFieldValue('type',
          formScheduleExportData.reportSchedule?.type || EventScheduleFrequency.Weekly)
        form.setFieldValue('day', formScheduleExportData.reportSchedule.dayOfWeek)
        form.setFieldValue('hour', formScheduleExportData.reportSchedule?.hour)
        form.setFieldValue('minute',
          formScheduleExportData.reportSchedule?.minute)
        form.setFieldValue('dayOfMonth',
          formScheduleExportData.reportSchedule.dayOfMonth)
      }
      if (formScheduleExportData.context) {
        form.setFieldValue([context, 'entity_type'],
          formScheduleExportData.context.entity_type)
        form.setFieldValue([context, 'product'],
          formScheduleExportData.context.product)
        form.setFieldValue([context, 'severity'],
          formScheduleExportData.context.severity)
        if (formScheduleExportData.context?.searchString?.length) {
          // it will always be single string in array as per API implementation
          form.setFieldValue([context, 'searchString'],
            formScheduleExportData.context.searchString[0])
        }
      }
      if (formScheduleExportData.recipients && formScheduleExportData.recipients.length){
        form.setFieldValue('recipients', formScheduleExportData.recipients)
        setSelectedRecipientsList(formScheduleExportData.recipients)
      }

      form.validateFields()
    } else {
      // set default values
      form.setFieldValue('type', EventScheduleFrequency.Weekly)
      form.setFieldValue('day', dayOfWeekOptions[0].value)
      form.setFieldValue('hour', 12)
      form.setFieldValue('minute', 0)
      form.setFieldValue('dayOfMonth', 1)
    }
  }, [scheduleExportData])

  const openEmailRecipientDialog = () => {
    setModalVisible(true)
  }
  const handleModalCancel = () => {
    setModalVisible(false)
  }

  const handleModalSubmit =(emailRecipients: string[]) => {
    setSelectedRecipientsList(emailRecipients)

    form.setFieldValue('recipients', emailRecipients)
    form.validateFields(['recipients'])
    setModalVisible(false)
  }


  return <Loader states={[{
    isLoading: fetchingEditData
  }]}>
    <Form
      form={form}
      name={'scheduleExportForm'}
      layout={'vertical'}
    >
      <FieldLabel width='200px'>
        <Space>
          {$t({ defaultMessage: 'Enable Event Report Schedule' })}
        </Space>
        <Form.Item
          name='enable'
          valuePropName='checked'
          style={{ marginTop: '-5px' }}
          children={<Switch
            data-testid='event-report-schedule-enabled'
          />}
        />
      </FieldLabel>
      <Form.Item
        label={$t({ defaultMessage: 'Email Recipient' })}
        hidden={!exportScheduleEnabled}
        required>
        <Row gutter={8}>
          <Col span={selectedRecipientsList?.length ? 18 : 0}>
            <Form.Item
              noStyle
              name='recipients'
              validateTrigger={['onBlur']}
              rules={[
                { required: exportScheduleEnabled }
              ]}
            >
              <TextArea
                autoSize={selectedRecipientsList?.length
                  ? { minRows: 3, maxRows: 5 } : { minRows: 0, maxRows: 0 }}
                bordered={false}
                disabled={true}
                style={
                  {
                    color: 'var(--acx-primary-black)',
                    padding: 0
                  }
                }
              />
            </Form.Item>
          </Col>
          <Col span={selectedRecipientsList?.length ? 6 : 24}>
            <Button
              type='link'
              onClick={openEmailRecipientDialog}
            >{
                selectedRecipientsList?.length
                  ? $t({ defaultMessage: 'Change' })
                  : $t({ defaultMessage: 'Select Recipient' })
              }
            </Button>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item
        name={'type'}
        label={$t({ defaultMessage: 'Frequency' })}
        validateTrigger={['onBlur']}
        children={<Select
          options={frequencyListOptions} />
        }
        extra={
          frequency === EventScheduleFrequency.Weekly
            ? <label>{$t({ defaultMessage: 'Report duration will be last 7 days' })}</label>
            : <label>{$t({ defaultMessage: 'Report duration will be last 30 days' })}</label>
        }
        hidden={!exportScheduleEnabled}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Send reports on' })}
        validateTrigger={['onBlur']}
        children={
          <Row align='middle'>
            <FormattedMessage
              {...(frequency === EventScheduleFrequency.Weekly)
                ? atDayHourMinute : atMonthDayHourMinute}
              values={{
                d: (children) => <AtCol span={2} children={children} />,
                day: () => <Col span={10}>
                  <Form.Item
                    name={'day'}
                    noStyle
                  >
                    <Select
                      options={dayOfWeekOptions}
                    />
                  </Form.Item>
                </Col>,
                dayMonth: () => <Col
                  span={
                    frequency === EventScheduleFrequency.Weekly ? 5 : 6
                  }>
                  <Form.Item
                    name={'dayOfMonth'}
                    rules={[{ required: true,
                      message: $t({ defaultMessage: 'Please enter month day' }) }]}
                    noStyle
                  >
                    <Select
                      options={dayOfMonthOptions()}
                    />
                  </Form.Item>
                </Col>,
                at: (children) => <AtCol span={
                  frequency === EventScheduleFrequency.Weekly ? 2 : 9
                }
                children={children} />,
                hour: () => <Col span={3}>
                  <Form.Item
                    name={'hour'}
                    initialValue={0}
                    rules={
                      [{
                        required: true
                      }]
                    }
                    noStyle
                  >
                    <InputNumber
                      max={23}
                      min={0}
                      style={{ width: '40px' }}
                      size={'middle'}
                      formatter={(value) => (value && value.toString().length < 2)
                        ? '0' + value : '' + value}
                      parser={(value) => parseInt(value as string, 10) as 0 | 23}
                      controls={false}
                    />
                  </Form.Item>
                </Col>,
                at2: (children) => <AtCol span={
                  frequency === EventScheduleFrequency.Weekly ? 2 : 1
                }
                children={children} />,
                minute: () => <Col span={frequency === EventScheduleFrequency.Weekly ? 5 : 3}>
                  <Form.Item
                    name={'minute'}
                    initialValue={0}
                    rules={
                      [{
                        required: true
                      }]
                    }
                    noStyle
                  >
                    <InputNumber
                      max={59}
                      min={0}
                      style={{ width: '40px' }}
                      size={'middle'}
                      formatter={(value) => (value && value.toString().length < 2)
                        ? '0' + value : '' + value}
                      parser={(value) => parseInt(value as string, 10) as 0 | 59}
                      controls={false}
                    />
                  </Form.Item>
                </Col>
              }}
            />
          </Row>
        }
        hidden={!exportScheduleEnabled}
      />

      { exportScheduleEnabled && <h4>{ $t({ defaultMessage: 'Filter by' }) }</h4> }

      <Form.Item
        name={[context, 'product']}
        label={$t({ defaultMessage: 'Product' })}
        children={<Select
          mode='multiple'
          allowClear
          options={productList}
        />
        }
        hidden={!exportScheduleEnabled}
      />

      <Form.Item
        name={[context, 'severity']}
        label={$t({ defaultMessage: 'Severity' })}
        children={<Select
          mode='multiple'
          allowClear
          options={severityList}/>
        }
        hidden={!exportScheduleEnabled}
      />

      <Form.Item
        name={[context, 'entity_type']}
        label={$t({ defaultMessage: 'Event Type' })}
        children={<Select
          mode='multiple'
          allowClear
          options={eventTypeList}/>
        }
        hidden={!exportScheduleEnabled}
      />

      <Form.Item
        name={[context, 'searchString']}
        label={$t({ defaultMessage: 'Has Words' })}
        children={<Input/>}
        hidden={!exportScheduleEnabled}
      />

    </Form>

    { modalVisible && <EmailRecipientDialog
      visible={modalVisible}
      currentEmailList={selectedRecipientsList}
      onCancel={handleModalCancel}
      onSubmit={handleModalSubmit}
    /> }

  </Loader>
}
