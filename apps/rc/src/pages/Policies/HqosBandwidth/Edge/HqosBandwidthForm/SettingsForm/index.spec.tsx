/* eslint-disable max-len */

import {
  renderHook,
  waitFor,
  within
} from '@testing-library/react'
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
  screen
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
      initialValues={{ trafficClassSettings: getDefaultTrafficClassListData() }}
    >
      <SettingsForm />
    </StepsForm>
  </Provider>
}

describe('QoS Settings Form', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
  })

  it('should correctly render', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}

    />, { route: { params: { tenantId: 't-id' } } })

    await screen.findByText(/Configure the QoS bandwidth settings for each traffic class/i)
    await screen.findByText(/Note: Total guaranteed bandwidth across all classes must NOT exceed 100%. Max bandwidth must exceed minimal guaranteed bandwidth in each class/i)

    expect(screen.getByRole('columnheader', { name: /Traffic Class/i })).toBeTruthy()

    const rows = await screen.findAllByRole('row', { name: /Best effort/i })
    await waitFor(()=>{
      expect(rows.length).toBe(2)
    })
  })

  it('validate bandwidth value range return error', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}

    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await screen.findAllByRole('row', { name: /Video/i })
    const bandwidthElems = await within(rows[0]).findAllByRole('spinbutton')
    await waitFor(()=>{
      expect(bandwidthElems.length).toBe(2)
    })

    await userEvent.type(bandwidthElems[0], '1000')
    const waringSolid = await within(rows[0]).findByTestId('WarningCircleSolid')
    expect(waringSolid).toBeVisible()

  })

  it('validate bandwidth compare return error', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={false}

    />, { route: { params: { tenantId: 't-id' } } })

    const rows = await screen.findAllByRole('row', { name: /Video/i })
    const bandwidthElems = await within(rows[0]).findAllByRole('spinbutton')
    await waitFor(()=>{
      expect(bandwidthElems.length).toBe(2)
    })

    await userEvent.type(bandwidthElems[0], '20')
    await userEvent.type(bandwidthElems[1], '10')
    expect(await within(rows[0]).findByTestId('WarningCircleSolid')).toBeVisible()
  })


  it('should correctly render in edit mode', async () => {

    const { result: stepFormRef } = renderHook(() => useMockedFormHook({
      trafficClassSettings: mockTrafficClassSettings }))

    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    const videoRows = await screen.findAllByRole('row', { name: /Video/i })
    await waitFor(()=>{
      expect(videoRows.length).toBe(2)
    })
    const videoCheckbox1 = within(videoRows[0]).getByRole('checkbox')
    expect(videoCheckbox1).toBeChecked()
    const videoCheckbox2 = within(videoRows[1]).getByRole('checkbox')
    expect(videoCheckbox2).toBeChecked()

    const voiceRows = await screen.findAllByRole('row', { name: /Voice/i })
    const voviceCheckbox1 = within(voiceRows[0]).getByRole('checkbox')
    expect(voviceCheckbox1).not.toBeChecked()
    const voviceCheckbox2 = within(voiceRows[1]).getByRole('checkbox')
    expect(voviceCheckbox2).not.toBeChecked()

    const inputNumberElems = await screen.findAllByRole('spinbutton')
    await waitFor(()=>{
      expect(inputNumberElems.length).toBe(16)
    })
    expect(inputNumberElems[0].getAttribute('value')).toBe('15')
    expect(inputNumberElems[1].getAttribute('value')).toBe('100')
  })

})
