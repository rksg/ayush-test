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
  venueResponse,
  scheduleResultRAI
} from './__tests__/fixtures'

import { ScheduleWeekly } from '.'


jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyGetTimezoneQuery: () => [jest.fn().mockResolvedValue({
    dstOffset: 3600,
    rawOffset: -28800,
    timeZoneId: 'America/Los_Angeles',
    timeZoneName: 'Pacific Daylight Time'
  })
  ]
}))

const onApply = jest.fn()
describe('ScheduleWeekly', () => {
  const props = {
    venue: venueResponse,
    excludedHours: scheduleResultRAI
  }

  it('should render schedule monday checkbox options successfully (CUSTOM)', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current} onFinish={onApply}>
          <ScheduleWeekly {...props} form={formRef.current} />
        </Form>
      </Provider>)

    const scheduleCheckbox = await screen.findByTestId('checkbox_mon')
    expect(scheduleCheckbox).toBeVisible()
    await userEvent.click(scheduleCheckbox)
    // eslint-disable-next-line max-len
    expect(formRef.current.getFieldsValue()).toEqual({ preferences: { excludedHours: { ...scheduleResultRAI, mon: [] } } })
  })
})
