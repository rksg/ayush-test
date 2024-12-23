import userEvent              from '@testing-library/user-event'
import { Form, FormInstance } from 'antd'
import moment                 from 'moment-timezone'

import { screen, render, renderHook } from '@acx-ui/test-utils'

import { mockIntentContext }                     from '../../__tests__/fixtures'
import { mockedIntentCRRM, mockedIntentCRRMnew } from '../../AIDrivenRRM/__tests__/fixtures'
import { Statuses }                              from '../../states'
import { IntentDetail }                          from '../../useIntentDetailsQuery'
import { useInitialValues }                      from '../../useIntentTransition'

import { getScheduledAt, ScheduleTiming, validateScheduleTiming } from '.'

const { click, selectOptions } = userEvent

jest.mock('../../IntentContext')

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children, ...props
  }: React.PropsWithChildren<{ onChange?: (value: string) => void }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

const renderForm = (children: JSX.Element, form?: FormInstance) => {
  let _form = form || renderHook(() => Form.useForm()[0]).result.current
  const { result: { current: initialValues } } = renderHook(() => useInitialValues())
  const onFinish = jest.fn()
  return {
    form: _form,
    onFinish,
    formRender: render(
      <Form {...{ form: _form, onFinish, initialValues }}>
        {children}
        <button type='submit'>Submit</button>
      </Form>
    )
  }
}

describe('ScheduleTiming', () => {
  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(+new Date('2024-08-12T10:38:00')))
  afterEach(() => jest.restoreAllMocks())

  it.each(
    Object.values(Statuses).filter(
      (status) => status !== Statuses.new && status !== Statuses.scheduled
    )
  )('intent status = "%s" disabled = true, should have no date field and undefined time field',
    async (status) => {
      mockIntentContext({ intent: { ...mockedIntentCRRM, status }, kpis: [] })
      const { form, onFinish } = renderForm(<ScheduleTiming disabled/>)

      expect(screen.queryByPlaceholderText('Select date')).not.toBeInTheDocument()
      expect(await screen.findByPlaceholderText('Select time')).toBeDisabled()

      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(onFinish).toBeCalled()
      const values = form.getFieldsValue()
      expect(values.settings).toEqual({ date: undefined, time: undefined })
    })

  describe('intent status = new/scheduled', () => {
    beforeEach(() =>
      mockIntentContext({ intent: mockedIntentCRRMnew, kpis: [] }))
    it('show date & time & handle selection submission', async () => {
      const { form, onFinish } = renderForm(<ScheduleTiming/>)

      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(onFinish).not.toBeCalled()

      const date = await screen.findByPlaceholderText('Select date')
      await click(date)
      await click(await screen.findByRole('cell', { name: '2024-08-13' }))
      expect(date).toHaveValue('08/13/2024')

      const time = await screen.findByPlaceholderText('Select time')
      await selectOptions(time, '05:30 (UTC+00)')
      expect(time).toHaveValue('5.5')

      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(onFinish).toBeCalled()
      const values = form.getFieldsValue()
      expect({ ...values.settings, date: values.settings.date?.format('YYYY-MM-DD') })
        .toEqual({ date: '2024-08-13', time: '5.5' })
    })
    it('handle selected date & time, then waited past selected time validation', async () => {
      mockIntentContext({
        intent: {
          ...mockedIntentCRRMnew,
          metadata: {
            ...mockedIntentCRRMnew.metadata,
            scheduledAt: '2024-08-12T10:00:00'
          },
          status: Statuses.scheduled
        },
        kpis: []
      })
      const { onFinish } = renderForm(<ScheduleTiming/>)

      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(onFinish).not.toBeCalled()

      expect(
        await screen.findByText('Scheduled time cannot be before 08/12/2024 11:00')
      ).toBeVisible()
    })

    it('handle selected today and some time are disable', async () => {
      renderForm(<ScheduleTiming/>)

      const date = await screen.findByPlaceholderText('Select date')
      await click(date)
      await click(await screen.findByRole('cell', { name: '2024-08-12' }))
      expect(date).toHaveValue('08/12/2024')

      const time = await screen.findByPlaceholderText('Select time')
      await click(time)
      expect(await screen.findByText('05:00 (UTC+00)')).toBeDisabled()
      expect(await screen.findByText('12:00 (UTC+00)')).toBeEnabled()
    })

    it('handle change date clears time field', async () => {
      renderForm(<ScheduleTiming/>)

      const date = await screen.findByPlaceholderText('Select date')
      await click(date)
      await click(await screen.findByRole('cell', { name: '2024-08-13' }))
      expect(date).toHaveValue('08/13/2024')

      const time = await screen.findByPlaceholderText('Select time')
      await selectOptions(time, '12:00 (UTC+00)')
      expect(time).toHaveValue('12')

      await click(date)
      await click(await screen.findByRole('cell', { name: '2024-08-12' }))
      expect(await screen.findByPlaceholderText('Select time')).toHaveValue('')
    })

    it.each([Statuses.new, Statuses.scheduled])(
      'intent status = "%s" disabled = true, should have undefiend date and time fields',
      async (status) => {
        mockIntentContext({
          intent: {
            ...mockedIntentCRRMnew,
            metadata: {
              ...mockedIntentCRRMnew.metadata,
              scheduledAt: '2024-08-12T10:00:00'
            },
            status
          },
          kpis: []
        })
        const { form, onFinish } = renderForm(<ScheduleTiming disabled />)

        expect(await screen.findByPlaceholderText('Select date')).toBeVisible()
        expect(await screen.findByPlaceholderText('Select time')).toBeVisible()

        expect(await screen.findByPlaceholderText('Select date')).toBeDisabled()
        expect(await screen.findByPlaceholderText('Select time')).toBeDisabled()

        await click(await screen.findByRole('button', { name: 'Submit' }))
        expect(onFinish).toBeCalled()
        const values = form.getFieldsValue()
        expect(values.settings).toEqual({ date: undefined, time: undefined })
      }
    )

    it('intent status = new, should have date = current date and time = undefined', async () => {
      const currentDateTime = moment()
      const mockScheduledAt = currentDateTime.toISOString()
      mockIntentContext({
        intent: {
          ...mockedIntentCRRMnew,
          metadata: { ...mockedIntentCRRMnew.metadata, scheduledAt: mockScheduledAt },
          status: Statuses.new
        },
        kpis: []
      })

      renderForm(<ScheduleTiming />)

      const date = await screen.findByPlaceholderText('Select date')
      const time = await screen.findByPlaceholderText('Select time')
      expect(date).toHaveValue(currentDateTime.format('MM/DD/YYYY'))
      expect(time).toHaveValue('')
    })

    it('should reset date and time fields when date field is set to null', async () => {
      const mockScheduledAt = '2024-08-12T10:30:00'
      mockIntentContext({
        intent: {
          ...mockedIntentCRRM,
          metadata: {
            ...mockedIntentCRRM.metadata,
            scheduledAt: mockScheduledAt
          },
          status: Statuses.scheduled
        },
        kpis: []
      })

      const dateName = ['settings', 'date']
      const timeName = ['settings', 'time']
      const { form } = renderForm(<ScheduleTiming />)
      const resetFieldsSpy = jest.spyOn(form, 'resetFields')

      form.setFieldValue(dateName, null)
      renderForm(<ScheduleTiming />, form)

      expect(resetFieldsSpy).toBeCalledWith([dateName, timeName])
      expect(form.getFieldValue(dateName)).toEqual(moment(mockScheduledAt))
      expect(form.getFieldValue(timeName)).toEqual(10.5)
    })
  })

  describe('intent status = active/applyscheduled', () => {
    beforeEach(() =>
      mockIntentContext({ intent: mockedIntentCRRM, kpis: [] }))
    it('show time only & handle selection submission', async () => {
      const { form, onFinish } = renderForm(<ScheduleTiming/>)

      expect(screen.queryByPlaceholderText('Select date')).not.toBeInTheDocument()

      const time = await screen.findByPlaceholderText('Select time')
      await selectOptions(time, '12:00 (UTC+00)')
      expect(time).toHaveValue('12')

      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(onFinish).toBeCalled()
      const values = form.getFieldsValue()
      expect(values.settings).toEqual({ time: '12' })
    })
  })
})

describe('ScheduleTiming.FieldSummary', () => {
  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(+new Date('2024-08-12T10:38:00')))
  afterEach(() => jest.restoreAllMocks())
  describe('intent status = scheduled', () => {
    it('show date + time', async () => {
      mockIntentContext({
        intent: {
          ...mockedIntentCRRMnew,
          status: Statuses.scheduled,
          metadata: { scheduledAt: '2024-08-12T00:00:00' } as IntentDetail['metadata']
        }
      })
      renderForm(<ScheduleTiming.FieldSummary/>)
      expect(await screen.findByText('Date & Time')).toBeVisible()
      // eslint-disable-next-line max-len
      expect(await screen.findByText('The Intent will be scheduled to activate on 08/12/2024. Once active, any identified configuration changes will be applied daily at 00:00.')).toBeVisible()
    })
  })

  describe('intent status = active', () => {
    it('show time only', async () => {
      mockIntentContext({ intent: mockedIntentCRRM, kpis: [] })
      renderForm(<ScheduleTiming.FieldSummary/>)
      expect(await screen.findByText('Time')).toBeVisible()
      // eslint-disable-next-line max-len
      expect(await screen.findByText('Any identified configuration changes will be applied daily at 14:15.')).toBeVisible()
    })
  })
})

describe('getScheduledAt', () => {
  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(+new Date('2024-08-12T10:38:00')))
  describe('intent status = new/scheduled', () => {
    it('returns value with date & time given', () => {
      expect(getScheduledAt({
        status: Statuses.new,
        settings: { date: moment('2024-08-12'), time: 12 }
      }).format()).toEqual('2024-08-12T12:00:00+00:00')
    })
  })

  describe('intent status = active/applyscheduled', () => {
    it('returns value with date & time given', () => {
      expect(getScheduledAt({
        status: Statuses.active,
        settings: { date: moment('2024-08-12'), time: 12 }
      }).format()).toEqual('2024-08-12T12:00:00+00:00')
    })
    it('moves date to tomorrow if scheduledAt < bufferedNow', () => {
      expect(getScheduledAt({
        status: Statuses.active,
        settings: { date: moment('2024-08-12'), time: 5 }
      }).format()).toEqual('2024-08-13T05:00:00+00:00')
    })
  })
})

describe('validateScheduleTiming', () => {
  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(+new Date('2024-08-12T10:38:00')))
  it('handle validate date & time', async () => {
    expect(validateScheduleTiming({
      status: Statuses.new,
      settings: { date: moment('2024-08-12'), time: 12 }
    })).toBeTruthy()
  })
  it('handle date & time in past', async () => {
    expect(validateScheduleTiming({
      status: Statuses.new,
      settings: { date: moment('2024-08-12'), time: 5 }
    })).toBeFalsy()
    expect(await screen.findByText('Scheduled time cannot be before 08/12/2024 11:00'))
      .toBeVisible()
  })
  it('should pass when intent will be paused', async () => {
    expect(validateScheduleTiming({
      status: Statuses.new,
      settings: { date: moment('2024-08-12'), time: 5 },
      preferences: { enable: false }
    })).toBeTruthy()
  })
})
