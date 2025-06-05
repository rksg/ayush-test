import '@testing-library/jest-dom'
import { renderHook }  from '@testing-library/react'
import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'
import { rest }        from 'msw'

import { switchApi }                                             from '@acx-ui/rc/services'
import { SwitchPortViewModel }                                   from '@acx-ui/rc/switch/utils'
import { CommonRbacUrlsInfo, CommonUrlsInfo, SchedulerTypeEnum } from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockScheduler, portDataResponse, timezoneResponse, venueResponse } from './__tests__/fixtures'

import { PoeSchedule } from './index'

// Mock the hooks
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: () => true,
  Features: {
    G_MAP: 'g_map'
  }
}))

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: () => ({
    tenantId: 'tenant-123'
  })
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  ScheduleCard: ({
    type,
    scheduler,
    fieldNamePath,
    intervalUnit,
    title,
    loading,
    isShowTips,
    prefix,
    timelineLabelTop,
    isShowTimezone,
    venue,
    readonly,
    disabled,
    deviceType,
    slotWidth
  }: {
    type: string
    scheduler?: {
      mon?: string[]
      tue?: string[]
      wed?: string[]
      thu?: string[]
      fri?: string[]
      sat?: string[]
      sun?: string[]
    }
    fieldNamePath?: string[]
    intervalUnit?: number
    title?: string
    loading?: boolean
    isShowTips?: boolean
    prefix?: boolean
    timelineLabelTop?: boolean
    isShowTimezone?: boolean
    venue?: { name: string }
    readonly?: boolean
    disabled?: boolean
    deviceType?: string
    slotWidth?: number
  }) => (
    <div
      data-testid='schedule-card'
      data-type={type}
      data-field-name-path={fieldNamePath?.join('.')}
      data-interval-unit={intervalUnit}
      data-title={title}
      data-loading={loading}
      data-show-tips={isShowTips}
      data-prefix={prefix}
      data-timeline-label-top={timelineLabelTop}
      data-show-timezone={isShowTimezone}
      data-venue-name={venue?.name}
      data-readonly={readonly}
      data-disabled={disabled}
      data-device-type={deviceType}
      data-slot-width={slotWidth}
    >
      Schedule Card Mock
      {scheduler && <div data-testid='scheduler-data'>{JSON.stringify(scheduler)}</div>}
      <div data-testid='checkbox_mon' role='checkbox' aria-checked={false} />
      <div data-testid='checkbox_tue' role='checkbox' aria-checked={false} />
      <div data-testid='checkbox_wed' role='checkbox' aria-checked={false} />
      <div data-testid='checkbox_thu' role='checkbox' aria-checked={false} />
      <div data-testid='checkbox_fri' role='checkbox' aria-checked={false} />
      <div data-testid='checkbox_sat' role='checkbox' aria-checked={false} />
      <div data-testid='checkbox_sun' role='checkbox' aria-checked={false} />
    </div>
  )
}))

const mockedSavePortsSetting = jest.fn().mockImplementation(() => ({
  unwrap: jest.fn()
}))
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useSavePortsSettingMutation: () => [
    mockedSavePortsSetting, { reset: jest.fn() }
  ]
}))

describe('PoeSchedule', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockedSavePortsSetting.mockClear()
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getTimezone.url.split('?')[0],
        (_, res, ctx) => {
          return res(ctx.json(timezoneResponse))
        }),
      rest.get(
        CommonRbacUrlsInfo.getVenue.url,
        (_, res, ctx) => {
          return res(ctx.json(venueResponse))
        })
    )
  })

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should render PoeSchedule dialog successfully', async () => {
    const setVisible = jest.fn()
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]

    const setFieldValueSpy = jest.spyOn(form, 'setFieldValue')

    render(
      <Provider>
        <PoeSchedule
          form={form}
          visible={true}
          setVisible={setVisible}
          venueId='venue-123'
          poeScheduler={{ type: SchedulerTypeEnum.NO_SCHEDULE }}
        />
      </Provider>
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const noScheduleRadio = await screen.findByRole('radio', { name: 'No Schedule' })
    const customScheduleRadio = await screen.findByRole('radio', { name: 'Custom Schedule' })

    expect(noScheduleRadio).toBeChecked()
    expect(customScheduleRadio).not.toBeChecked()

    await userEvent.click(customScheduleRadio)
    expect(customScheduleRadio).toBeChecked()

    jest.spyOn(form, 'getFieldsValue').mockReturnValue({
      scheduler: {
        mon: Array.from({ length: 24 }, (_, i) => `mon_${i}`),
        tue: Array.from({ length: 24 }, (_, i) => `tue_${i}`),
        wed: Array.from({ length: 24 }, (_, i) => `wed_${i}`),
        thu: Array.from({ length: 24 }, (_, i) => `thu_${i}`),
        fri: Array.from({ length: 24 }, (_, i) => `fri_${i}`),
        sat: Array.from({ length: 24 }, (_, i) => `sat_${i}`),
        sun: Array.from({ length: 24 }, (_, i) => `sun_${i}`)
      },
      poeSchedulerType: SchedulerTypeEnum.CUSTOM
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    expect(setFieldValueSpy).toHaveBeenCalledWith(
      'poeScheduler',
      {
        type: SchedulerTypeEnum.CUSTOM,
        mon: '111111111111111111111111',
        tue: '111111111111111111111111',
        wed: '111111111111111111111111',
        thu: '111111111111111111111111',
        fri: '111111111111111111111111',
        sat: '111111111111111111111111',
        sun: '111111111111111111111111'
      }
    )

    setFieldValueSpy.mockRestore()
  })

  it('should show error message when no time slots are selected', async () => {
    const setVisible = jest.fn()
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]

    render(
      <Provider>
        <PoeSchedule
          form={form}
          visible={true}
          setVisible={setVisible}
          venueId='venue-123'
          poeScheduler={{ type: SchedulerTypeEnum.NO_SCHEDULE }}
        />
      </Provider>
    )

    jest.spyOn(form, 'getFieldsValue').mockReturnValue({
      scheduler: {
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: []
      },
      poeSchedulerType: SchedulerTypeEnum.CUSTOM
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('Please select at least 1 time slot')).toBeVisible()
  })

  it('should show schedule in readonly mode', async () => {
    const setVisible = jest.fn()
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]

    render(
      <Provider>
        <PoeSchedule
          form={form}
          visible={true}
          setVisible={setVisible}
          venueId='venue-123'
          poeScheduler={mockScheduler}
          readOnly={true}
        />
      </Provider>
    )

    expect(await screen.findByText('Preview PoE Schedule')).toBeInTheDocument()

    const editButton = await screen.findByRole('button', { name: 'Edit PoE Schedule' })
    expect(editButton).toBeVisible()

    await userEvent.click(editButton)

    expect(await screen.findByRole('radio', { name: 'Custom Schedule' })).toBeVisible()

    expect(await screen.findByRole('button', { name: 'Apply' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  it('should save port settings with no schedule', async () => {
    const setVisible = jest.fn()
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]

    form.resetFields = jest.fn()
    form.setFieldValue = jest.fn()

    render(
      <Provider>
        <PoeSchedule
          form={form}
          visible={true}
          setVisible={setVisible}
          venueId='venue-123'
          poeScheduler={{ type: SchedulerTypeEnum.NO_SCHEDULE }}
        />
      </Provider>
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const noScheduleRadio = await screen.findByRole('radio', { name: 'No Schedule' })
    expect(noScheduleRadio).toBeChecked()
    jest.spyOn(form, 'getFieldsValue').mockReturnValue({
      scheduler: {
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: []
      },
      poeSchedulerType: SchedulerTypeEnum.NO_SCHEDULE
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(form.setFieldValue).toHaveBeenCalledWith('poeScheduler',
      { type: SchedulerTypeEnum.NO_SCHEDULE })
  })

  it('should save port settings when port data is provided', async () => {
    const setVisible = jest.fn()
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]

    render(
      <Provider>
        <PoeSchedule
          form={form}
          visible={true}
          setVisible={setVisible}
          venueId='venue-123'
          poeScheduler={mockScheduler}
          portData={portDataResponse as unknown as SwitchPortViewModel}
        />
      </Provider>
    )

    const getFieldsValueSpy = jest.spyOn(form, 'getFieldsValue').mockReturnValue({
      scheduler: {
        mon: ['mon_0', 'mon_1', 'mon_2'],
        tue: ['tue_0', 'tue_1', 'tue_2'],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: []
      },
      poeSchedulerType: SchedulerTypeEnum.CUSTOM
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(mockedSavePortsSetting).toHaveBeenCalled()
    expect(mockedSavePortsSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        enableRbac: true,
        params: {
          tenantId: 'tenant-123',
          venueId: 'venue-123'
        },
        payload: expect.arrayContaining([
          expect.objectContaining({
            poeScheduler: {
              type: SchedulerTypeEnum.CUSTOM,
              mon: '111000000000000000000000',
              tue: '111000000000000000000000',
              wed: '000000000000000000000000',
              thu: '000000000000000000000000',
              fri: '000000000000000000000000',
              sat: '000000000000000000000000',
              sun: '000000000000000000000000'
            }
          })
        ])
      })
    )
    getFieldsValueSpy.mockRestore()
  })

  it('should handle day checkbox selections correctly', async () => {
    const setVisible = jest.fn()
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]

    render(
      <Provider>
        <PoeSchedule
          form={form}
          visible={true}
          setVisible={setVisible}
          venueId='venue-123'
          poeScheduler={{ type: SchedulerTypeEnum.CUSTOM }}
        />
      </Provider>
    )

    jest.spyOn(form, 'getFieldsValue').mockReturnValue({
      scheduler: {
        mon: Array.from({ length: 23 }, (_, i) => `mon_${i+1}`),
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: []
      },
      poeSchedulerType: SchedulerTypeEnum.CUSTOM
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })

  it('should cancel and close the dialog without saving', async () => {
    const setVisible = jest.fn()
    const { result } = renderHook(() => Form.useForm())
    const form = result.current[0]

    render(
      <Provider>
        <PoeSchedule
          form={form}
          visible={true}
          setVisible={setVisible}
          venueId='venue-123'
          poeScheduler={mockScheduler}
        />
      </Provider>
    )

    const customScheduleRadio = await screen.findByRole('radio', { name: 'Custom Schedule' })
    await userEvent.click(customScheduleRadio)

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })
})