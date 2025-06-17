import '@testing-library/jest-dom'

import { TypedLazyQueryTrigger } from '@reduxjs/toolkit/query/react'
import userEvent                 from '@testing-library/user-event'
import { Form }                  from 'antd'

import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen,
  renderHook
} from '@acx-ui/test-utils'
import { Scheduler, SchedulerDeviceTypeEnum } from '@acx-ui/types'

import {
  venueResponse,
  schedulerResponse,
  mockedCustom,
  scheduleResultR1,
  scheduleResultRAI,
  scheduleResultAlwaysOn,
  mondayScheduleNo0
} from './__tests__/fixtures'

import { parseNetworkVenueScheduler, ScheduleCard } from './index'

const mockedLazyQuey = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({
  dstOffset: 3600,
  rawOffset: -28800,
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) }) as TypedLazyQueryTrigger<any, any, any>

const onApply = jest.fn()

describe('ScheduleCard', () => {
  describe('intervalUnit-15 > R1', () => {
    const props = {
      loading: false,
      fieldNamePath: ['scheduler'],
      title: 'TestTitle',
      venue: venueResponse,
      scheduler: scheduleResultR1,
      lazyQuery: mockedLazyQuey,
      type: schedulerResponse.type,
      intervalUnit: 15
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
            <ScheduleCard
              {...props}
              type='ALWAYS_ON'
              form={formRef.current}
              disabled
              intervalUnit={15} />
          </Form>
        </Provider>)

      expect(await screen.findByRole('button', { name: 'See tips' })).toBeVisible()
      expect(await screen.findByText('TestTitle')).toBeVisible()
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: scheduleResultAlwaysOn })
    })

    it('should render schedule successfully enable (ALWAYS_ON)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current}
            layout='horizontal'
            size='small'
            onFinish={onApply}>
            <ScheduleCard {...props}
              type='ALWAYS_ON'
              form={formRef.current}
              disabled={false}
              intervalUnit={15} />
          </Form>
        </Provider>)

      expect(await screen.findByRole('button', { name: 'See tips' })).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'See tips' }))
      expect(await screen.findByRole('dialog')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: scheduleResultAlwaysOn })
    })

    it('should render schedule successfully (CUSTOM)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard
              {...props}
              form={formRef.current}
              disabled={false}
              intervalUnit={15} />
          </Form>
        </Provider>)

      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: mockedCustom })
    })

    it('should render schedule monday checkbox options successfully (CUSTOM)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      const scheduler = { ...mockedCustom, tue: [], mon: ['mon_0'] } as Scheduler
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard {...props}
              form={formRef.current}
              scheduler={scheduler}
              lazyQuery={undefined}
              disabled={false}
              intervalUnit={15} />
          </Form>
        </Provider>)
      const scheduleCheckboxMon0 = await screen.findByTestId('mon_0')
      await userEvent.click(scheduleCheckboxMon0)
      const scheduleCheckboxWed = await screen.findByTestId('checkbox_wed')
      expect(scheduleCheckboxWed).toBeChecked()
      await userEvent.click(scheduleCheckboxWed)
      expect(scheduleCheckboxWed).not.toBeChecked()
      const scheduleCheckboxTue = await screen.findByTestId('checkbox_tue')
      expect(scheduleCheckboxTue).not.toBeChecked()
      await userEvent.click(scheduleCheckboxTue)
      expect(scheduleCheckboxTue).toBeChecked()
      expect(formRef.current.getFieldsValue()).toEqual({
        scheduler: {
          ...mockedCustom,
          mon: [], wed: []
        }
      })
    })

    it('should render scheduler undefined successfully', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard
              {...props}
              form={formRef.current}
              scheduler={undefined}
              intervalUnit={15}
              disabled />
          </Form>
        </Provider>)

      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: scheduleResultAlwaysOn })
    })
    it('should render schedule dialog with drag and select timeslots successfully', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      const scheduler = { ...scheduleResultAlwaysOn, mon: [...mondayScheduleNo0] }
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard
              {...props}
              scheduler={scheduler}
              form={formRef.current}
              disabled={false}
              intervalUnit={15} />
          </Form>
        </Provider>)

      const scheduleCheckboxTue = await screen.findByTestId('checkbox_tue')
      expect(scheduleCheckboxTue).toBeChecked()
      await userEvent.click(scheduleCheckboxTue)
      expect(scheduleCheckboxTue).not.toBeChecked()

      const scheduleCheckboxMon0 = await screen.findByTestId('mon_0')
      await userEvent.click(scheduleCheckboxMon0)

      await userEvent.click(scheduleCheckboxTue)
      expect(scheduleCheckboxTue).toBeChecked()

      expect(formRef.current.getFieldsValue()).toEqual({
        scheduler: {
          ...scheduleResultAlwaysOn
        }
      })
    })
    it('should drag and select partial timeslots successfully', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard {...props} form={formRef.current} disabled={false} intervalUnit={15}/>
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

      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: { ...scheduleResultAlwaysOn,sat: [], tue: [] } })
    })
  })

  describe('intervalUnit-60 > R1', () => {
    const props = {
      loading: false,
      isShowTimezone: false,
      isShowTips: false,
      prefix: false,
      timelineLabelTop: false,
      fieldNamePath: ['scheduler'],
      title: 'TestTitleRAI',
      scheduler: scheduleResultRAI,
      intervalUnit: 60,
      type: 'CUSTOM',
      localTimeZone: true
    }

    it('should render schedule successfully (CUSTOM)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard {...props} form={formRef.current} disabled={false} intervalUnit={60}/>
          </Form>
        </Provider>)
      expect(await screen.findByText(/Local time/)).toBeVisible()
      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: scheduleResultRAI })
    })

    it('should render schedule readonly mode successfully (CUSTOM)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard
              {...props}
              form={formRef.current}
              disabled={false}
              readonly
              intervalUnit={60}/>
          </Form>
        </Provider>)
      expect(await screen.findByText(/Local time/)).toBeVisible()
      const scheduleCheckbox = await screen.findByTestId('checkbox_tue')
      expect(scheduleCheckbox).toBeVisible()
      expect(scheduleCheckbox).toBeChecked()
      expect(scheduleCheckbox).toBeDisabled()
      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: scheduleResultRAI })
    })

    it('should render schedule successfully (ALWAYS_ON)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard
              {...props}
              form={formRef.current}
              type='ALWAYS_ON'
              disabled={false}
              intervalUnit={60}/>
          </Form>
        </Provider>)
      expect(await screen.findByText(/Local time/)).toBeVisible()
      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({
        scheduler: {
          ...scheduleResultRAI,
          sat: scheduleResultRAI.mon,
          sun: scheduleResultRAI.mon }
      })
    })

    it('should render schedule undefined successfully (CUSTOM)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard {...props}
              scheduler={undefined}
              form={formRef.current}
              disabled={false}
              intervalUnit={60} />
          </Form>
        </Provider>)
      expect(await screen.findByText(/Local time/)).toBeVisible()
      expect(formRef.current.getFieldsValue()).toEqual({
        scheduler: { ...scheduleResultRAI, sat: scheduleResultRAI.mon, sun: scheduleResultRAI.mon }
      })
    })

    it('should render schedule monday checkbox options successfully (CUSTOM)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      const scheduler = { ...scheduleResultRAI, mon: [] }
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard
              {...props}
              form={formRef.current}
              scheduler={scheduler}
              disabled={false}
              intervalUnit={60} />
          </Form>
        </Provider>)

      const scheduleCheckboxMon = await screen.findByTestId('checkbox_mon')
      expect(scheduleCheckboxMon).not.toBeChecked()
      await userEvent.click(scheduleCheckboxMon)
      expect(scheduleCheckboxMon).toBeChecked()
      const scheduleCheckboxFri = await screen.findByTestId('checkbox_fri')
      expect(scheduleCheckboxFri).toBeChecked()
      await userEvent.click(scheduleCheckboxFri)
      expect(scheduleCheckboxFri).not.toBeChecked()
      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: { ...scheduleResultRAI, fri: [] } })
    })

    it('should render schedule mon_2 checkbox options successfully (CUSTOM)', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard {...props}
              form={formRef.current}
              disabled={false}
              intervalUnit={60} />
          </Form>
        </Provider>)

      const scheduleCheckbox = await screen.findByTestId('mon_2')
      expect(scheduleCheckbox).toBeVisible()
      await userEvent.click(scheduleCheckbox)
      // eslint-disable-next-line max-len
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: { ...scheduleResultRAI, mon: scheduleResultRAI.mon.filter(item => item !== '2') } })
    })

    it('should render schedule with slotwidth property correctly', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })

      const customSlotWidth = 30

      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard
              {...props}
              form={formRef.current}
              disabled={false}
              slotwidth={customSlotWidth}
              intervalUnit={60}
            />
          </Form>
        </Provider>
      )

      // Verify that the schedule renders correctly
      expect(await screen.findByText(/Local time/)).toBeVisible()

      // Check that time slots are rendered
      const timeSlots = await screen.findAllByTestId(/^(mon|tue|wed|thu|fri|sat|sun)_\d+$/)
      expect(timeSlots.length).toBeGreaterThan(0)

      // Check that the schedule data is correctly initialized
      expect(formRef.current.getFieldsValue()).toEqual({ scheduler: scheduleResultRAI })

      // Test interaction with the customized width slots
      const mondayTimeSlot = await screen.findByTestId('mon_2')
      expect(mondayTimeSlot).toBeVisible()
      await userEvent.click(mondayTimeSlot)

      // Verify the state is updated correctly after interaction
      expect(formRef.current.getFieldsValue()).toEqual({
        scheduler: {
          ...scheduleResultRAI,
          mon: scheduleResultRAI.mon.filter(item => item !== '2')
        }
      })
    })

    it('should render schedule poe tips correctly', async () => {
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })

      const customSlotWidth = 30

      render(
        <Provider>
          <Form form={formRef.current}
            layout='horizontal'
            size='small'
            onFinish={onApply}>
            <ScheduleCard
              {...props}
              form={formRef.current}
              disabled={false}
              slotwidth={customSlotWidth}
              intervalUnit={60}
              deviceType={SchedulerDeviceTypeEnum.SWITCH}
              readonly={false}
              isShowTips={true}
            />
          </Form>
        </Provider>
      )

      expect(await screen.findByRole('button', { name: 'See tips' })).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'See tips' }))
      expect(await screen.findByRole('dialog')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    it('should handle drag selection with onSelectionEnd callback', async () => {
    // Setup form and refs
      const { result: formRef } = renderHook(() => {
        return Form.useForm()[0]
      })

      // Initial schedule data
      const scheduler = { ...scheduleResultRAI, mon: ['0', '1', '2'] }

      // Render component
      render(
        <Provider>
          <Form form={formRef.current} onFinish={onApply}>
            <ScheduleCard
              {...props}
              form={formRef.current}
              scheduler={scheduler}
              disabled={false}
              intervalUnit={60}
            />
          </Form>
        </Provider>
      )

      // Find elements to drag between
      const mondayTimeSlot1 = await screen.findByTestId('mon_0')
      const mondayTimeSlot3 = await screen.findByTestId('mon_2')

      // Simulate drag selection
      fireEvent.mouseDown(mondayTimeSlot1)
      fireEvent.mouseMove(mondayTimeSlot3)
      setTimeout(() => fireEvent.mouseUp(mondayTimeSlot3), 100)

      // Verify the form was updated correctly
      const formValues = formRef.current.getFieldsValue()
      expect(formValues.scheduler.mon).toContain('0')
      expect(formValues.scheduler.mon).toContain('1')
      expect(formValues.scheduler.mon).toContain('2')
    })
  })
})
