import '@testing-library/jest-dom'
import { LazyQueryTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks'
import userEvent            from '@testing-library/user-event'
import { Form }             from 'antd'
import { rest }             from 'msw'

import * as config  from '@acx-ui/config'
import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen,
  mockServer,
  renderHook
} from '@acx-ui/test-utils'

import {
  venueResponse,
  schedulerResponse,
  mockedAlwaysOn
} from './__tests__/fixtures'

import { ScheduleCard } from './index'

const mockedLazyQuey = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({
  dstOffset: 3600,
  rawOffset: -28800,
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) }) as LazyQueryTrigger<any>

const onApply = jest.fn()

describe('ScheduleCard', () => {
  const props = {
    loading: false,
    isShowTimezone: true,
    isShowTips: true,
    fieldName: 'scheduler',
    title: 'TestTitle',
    venue: venueResponse,
    scheduler: schedulerResponse,
    lazyQuery: mockedLazyQuey
  }

  beforeEach(async () => {
    const env = {
      GOOGLE_MAPS_KEY: 'FAKE_GOOGLE_MAPS_KEY'
    }

    mockServer.use(
      rest.get('/globalValues.json', (_, r, c) => r(c.json(env)))
    )
    await config.initialize('r1')
  })

  it('should render schedule successfully (ALWAYS_ON)', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}
          layout='horizontal'
          size='small'
          onFinish={onApply}>
          <ScheduleCard {...props} form={formRef.current} disabled />
        </Form>
      </Provider>)

    expect(await screen.findByRole('button', { name: 'See tips' })).toBeVisible()
    expect(await screen.findByText('TestTitle')).toBeVisible()
    expect(formRef.current.getFieldsValue()).toMatchSnapshot()
  })

  it('should render schedule successfully (CUSTOM)', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current} onFinish={onApply}>
          <ScheduleCard {...props} form={formRef.current} disabled />
        </Form>
      </Provider>)

    expect(formRef.current.getFieldsValue()).toMatchSnapshot()
  })

  it('should render schedule monday checkbox options successfully (CUSTOM)', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current} onFinish={onApply}>
          <ScheduleCard {...props} form={formRef.current} disabled={false} />
        </Form>
      </Provider>)

    const scheduleCheckbox = await screen.findByTestId('checkbox_mon')
    expect(scheduleCheckbox).toBeVisible()
    await userEvent.click(scheduleCheckbox)
    expect(formRef.current.getFieldsValue()).toEqual({ scheduler: { ...mockedAlwaysOn, mon: [] } })
  })

  it('should render scheduler undefined successfully', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current} onFinish={onApply}>
          <ScheduleCard {...props} form={formRef.current} scheduler={undefined} disabled={true} />
        </Form>
      </Provider>)

    expect(formRef.current.getFieldsValue()).toEqual({ })
  })
  it('should render schedule dialog with drag and select timeslots successfully', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current} onFinish={onApply}>
          <ScheduleCard {...props} form={formRef.current} disabled={false} />
        </Form>
      </Provider>)

    const scheduleCheckbox = await screen.findByTestId('checkbox_mon')
    expect(scheduleCheckbox).toBeVisible()
    await userEvent.click(scheduleCheckbox)

    const mondayTimeSlot = await screen.findByTestId('mon_0')
    const mondayLastTimeSlot = await screen.findByTestId('mon_95')

    fireEvent.mouseDown(mondayLastTimeSlot)
    fireEvent.mouseMove(mondayTimeSlot)
    fireEvent.mouseUp(mondayTimeSlot)
  })
  it('should drag and select partial timeslots successfully', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current} onFinish={onApply}>
          <ScheduleCard {...props} form={formRef.current} disabled={false} />
        </Form>
      </Provider>)

    const scheduleCheckbox = await screen.findByTestId('checkbox_tue')
    expect(scheduleCheckbox).toBeVisible()
    await userEvent.click(scheduleCheckbox)
    const tuesdayTimeSlot1 = await screen.findByTestId('tue_0')
    const tuesdayTimeSlot2= await screen.findByTestId('tue_50')

    fireEvent.mouseDown(tuesdayTimeSlot1)
    fireEvent.mouseMove(tuesdayTimeSlot2)
    fireEvent.mouseUp(tuesdayTimeSlot2)
  })
})
