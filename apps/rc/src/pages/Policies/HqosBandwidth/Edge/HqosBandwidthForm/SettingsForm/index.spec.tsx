/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import {
  EdgeHqosProfileFixtures,
  getDefaultTrafficClassListData
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  renderHook,
  within
} from '@acx-ui/test-utils'

import { SettingsForm } from '.'

const { mockTrafficClassSettings } = EdgeHqosProfileFixtures

const mockedSetFieldValue = jest.fn()

const useMockedFormHook = (initData: Record<string, unknown>) => {
  const [ form ] = Form.useForm()
  form.setFieldsValue({
    ...initData
  })
  return form
}

const MockedTargetComponent = (props: Partial<StepsFormProps>) => {
  return <Provider>
    <StepsForm form={props.form}
      editMode={props.editMode}
      initialValues={{ trafficClassSettings: getDefaultTrafficClassListData(), isDefault: false }}
    >
      <SettingsForm />
    </StepsForm>
  </Provider>
}

const MockedDefaultComponent = (props: Partial<StepsFormProps>) => {
  return <Provider>
    <StepsForm form={props.form}
      editMode={props.editMode}
      initialValues={{ trafficClassSettings: getDefaultTrafficClassListData(), isDefault: true }}
    >
      <SettingsForm />
    </StepsForm>
  </Provider>
}

describe('HQoS Settings Form', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
  })

  it('should correctly render', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}

    />, { route: { params: { tenantId: 't-id' } } })

    expect(screen.getByText(/Configure the HQoS bandwidth settings for each traffic class/i)).toBeVisible()
    expect(screen.getByText(/Note: Total guaranteed bandwidth across all classes must NOT exceed 100%. Max bandwidth must exceed minimal guaranteed bandwidth in each class/i)).toBeVisible()

    expect(screen.getByRole('columnheader', { name: /Traffic Class/i })).toBeTruthy()

    await screen.findByRole('row', { name: /Best effort High/i })
    expect(screen.getByText(/Remaining:14%/i)).toBeVisible()
  })

  it('validate bandwidth value range return error', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}

    />, { route: { params: { tenantId: 't-id' } } })

    const row = await screen.findByRole('row', { name: /Video High/i })
    const bandwidthElems = within(row).getAllByRole('spinbutton')
    expect(bandwidthElems.length).toBe(2)

    await userEvent.clear(bandwidthElems[0])
    await userEvent.type(bandwidthElems[0], '0')
    const waringSolid = await within(row).findByTestId('WarningCircleSolid')
    expect(waringSolid).toBeVisible()
  })

  it('validate bandwidth compare return error', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}

    />, { route: { params: { tenantId: 't-id' } } })

    const row = await screen.findByRole('row', { name: /Video High/i })
    const bandwidthElems = within(row).getAllByRole('spinbutton')
    expect(bandwidthElems.length).toBe(2)

    await userEvent.type(bandwidthElems[0], '20')
    await userEvent.type(bandwidthElems[1], '10')
    expect(await within(row).findByTestId('WarningCircleSolid')).toBeVisible()
  })

  it('should correctly render in edit mode', async () => {

    const { result: stepFormRef } = renderHook(() => useMockedFormHook({
      trafficClassSettings: mockTrafficClassSettings }))

    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await screen.findAllByRole('row')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_header, row1, row2, row3, row4] = rows

    expect(row1).toHaveTextContent(/VideoHigh/i)
    expect(row2).toHaveTextContent(/Video/i)
    const videoCheckbox1 = within(row1).getByRole('checkbox')
    expect(videoCheckbox1).toBeChecked()
    const videoCheckbox2 = within(row2).getByRole('checkbox')
    expect(videoCheckbox2).toBeChecked()

    expect(row3).toHaveTextContent(/Voice/i)
    const voiceCheckbox1 = within(row3).getByRole('checkbox')
    expect(voiceCheckbox1).not.toBeChecked()
    const voiceCheckbox2 = within(row4).getByRole('checkbox')
    expect(voiceCheckbox2).not.toBeChecked()

    const row1NumInputs = within(row1).getAllByRole('spinbutton')
    const row1MinBandwidth = row1NumInputs[0]
    const row1MaxBandwidth = row1NumInputs[1]
    expect(row1MinBandwidth.getAttribute('value')).toBe('15')
    expect(row1MaxBandwidth.getAttribute('value')).toBe('100')

    const minBandwidthArray = mockTrafficClassSettings?.map((item) => item?.minBandwidth)
    const minBandwidthSum = minBandwidthArray?.reduce((a, b) => (a??0) + (b??0)) ?? 0 as number
    const remaining = 100 - minBandwidthSum
    expect(screen.getByText(`Remaining:${remaining}%`)).toBeVisible()
  })

  it('all fields should be grey out when it is default profile', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedDefaultComponent
      form={stepFormRef.current}
      editMode={false}

    />, { route: { params: { tenantId: 't-id' } } })

    expect(screen.getByText(/Configure the HQoS bandwidth settings for each traffic class/i)).toBeVisible()

    expect(screen.getByRole('columnheader', { name: /Traffic Class/i })).toBeTruthy()
    await screen.findByRole('row', { name: /Best effort High/i })
    screen.getAllByRole('textbox').forEach(item => {
      expect(item).toBeDisabled()
    })
    screen.getAllByRole('spinbutton').forEach(item => {
      expect(item).toBeDisabled()
    })
  })

})
