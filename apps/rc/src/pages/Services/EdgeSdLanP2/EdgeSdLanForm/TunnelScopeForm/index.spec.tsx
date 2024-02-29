/* eslint-disable max-len */
import {
  renderHook,
  waitFor,
  //waitForElementToBeRemoved,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm, StepsFormProps }                                                    from '@acx-ui/components'
import { networkApi, tunnelProfileApi }                                                 from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeTunnelProfileFixtures, TunnelProfileUrls, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { Provider, store }                                                              from '@acx-ui/store'
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
        {children}
        {options?.map((option, index) => (
          <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
        ))}
      </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue('ecc2d7cf9d2342fdb31ae0e24958fcac')
}))
const mockedSetFieldValue = jest.fn()
const { click } = userEvent

const mockedTunnelProfileViewDataNoDefault = {
  data: EdgeTunnelProfileFixtures.mockedTunnelProfileViewData.data.filter(item =>
    item.id !== 'SLecc2d7cf9d2342fdb31ae0e24958fcac')
}
const mockedTunnelProfileViewData = {
  data: EdgeTunnelProfileFixtures.mockedTunnelProfileViewData.data.concat([
    {
      id: 'tunnelProfileId3',
      name: 'tunnelProfile3',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      ageTimeMinutes: 30,
      forceFragmentation: false,
      personalIdentityNetworkIds: [],
      networkIds: ['network2'],
      sdLanIds: ['sdlan1', 'sdlan2'],
      type: TunnelTypeEnum.VLAN_VXLAN
    }
  ])
}
const useMockedFormHook = (initData: Record<string, unknown>) => {
  const [ form ] = Form.useForm()
  form.setFieldsValue({
    venueId: 'venue_00002',
    venueName: 'airport',
    ...initData
  })
  return form
}

const MockedTargetComponent = (props: Partial<StepsFormProps>) => {
  return <Provider>
    <StepsForm form={props.form} editMode={props.editMode} >
      <TunnelScopeForm />
    </StepsForm>
  </Provider>
}

const services = require('@acx-ui/rc/services')

describe('Tunnel Scope Form', () => {
  const mockedGetNetworkDeepList = jest.fn()

  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockedGetNetworkDeepList.mockReset()

    store.dispatch(tunnelProfileApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    services.useVenueNetworkActivationsDataListQuery = jest.fn().mockImplementation(() => {
      mockedGetNetworkDeepList()
      return {
        networkList: mockDeepNetworkList.response,
        isLoading: false,
        isFetching: false
      }
    })

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
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile (AP- Cluster tunnel)' }),
      'tunnelProfile3')

    await screen.findByText(/Enable the networks that will tunnel the traffic to the selected cluster/i)
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(rows.length).toBe(4)
    expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual(undefined)
  })

  it('should correctly render when default tunnel not exist', async () => {
    mockServer.use(
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewDataNoDefault))
      )
    )
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile (AP- Cluster tunnel)' }),
      'Default tunnel profile (SD-LAN)')

    await screen.findByText(/Enable the networks that will tunnel the traffic to the selected cluster/i)
    await screen.findByRole('row', { name: /MockedNetwork 4/i })
    expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual(undefined)
  })

  it('should correctly render in edit mode', async () => {
    const mockedNetworkIds = ['network_1', 'network_2']
    const { result: stepFormRef } = renderHook(() => useMockedFormHook({
      activatedNetworks: mockedNetworkIds.map(id => ({ id }))
    }))

    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={true}
      initialValues={{
        networkIds: mockedNetworkIds
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    await screen.findByText(/Enable the networks that will tunnel the traffic to the selected cluster/i)
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    await waitFor(() =>
      expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual([
        { id: 'network_1' },
        { id: 'network_2' }
      ]))

    expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
    const switchBtn = within(rows[1]).getByRole('switch')
    expect(within(rows[1]).getByRole('cell', { name: /MockedNetwork 2/i })).toBeVisible()
    const switchBtn2 = within(rows[1]).getByRole('switch')
    expect(switchBtn).toBeChecked()
    expect(switchBtn2).toBeChecked()
  })

  it('should correctly activate by switcher', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

    render(<MockedTargetComponent
      form={stepFormRef.current}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    //await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual(undefined)
    expect(within(rows[1]).getByRole('cell', { name: /MockedNetwork 2/i })).toBeVisible()
    await click(within(rows[1]).getByRole('switch'))

    expect(mockedSetFieldValue).toBeCalledWith('activatedNetworks', [
      { name: 'MockedNetwork 2', id: 'network_2' }
    ])
  })

  it('should correctly deactivate by switch', async () => {
    const { result: stepFormRef } = renderHook(() => useMockedFormHook({
      activatedNetworks: [
        { name: 'MockedNetwork 1', id: 'network_1' },
        { name: 'MockedNetwork 2', id: 'network_2' }
      ]
    }))
    jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

    render(<MockedTargetComponent
      form={stepFormRef.current}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
    expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
    const switchBtn = within(rows[0]).getByRole('switch')
    expect(switchBtn).toBeChecked()
    await click(switchBtn)

    expect(mockedSetFieldValue).toBeCalledWith('activatedNetworks', [
      { name: 'MockedNetwork 2', id: 'network_2' }
    ])
  })

  it('activatedNetworks will be default into undefined when networkId is not touched in create mode', async () => {
    const { result: stepFormRef } = renderHook(useMockedFormHook)
    jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

    render(<MockedTargetComponent
      form={stepFormRef.current}
    />, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
    await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
    await screen.findAllByRole('row', { name: /MockedNetwork/i })
    const formFoot = await screen.findByTestId('steps-form-actions')

    await click(await within(formFoot).findByRole('button', { name: 'Add' }))
    const actualVal = stepFormRef.current.getFieldValue('activatedNetworks')
    expect(actualVal).toStrictEqual(undefined)
  })

  describe('guest tunnel enabled', () => {
    it('should correctly display', async () => {
      const { result: stepFormRef } = renderHook(() => useMockedFormHook({
        isGuestTunnelEnabled: true,
        activatedNetworks: [
          { name: 'MockedNetwork 1', id: 'network_1' },
          { name: 'MockedNetwork 4', id: 'network_4' }
        ],
        activatedGuestNetworks: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ]
      }))
      jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

      render(<MockedTargetComponent
        form={stepFormRef.current}
      />, { route: { params: { tenantId: 't-id' } } })

      expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
      await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
      const dmzTunnelSelector = await screen.findByRole('combobox', { name: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' })
      const opts = await within(dmzTunnelSelector).findAllByRole('option')
      expect(opts.length).toBe(1)
      screen.queryByRole('option', { name: 'tunnelProfileId1' })
      // only Manual mode can be options for DMZ tunnel
      expect(screen.queryByRole('option', { name: 'tunnelProfileId2' })).toBeNull()
      await userEvent.selectOptions(dmzTunnelSelector, 'tunnelProfileId1')

      const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
      expect(rows.length).toBe(4)
      expect(within(rows[0]).getByRole('cell', { name: /MockedNetwork 1/i })).toBeVisible()
      const switchBtns = within(rows[0]).getAllByRole('switch')
      expect(switchBtns.length).toBe(1)
      expect(switchBtns[0]).toBeChecked()

      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const captivePortalSwitchBtns = within(rows[3]).getAllByRole('switch')
      expect(captivePortalSwitchBtns.length).toBe(2)
      captivePortalSwitchBtns.forEach(item => {
        expect(item).toBeChecked()
      })
    })

    it('guest tunnel network should default true when is captivePortal network', async () => {
      const { result: stepFormRef } = renderHook(() => useMockedFormHook({
        isGuestTunnelEnabled: true
      }))
      jest.spyOn(stepFormRef.current, 'setFieldsValue').mockImplementation(mockedSetFieldValue)

      render(<MockedTargetComponent
        form={stepFormRef.current}
      />, { route: { params: { tenantId: 't-id' } } })

      expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
      await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
      const dmzTunnelSelector = await screen.findByRole('combobox', { name: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' })
      const opts = await within(dmzTunnelSelector).findAllByRole('option')
      expect(opts.length).toBe(1)

      const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
      expect(rows.length).toBe(4)

      // when turn on DC captive portal network DMZ network should be ON by default
      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const switchBtns = within(rows[3]).getAllByRole('switch')
      switchBtns.forEach((switchBtn) => {
        expect(switchBtn).not.toBeChecked()
      })
      await click(switchBtns[0])

      expect(mockedSetFieldValue).toBeCalledWith({
        activatedNetworks: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ],
        activatedGuestNetworks: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ]
      })
    })

    it('data network should be true when enable guest captivePortal network', async () => {
      const { result: stepFormRef } = renderHook(() => useMockedFormHook({
        isGuestTunnelEnabled: true
      }))
      jest.spyOn(stepFormRef.current, 'setFieldsValue').mockImplementation(mockedSetFieldValue)

      render(<MockedTargetComponent
        form={stepFormRef.current}
      />, { route: { params: { tenantId: 't-id' } } })

      expect(await screen.findByText('Tunnel & Network Settings')).toBeVisible()
      await waitFor(() => expect(mockedGetNetworkDeepList).toBeCalled())
      const dmzTunnelSelector = await screen.findByRole('combobox', { name: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' })
      const opts = await within(dmzTunnelSelector).findAllByRole('option')
      expect(opts.length).toBe(1)

      const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
      expect(rows.length).toBe(4)

      // when turn on DC captive portal network DMZ network should be ON by default
      expect(within(rows[3]).getByRole('cell', { name: /MockedNetwork 4/i })).toBeVisible()
      const switchBtns = within(rows[3]).getAllByRole('switch')
      switchBtns.forEach((switchBtn) => {
        expect(switchBtn).not.toBeChecked()
      })
      await click(switchBtns[1])

      expect(mockedSetFieldValue).toBeCalledWith({
        activatedNetworks: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ],
        activatedGuestNetworks: [
          { name: 'MockedNetwork 4', id: 'network_4' }
        ]
      })
    })
  })
})
