import React from 'react'

import { storiesOf } from '@storybook/react'
import { Form }      from 'antd'

import { Button } from '../Button'

import { scheduleResultR1, scheduleResultRAI, venueResponse } from './__tests__/fixtures'

import { ScheduleCard } from '.'

const BasicCard = () => {
  const [form] = Form.useForm()
  const [values, setValues] = React.useState({})
  const props = {
    loading: false,
    isShowTimezone: true,
    isShowTips: true,
    fieldNamePath: ['scheduler'],
    title: 'TestTitle',
    venue: venueResponse,
    scheduler: scheduleResultR1,
    intervalUnit: 15,
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
          setValues(form.getFieldsValue())
        }}>Apply</Button>
      {`form value: 
      ${JSON.stringify(values)}`}
    </>
  )
}

const LocalTimeZoneCard = () => {
  const [form] = Form.useForm()
  const [values, setValues] = React.useState({})
  const [readonly, setReadonly] = React.useState(false)
  const props = {
    loading: false,
    isShowTimezone: false,
    isShowTips: false,
    prefix: false,
    timelineLabelTop: false,
    fieldNamePath: ['scheduler'],
    scheduler: scheduleResultRAI,
    intervalUnit: 60,
    type: 'CUSTOM',
    localTimeZone: true
  }
  return (
    <>
      <Form form={form}
        layout='horizontal'
        size='small'>
        <ScheduleCard {...props} form={form} disabled={false} readonly={readonly} />
      </Form>

      <Button type='primary'
        onClick={() => { setReadonly(!readonly) }}>
        {`Set ${readonly?'Edit':'ReadOnly'} Mode`
        }</Button>
      <Button type='primary'
        onClick={() => {
          setValues(form.getFieldsValue())
        }}>Apply</Button>

      {`form value: 
      ${JSON.stringify(values)}`}
    </>
  )
}

storiesOf('ScheduleCard', module)
  .add('default', BasicCard)
  .add('LocalTimeZoneCard', LocalTimeZoneCard)

export {}
