/* eslint-disable max-len */
import {
  renderHook,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm, StepsFormProps }  from '@acx-ui/components'
import { tunnelProfileApi, venueApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EdgeTunnelProfileFixtures,
  TunnelProfileUrls,
  TunnelTypeEnum,
  EdgeSdLanFixtures
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedVenueList }                            from '../../__tests__/fixtures'
import { EdgeMvSdLanContext, EdgeMvSdLanContextType } from '../EdgeMvSdLanContextProvider'

import { TunnelNetworkForm } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

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

jest.mock('./VenueNetworkTable/NetworksDrawer.tsx', () => ({
  ...jest.requireActual('./VenueNetworkTable/NetworksDrawer.tsx'),
  NetworksDrawer: () => <div data-testid='NetworksDrawer' />
}))

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

const edgeMvSdlanContextValues = {
  allSdLans: mockedMvSdLanDataList
} as EdgeMvSdLanContextType

const useMockedFormHook = (initData: Record<string, unknown>) => {
  const [ form ] = Form.useForm()
  form.setFieldsValue({
    venueId: 'venue_00002',
    venueName: 'airport',
    ...initData
  })
  return form
}

type MockedTargetComponentType = Pick<StepsFormProps, 'form' | 'editMode' | 'initialValues'> & {
  ctxValues?: EdgeMvSdLanContextType
}
const MockedTargetComponent = (props: MockedTargetComponentType) => {
  const { form, editMode, initialValues, ctxValues } = props
  return <Provider>
    <EdgeMvSdLanContext.Provider value={ctxValues ?? edgeMvSdlanContextValues}>
      <StepsForm form={form} editMode={editMode} initialValues={initialValues}>
        <TunnelNetworkForm />
      </StepsForm>
    </EdgeMvSdLanContext.Provider>
  </Provider>
}

describe('Tunneled Venue Networks Form', () => {
  beforeEach(() => {
    store.dispatch(tunnelProfileApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(mockedVenueList))
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

    await basicCheck()
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile (AP- Cluster tunnel)' }),
      'tunnelProfile3')
    expect(stepFormRef.current.getFieldValue('tunnelProfileName')).toBe('tunnelProfile3')
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

    await basicCheck()
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile (AP- Cluster tunnel)' }),
      'Default tunnel profile (SD-LAN)')

    expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual(undefined)
  })

  it('should correctly render in edit mode', async () => {
    const mockedNetworkIds = ['network_1', 'network_2']
    const { result: stepFormRef } = renderHook(() => useMockedFormHook({}))

    render(<MockedTargetComponent
      form={stepFormRef.current}
      editMode={true}
      initialValues={{
        networks: { venue_00003: mockedNetworkIds },
        activatedNetworks: {
          venue_00003: mockedNetworkIds.map(id => ({ id }))
        }
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    screen.getByRole('row', { name: /airport.* 0/i })
    screen.getByRole('row', { name: /MockedVenue 1 .* 2/i })
    screen.getByRole('row', { name: /MockedVenue 2 .* 0/i })
    screen.getByRole('row', { name: /SG office .* 0/i })
    await waitFor(() =>
      expect(stepFormRef.current.getFieldValue('activatedNetworks')).toStrictEqual({ venue_00003: [
        { id: 'network_1' },
        { id: 'network_2' }
      ] }))
  })

  describe('guest tunnel enabled', () => {
    it('should correctly display', async () => {
      const mockedSetFieldValue = jest.fn()
      const { result: stepFormRef } = renderHook(() => useMockedFormHook({
        isGuestTunnelEnabled: true,
        activatedNetworks: {
          venue_00002: [
            { name: 'MockedNetwork 1', id: 'network_1' },
            { name: 'MockedNetwork 4', id: 'network_4' }
          ] },
        activatedGuestNetworks: {
          venue_00002: [
            { name: 'MockedNetwork 4', id: 'network_4' }
          ] }
      }))
      jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

      render(<MockedTargetComponent
        form={stepFormRef.current}
      />, { route: { params: { tenantId: 't-id' } } })

      await basicCheck()
      screen.getByRole('row', { name: /airport.* 2/i })
      screen.getByRole('row', { name: /MockedVenue 1 .* 0/i })
      screen.getByRole('row', { name: /MockedVenue 2 .* 0/i })
      screen.getByRole('row', { name: /SG office .* 0/i })

      const dmzTunnelSelector = await screen.findByRole('combobox', { name: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' })
      screen.queryByRole('option', { name: 'tunnelProfileId1' })
      // only Manual mode can be options for DMZ tunnel
      expect(screen.queryByRole('option', { name: 'tunnelProfileId2' })).toBeNull()
      await userEvent.selectOptions(dmzTunnelSelector, 'tunnelProfileId1')
      expect(mockedSetFieldValue).toBeCalledWith('guestTunnelProfileName', 'tunnelProfile1')
    })
  })
})

const basicCheck = async () => {
  await screen.findByText('Tunnel & Network Settings')
  screen.getByText(/Select the venues and networks where the SD-LAN Service will be applied/i)
  const rows = await screen.findAllByRole('row', { name: /MockedVenue/i })
  expect(rows.length).toBe(2)
}