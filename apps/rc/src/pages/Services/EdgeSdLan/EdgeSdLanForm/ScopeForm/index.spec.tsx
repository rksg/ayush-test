/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }       from '@acx-ui/components'
import { networkApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { getSdLanFormDefaultValues }                from '..'
import { mockDeepNetworkList, mockNetworkSaveData } from '../../__tests__/fixtures'

import { ScopeForm } from '.'

const mockedSetFieldValue = jest.fn()
const { click } = userEvent
const useMockedFormHook = () => {
  const [ form ] = Form.useForm()
  const defaultVals = getSdLanFormDefaultValues()
  form.setFieldsValue({
    ...defaultVals,
    venueId: 'venue_00002',
    venueName: 'airport'
  })
  return form
}

describe('Scope Form', () => {

  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_, res, ctx) => res(ctx.json(mockNetworkSaveData))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json(mockDeepNetworkList))
      )
    )
  })

  it('should correctly render', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(
      <Provider>
        <StepsForm
          form={stepFormRef.current}
          editMode={true}
        >
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const title = await screen.findByText(/Activate networks for the SD-LAN service on the venue/i)
    expect(title.textContent).toBe('Activate networks for the SD-LAN service on the venue (airport):')
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(rows.length).toBe(3)
    expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual([])
  })

  it('should correctly render in edit mode', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    const mockedNetworkIds = ['network_1', 'network_2']
    act(() => {
      stepFormRef.current
        .setFieldValue('activatedNetworks', mockedNetworkIds.map(id => ({ id })))
    })

    render(
      <Provider>
        <StepsForm
          form={stepFormRef.current}
          editMode={true}
          initialValues={{
            networkIds: mockedNetworkIds
          }}
        >
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const title = await screen.findByText(/Activate networks for the SD-LAN service on the venue/i)
    expect(title.textContent).toBe('Activate networks for the SD-LAN service on the venue (airport):')
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(rows.length).toBe(3)
    await waitFor(() =>
      expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual([
        { id: 'network_1' },
        { id: 'network_2' }
      ]))

    const switchBtn = within(await screen.findByRole('row', { name: /MockedNetwork 1/i })).getByRole('switch')
    const switchBtn2 = within(await screen.findByRole('row', { name: /MockedNetwork 2/i })).getByRole('switch')
    expect(switchBtn).toBeChecked()
    expect(switchBtn2).toBeChecked()
  })

  it('should correctly activate by switcher', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

    render(
      <Provider>
        <StepsForm form={stepFormRef.current}>
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(rows.length).toBe(3)
    expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual([])
    await click(
      within(await screen.findByRole('row', { name: /MockedNetwork 2/i })).getByRole('switch'))

    expect(mockedSetFieldValue).toBeCalledWith('activatedNetworks', [
      { name: 'MockedNetwork 2', id: 'network_2' }
    ])
  })

  it('should correctly deactivate by switch', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    act(() => {
      stepFormRef.current.setFieldValue('activatedNetworks', [
        { name: 'MockedNetwork 1', id: 'network_1' },
        { name: 'MockedNetwork 2', id: 'network_2' }
      ])
    })
    jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

    render(
      <Provider>
        <StepsForm form={stepFormRef.current}>
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(rows.length).toBe(3)
    const switchBtn = within(await screen.findByRole('row', { name: /MockedNetwork 1/i })).getByRole('switch')
    expect(switchBtn).toBeChecked()
    await click(switchBtn)

    expect(mockedSetFieldValue).toBeCalledWith('activatedNetworks', [
      { name: 'MockedNetwork 2', id: 'network_2' }
    ])
  })

  it('activatedNetworks will be default into [] when networkId is not touched in create mode', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

    render(
      <Provider>
        <StepsForm form={stepFormRef.current}>
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(rows.length).toBe(3)
    await click(await screen.findByRole('button', { name: /Add/i }))
    const actualVal = stepFormRef.current.getFieldValue('activatedNetworks')
    expect(actualVal).toStrictEqual([])
  })
})
