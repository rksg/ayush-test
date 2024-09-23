import '@testing-library/jest-dom'

import { LazyQueryTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks'
import userEvent            from '@testing-library/user-event'
import { Form }             from 'antd'

import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen,
  renderHook
} from '@acx-ui/test-utils'

import {
  venueResponse,
  schedulerResponse,
  mockedCustom,
  scheduleResultR1,
  scheduleResultRAI,
  scheduleResultAlwaysOn
} from './__tests__/fixtures'

import { parseNetworkVenueScheduler, ScheduleCard } from './index'

const mockedLazyQuey = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({
  dstOffset: 3600,
  rawOffset: -28800,
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) }) as LazyQueryTrigger<any>

const onApply = jest.fn()

describe('ScheduleCard', () => {
  describe('intervalUnit-15 > R1', () => {
    const props = {
      loading: false,
      isShowTimezone: true,
      isShowTips: true,
      fieldNamePath: ['scheduler'],
      title: 'TestTitle',
      venue: venueResponse,
      scheduler: scheduleResultR1,
      lazyQuery: mockedLazyQuey,
      intervalUnit: 15,
      type: schedulerResponse.type
    }

    it('parseNetworkVenueScheduler', () => {
      expect(parseNetworkVenueScheduler(schedulerResponse)).toEqual(scheduleResultR1)
    } )

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
      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: { ...mockedCustom, mon: [] } })
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

      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: scheduleResultAlwaysOn })
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

  describe('intervalUnit-15 > RAI', () => {
    const props = {
      loading: false,
      isShowTimezone: false,
      isShowTips: false,
      is12H: false,
      prefix: false,
      timelineLabelTop: false,
      fieldNamePath: ['scheduler'],
      title: 'TestTitleRAI',
      venue: venueResponse,
      scheduler: scheduleResultRAI,
      lazyQuery: mockedLazyQuey,
      intervalUnit: 60,
      type: 'CUSTOM'
    }

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
      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: { ...scheduleResultRAI, mon: [] } })
    })
  })

})
