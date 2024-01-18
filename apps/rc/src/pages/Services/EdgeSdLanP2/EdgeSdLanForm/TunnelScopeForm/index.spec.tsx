/* eslint-disable max-len */
import { act, renderHook, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent                                                       from '@testing-library/user-event'
import { Form }                                                        from 'antd'
import { rest }                                                        from 'msw'

import { StepsForm }                                                    from '@acx-ui/components'
import { networkApi, tunnelProfileApi }                                 from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeTunnelProfileFixtures, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockDeepNetworkList, mockNetworkSaveData } from '../../__tests__/fixtures'

import { TunnelScopeForm } from '.'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    options,
    loading,
    ...props
  }: React.PropsWithChildren<{
    options: Array<{ label: string, value: unknown }>,
    loading: boolean,
    onChange?: (value: string) => void }>) => {
    return (loading
      ? <div role='img' data-testid='loadingIcon'>Loading</div>
      : <select {...props}
        onChange={(e) => {
          props.onChange?.(e.target.value)}
        }>
        {/* Additional <option> to ensure it is possible to reset value to empty */}
        <option value={undefined}></option>
        {children}
        {options?.map((option, index) => (
          <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
        ))}
      </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

const mockedSetFieldValue = jest.fn()
const { click } = userEvent
const {
  mockedTunnelProfileViewData
} = EdgeTunnelProfileFixtures
const useMockedFormHook = () => {
  const [ form ] = Form.useForm()
  form.setFieldValue('venueId', 'venue_00002')
  form.setFieldValue('venueName', 'airport')
  return form
}

describe('Tunnel Scope Form', () => {
  const mockedGetNetworkDeepList = jest.fn()

  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockedGetNetworkDeepList.mockReset()

    store.dispatch(tunnelProfileApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (_req, res, ctx) => res(ctx.json(mockNetworkSaveData))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (_req, res, ctx) => {
          mockedGetNetworkDeepList()
          return res(ctx.json(mockDeepNetworkList))
        }
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      )
    )
  })

  it('should correctly render', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)

    render(
      <Provider>
        <StepsForm form={stepFormRef.current} editMode={true}>
          <TunnelScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile (AP- Cluster tunnel)' }),
      'tunnelProfileId2')

    await screen.findByText(/Enable the networks that will tunnel the traffic to the selected cluster/i)
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
          <TunnelScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    await screen.findByText(/Enable the networks that will tunnel the traffic to the selected cluster/i)
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
          <TunnelScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(rows.length).toBe(3)
    expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual()

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
          <TunnelScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
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
          <TunnelScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(rows.length).toBe(3)
    await click(await screen.findByRole('button', { name: /Add/i }))
    const actualVal = stepFormRef.current.getFieldValue('activatedNetworks')
    expect(actualVal).toStrictEqual([])
  })
})
