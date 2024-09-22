import { storiesOf } from '@storybook/react'
import { Form }      from 'antd'

import { Button } from '../Button'

import { scheduleResultR1, scheduleResultRAI, schedulerResponse, venueResponse } from './__tests__/fixtures'

import { ScheduleCard } from '.'

const BasicCard = () => {
  const [form] = Form.useForm()
  const props = {
    loading: false,
    isShowTimezone: true,
    isShowTips: true,
    fieldName: 'scheduler',
    title: 'TestTitle',
    venue: venueResponse,
    scheduler: scheduleResultR1,
    intervalUnit: 15,
    type: schedulerResponse.type
  }
  return (
    <>
      <Form form={form}
        layout='horizontal'
        size='small'>
        <ScheduleCard {...props} form={form} disabled={false} />
      </Form>

      <Button type='primary'
        onClick={() => {
          // eslint-disable-next-line no-console
          console.info(form.getFieldsValue())
        }}>Apply</Button>
    </>
  )
}

const OneHourCard = () => {
  const [form] = Form.useForm()
  const props = {
    loading: false,
    isShowTimezone: false,
    isShowTips: false,
    is12H: false,
    prefix: false,
    timelineLabelTop: false,
    fieldName: 'scheduler',
    title: 'TestTitleRAI',
    venue: venueResponse,
    scheduler: scheduleResultRAI,
    intervalUnit: 60,
    type: 'CUSTOM'
  }
  return (
    <>
      <Form form={form}
        layout='horizontal'
        size='small'>
        <ScheduleCard {...props} form={form} disabled={false} />
      </Form>

      <Button type='primary'
        onClick={() => {
          // eslint-disable-next-line no-console
          console.info(form.getFieldsValue())
        }}>Apply</Button>
    </>
  )
}

storiesOf('ScheduleCard', module)
  .add('default', BasicCard)
  .add('OneHourCard', OneHourCard)

export {}
