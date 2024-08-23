import '@testing-library/jest-dom'

import userEvent          from '@testing-library/user-event'
import { Form }           from 'antd'
import moment, { Moment } from 'moment-timezone'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import { DateTimeDropdown } from '.'

const { click, selectOptions } = userEvent

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


describe('DateTimeDropdown', () => {
  const name = 'field'
  const labels = {
    date: 'This is Date Label',
    time: 'This is Time Label'
  }

  const renderForm = (
    children: JSX.Element,
    initialValues?: { date: Moment, time?: string }
  ) => {
    const { result: { current: form } } = renderHook(() => Form.useForm()[0])
    const onFinish = jest.fn()
    return {
      form,
      onFinish,
      formRender: render(<Form
        {...{ form, onFinish }}
        initialValues={{ [name]: initialValues }}
      >
        {children}
        <button type='submit'>Submit</button>
      </Form>)
    }
  }

  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(+new Date('2024-08-12T10:38:00')))
  afterEach(() => jest.restoreAllMocks())

  it('handle date & time selection', async () => {
    const { form, onFinish } = renderForm(<DateTimeDropdown
      name={name}
      dateLabel={labels.date}
      timeLabel={labels.time}
    />)

    const date = await screen.findByRole('textbox', { name: labels.date })

    await click(await screen.findByRole('button', { name: 'Submit' }))
    expect(onFinish).not.toBeCalled()

    await click(date)
    await click(await screen.findByRole('cell', { name: '2024-08-13' }))
    expect(date).toHaveValue('2024-08-13')

    await selectOptions(
      await screen.findByRole('combobox', { name: labels.time }),
      '05:30 (UTC+00)'
    )
    expect(await screen.findByRole('combobox', { name: labels.time })).toHaveValue('5.5')

    await click(await screen.findByRole('button', { name: 'Submit' }))

    expect(onFinish).toBeCalled()
    let values = form.getFieldsValue()[name]

    expect({ ...values, date: values.date?.format('YYYY-MM-DD') })
      .toEqual({ date: '2024-08-13', time: '5.5' })
  })

  it('clears time on date change', async () => {
    const { form } = renderForm(<DateTimeDropdown
      name={name}
      dateLabel={labels.date}
      timeLabel={labels.time}
    />, { date: moment('2024-08-13T00:00:00.000Z'), time: '5.5' })

    // simulate auto clear of time when date change
    await click(await screen.findByRole('textbox', { name: labels.date }))
    await click(await screen.findByRole('cell', { name: '2024-08-12' }))

    expect(await screen.findByRole('combobox', { name: labels.time })).not.toHaveValue('5.5')

    const values = form.getFieldsValue()[name]

    expect({ ...values, date: values.date?.format('YYYY-MM-DD') })
      .toEqual({ date: '2024-08-12', time: undefined })
  })

  it('handle time disabling', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(+new Date('2024-08-12T10:38:00'))
    renderForm(<DateTimeDropdown
      name={name}
      dateLabel={labels.date}
      timeLabel={labels.time}
    />, { date: moment('2024-08-12T00:00:00.000Z') })

    expect(await screen.findByRole('option', { name: '10:30 (UTC+00)' })).toBeDisabled()
    expect(await screen.findByRole('option', { name: '10:45 (UTC+00)' })).not.toBeDisabled()
  })
})
