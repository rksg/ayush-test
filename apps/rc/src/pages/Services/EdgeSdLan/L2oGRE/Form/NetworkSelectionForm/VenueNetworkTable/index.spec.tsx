/* eslint-disable max-len */
import { waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent                             from '@testing-library/user-event'
import { Form }                              from 'antd'
import { cloneDeep }                         from 'lodash'
import { rest }                              from 'msw'

import { StepsForm, StepsFormProps }                                                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                            from '@acx-ui/feature-toggle'
import { venueApi }                                                                                                                          from '@acx-ui/rc/services'
import { APCompatibilityFixtures, CommonUrlsInfo, EdgePinFixtures, EdgeSdLanFixtures, IncompatibilityFeatures, VenueFixtures, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                   from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { EdgeSdLanContext, EdgeSdLanContextType } from '../../EdgeSdLanContextProvider'

import { EdgeSdLanVenueNetworksTable, VenueNetworksTableProps } from '.'

const { mockVenueList } = VenueFixtures
const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockPinListForMutullyExclusive } = EdgePinFixtures

const mockedOverlapSdLans = cloneDeep(mockedMvSdLanDataList)
const targetVenue = mockVenueList.data[1]
mockedOverlapSdLans[0].venueId = targetVenue.id
mockedOverlapSdLans[0].tunneledWlans?.forEach(wlan => {
  wlan.venueId = targetVenue.id
})
mockedOverlapSdLans[0].tunneledGuestWlans?.forEach(wlan => {
  wlan.venueId = targetVenue.id
})
const edgeMvSdlanContextValues = {
  allSdLans: mockedMvSdLanDataList,
  allPins: [],
  availableTunnelProfiles: []
} as EdgeSdLanContextType

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue('ecc2d7cf9d2342fdb31ae0e24958fcac')
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ApGeneralCompatibilityDrawer: () => <div data-testid='ApGeneralCompatibilityDrawer'></div>
}))
jest.mock('./NetworksDrawer.tsx', () => ({
  ...jest.requireActual('./NetworksDrawer.tsx'),
  NetworksDrawer: (props: {
    venueId: string, venueName?: string, onClose: () => void
  }) => <div data-testid='NetworksDrawer'>
    <span>venueId={props.venueId}</span>
    <span>venueName={props.venueName}</span>
    <button onClick={props.onClose}>Close</button>
  </div>
}))

type MockedTargetComponentType = VenueNetworksTableProps & Pick<StepsFormProps, 'form' | 'editMode'> & {
  ctxValues?: EdgeSdLanContextType
}
const MockedTargetComponent = (props: MockedTargetComponentType) => {
  const { form, editMode, ctxValues, ...networkTableProps } = props
  return <Provider>
    <EdgeSdLanContext.Provider value={ctxValues ?? edgeMvSdlanContextValues}>
      <StepsForm form={form} editMode={editMode}>
        <EdgeSdLanVenueNetworksTable
          {...networkTableProps}
        />
      </StepsForm>
    </EdgeSdLanContext.Provider>
  </Provider>
}

const { click, hover } = userEvent

describe('Tunneled Venue Networks Table', () => {

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(mockVenueList))
      )
    )
  })

  it('should correctly render', async () => {
    render(<MockedTargetComponent
      value={{
        'test-2': [{
          networkId: 'network1',
          networkName: 'Network_1'
        }, {
          networkId: 'network2',
          networkName: 'Network_2'
        }, {
          networkId: 'network3',
          networkName: 'Network_3' }],
        'test-3': [{
          networkId: 'network5',
          networkName: 'Network_5'
        }]
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    screen.getAllByRole('row')
    screen.getByRole('row', { name: /Mocked-Venue-2 .* 3/i })
    screen.getByRole('row', { name: /Mocked-Venue-3 .* 1/i })
  })

  it('should open networks selection drawer', async () => {
    render(<MockedTargetComponent
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: /Mocked-Venue-2/i })
    await click(within(row).getByRole('button', { name: 'Select Networks' }))
    const drawerDiv = screen.getByTestId('NetworksDrawer')
    within(drawerDiv).getByText('venueId=test-2')
  })

  it('should close networks selection drawer', async () => {
    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: /Mocked-Venue-2/i })
    await click(within(row).getByRole('button', { name: 'Select Networks' }))
    const drawerDiv = screen.getByTestId('NetworksDrawer')
    within(drawerDiv).getByText('venueId=test-2')
    await click(within(drawerDiv).getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('NetworksDrawer')).toBe(null)
  })

  it('should display networks name as tooltip when hover', async () => {
    render(<MockedTargetComponent
      value={{
        'test-2': [{
          networkId: 'network_1',
          networkName: 'Network1'
        }]
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: /Mocked-Venue-2/i })
    await hover(within(within(row).getByRole('cell', { name: '1' })).getByText('1'))
    expect(await screen.findByRole('tooltip', { hidden: true })).toHaveTextContent('Network1')
  })

  it('should filter venues which has been tied with other SDLAN on add mode', async () => {
    render(<MockedTargetComponent ctxValues={{ allSdLans: mockedOverlapSdLans, allPins: [], availableTunnelProfiles: [] }} />,
      { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    expect(screen.queryByRole('row', { name: /Mocked-Venue-2/i })).toBeNull()
    expect(screen.getByRole('row', { name: /Mocked-Venue-1/i })).toBeVisible()
    expect(screen.getByRole('row', { name: /Mocked-Venue-3/i })).toBeVisible()
  })

  it('should filter venues which has been tied with other SDLAN on edit mode', async () => {
    const mockedOverlapSdLansForEdit = cloneDeep(mockedOverlapSdLans)
    mockedOverlapSdLansForEdit[1].venueId = mockVenueList.data[0].id
    mockedOverlapSdLansForEdit[1].tunneledWlans?.forEach(wlan => {
      wlan.venueId = mockVenueList.data[0].id
    })
    const useMockedFormHook = (initData: Record<string, unknown>) => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        ...mockedOverlapSdLans[0],
        ...initData
      })
      return form
    }

    const { result: stepFormRef } = renderHook(useMockedFormHook)

    render(<MockedTargetComponent
      ctxValues={{ allSdLans: mockedOverlapSdLansForEdit , allPins: [], availableTunnelProfiles: [] }}
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    expect(screen.getByRole('row', { name: /Mocked-Venue-2/i })).toBeVisible()
    expect(screen.getByRole('row', { name: /Mocked-Venue-3/i })).toBeVisible()
    expect(screen.queryByRole('row', { name: /Mocked-Venue-1/i })).toBeNull()
  })

  it('should filter venues which has been tied with PIN on add mode', async () => {
    mockPinListForMutullyExclusive.data[0].venueId = targetVenue.id
    render(<MockedTargetComponent ctxValues={{ allSdLans: [], allPins: [mockPinListForMutullyExclusive.data[0]], availableTunnelProfiles: [] }} />,
      { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    expect(screen.queryByRole('row', { name: /Mocked-Venue-2/i })).toBeNull()
    expect(screen.getByRole('row', { name: /Mocked-Venue-1/i })).toBeVisible()
    expect(screen.getByRole('row', { name: /Mocked-Venue-3/i })).toBeVisible()
  })

  it('should filter venues which has been tied with PIN on edit mode', async () => {
    mockPinListForMutullyExclusive.data[0].venueId = targetVenue.id
    const useMockedFormHook = (initData: Record<string, unknown>) => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        ...mockedOverlapSdLans[0],
        ...initData
      })
      return form
    }

    const { result: stepFormRef } = renderHook(useMockedFormHook)

    render(<MockedTargetComponent
      ctxValues={{ allSdLans: [], allPins: [mockPinListForMutullyExclusive.data[0]], availableTunnelProfiles: [] }}
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    expect(screen.getByRole('row', { name: /Mocked-Venue-1/i })).toBeVisible()
    expect(screen.getByRole('row', { name: /Mocked-Venue-3/i })).toBeVisible()
    expect(screen.queryByRole('row', { name: /Mocked-Venue-2/i })).toBeNull()
  })

  it('should have compatible warning', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
    const mockApCompatibilitiesVenue = cloneDeep(APCompatibilityFixtures.mockApCompatibilitiesVenue)
    mockApCompatibilitiesVenue.apCompatibilities= [{
      ...mockApCompatibilitiesVenue.apCompatibilities[0],
      incompatibleFeatures: [{
        ...mockApCompatibilitiesVenue.apCompatibilities[0]?.incompatibleFeatures![0],
        featureName: IncompatibilityFeatures.SD_LAN
      }]
    }]

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockVenueList.data.slice(1, 2) }))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (_, res, ctx) => res(ctx.json(mockApCompatibilitiesVenue)))
    )

    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })
    const row = await screen.findByRole('row', { name: /Mocked-Venue-2 .* Select Networks/i })
    const fwWarningIcon = await within(row).findByTestId('WarningTriangleSolid')
    await userEvent.hover(fwWarningIcon)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('See the compatibility requirements.')
    const btn = screen.getByRole('button', { name: 'See the compatibility requirements.' })
    await userEvent.click(btn)
    expect(await within(row).findByTestId('ApGeneralCompatibilityDrawer')).toBeVisible()
  })
})

const basicCheck = async () => {
  await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
  const rows = await screen.findAllByRole('row', { name: /Mocked-Venue/i })
  expect(rows.length).toBe(2)
}
