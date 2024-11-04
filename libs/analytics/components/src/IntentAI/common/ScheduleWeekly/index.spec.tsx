import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  renderHook
} from '@acx-ui/test-utils'

import {
  scheduleResultRAI
} from './__tests__/fixtures'

import { buildExcludedHours, parseExcludedHours, ScheduleWeekly } from '.'

const onApply = jest.fn()
describe('ScheduleWeekly', () => {
  const props = {
    excludedHours: scheduleResultRAI
  }

  it('should data correct parseExcludedHours & buildExcludedHours', async () => {
    expect(scheduleResultRAI).toEqual(buildExcludedHours(parseExcludedHours(scheduleResultRAI)))
    expect(undefined).toEqual(parseExcludedHours(undefined))
  })

  it('should render schedule monday checkbox options successfully (CUSTOM)', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current} onFinish={onApply}>
          <ScheduleWeekly {...props} form={formRef.current} readonly={false}/>
        </Form>
      </Provider>)

    expect(await screen.findByText(/Local time/)).toBeVisible()
    const scheduleCheckbox = await screen.findByTestId('checkbox_mon')
    expect(scheduleCheckbox).toBeVisible()
    expect(scheduleCheckbox).toBeChecked()
    await userEvent.click(scheduleCheckbox)
    // eslint-disable-next-line max-len
    expect(formRef.current.getFieldsValue()).toEqual({ preferences: { excludedHours: { ...scheduleResultRAI, mon: [] } } })
  })

  it('should render schedule monday checkbox options readonly successfully (CUSTOM)', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current} onFinish={onApply}>
          <ScheduleWeekly {...props} form={formRef.current} readonly/>
        </Form>
      </Provider>)

    expect(await screen.findByText(/Local time/)).toBeVisible()
    const scheduleCheckbox = await screen.findByTestId('checkbox_mon')
    expect(scheduleCheckbox).toBeVisible()
    expect(scheduleCheckbox).toBeChecked()
    expect(scheduleCheckbox).toBeDisabled()
    // eslint-disable-next-line max-len
    expect(formRef.current.getFieldsValue()).toEqual({ preferences: { excludedHours: scheduleResultRAI } })
  })
})
