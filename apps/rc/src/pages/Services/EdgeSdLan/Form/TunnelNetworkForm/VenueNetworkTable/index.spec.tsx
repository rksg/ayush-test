/* eslint-disable max-len */
import { waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent                             from '@testing-library/user-event'
import { Form }                              from 'antd'
import { cloneDeep }                         from 'lodash'
import { rest }                              from 'msw'

import { StepsForm, StepsFormProps }                                                                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                             from '@acx-ui/feature-toggle'
import { venueApi }                                                                                                           from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeSdLanFixtures, WifiUrlsInfo, APCompatibilityFixtures, EdgePinFixtures, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                    from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { mockedVenueList }                        from '../../../__tests__/fixtures'
import { EdgeSdLanContext, EdgeSdLanContextType } from '../../EdgeSdLanContextProvider'

import { EdgeSdLanVenueNetworksTable, VenueNetworksTableProps } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockPinListForMutullyExclusive } = EdgePinFixtures

const mockedOverlapSdLans = cloneDeep(mockedMvSdLanDataList)
const targetVenue = mockedVenueList.data[1]
mockedOverlapSdLans[0].venueId = targetVenue.id
mockedOverlapSdLans[0].tunneledWlans?.forEach(wlan => {
  wlan.venueId = targetVenue.id
})
mockedOverlapSdLans[0].tunneledGuestWlans?.forEach(wlan => {
  wlan.venueId = targetVenue.id
})
const edgeMvSdlanContextValues = {
  allSdLans: mockedMvSdLanDataList,
  allPins: []
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
        (_req, res, ctx) => res(ctx.json(mockedVenueList))
      )
    )
  })

  it('should correctly render', async () => {
    render(<MockedTargetComponent
      value={{
        venue_00002: [{
          id: 'network1',
          name: 'Network_1'
        }, {
          id: 'network2',
          name: 'Network_2'
        }, {
          id: 'network3',
          name: 'Network_3' }],
        venue_00005: [{
          id: 'network5',
          name: 'Network_5'
        }]
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    screen.getAllByRole('row')
    screen.getByRole('row', { name: /My-Venue .* 0/i })
    screen.getByRole('row', { name: /airport.* 3/i })
    screen.getByRole('row', { name: /MockedVenue 1 .* 0/i })
    screen.getByRole('row', { name: /MockedVenue 2 .* 0/i })
    screen.getByRole('row', { name: /SG office .* 1/i })
  })

  it('should open networks selection drawer', async () => {
    render(<MockedTargetComponent
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: /airport/i })
    await click(within(row).getByRole('radio'))
    await click(screen.getByRole('button', { name: 'Select Networks' }))
    const drawerDiv = screen.getByTestId('NetworksDrawer')
    within(drawerDiv).getByText('venueId=venue_00002')
  })

  it('should close networks selection drawer', async () => {
    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: /airport/i })
    await click(within(row).getByRole('radio'))
    await click(screen.getByRole('button', { name: 'Select Networks' }))
    const drawerDiv = screen.getByTestId('NetworksDrawer')
    within(drawerDiv).getByText('venueId=venue_00002')
    await click(within(drawerDiv).getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('NetworksDrawer')).toBe(null)
  })

  it('should display networks name as tooltip when hover', async () => {
    const venueId = 'venue_00002'
    const venueName = mockedVenueList.data.find(i => i.id === venueId)?.name
    render(<MockedTargetComponent
      value={{
        [venueId]: [{
          id: 'network_1',
          name: 'Network1'
        }]
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(venueName!) })
    await hover(within(within(row).getByRole('cell', { name: '1' })).getByText('1'))
    expect(await screen.findByRole('tooltip', { hidden: true })).toHaveTextContent('Network1')
  })

  it('should filter venues which has been tied with other SDLAN on add mode', async () => {
    render(<MockedTargetComponent ctxValues={{ allSdLans: mockedOverlapSdLans, allPins: [] }} />,
      { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    expect(screen.queryByRole('row', { name: /airport/i })).toBe(null)
    screen.getByRole('row', { name: /My-Venue/i })
    screen.getByRole('row', { name: /SG office/i })
  })

  it('should filter venues which has been tied with other SDLAN on edit mode', async () => {
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
      ctxValues={{ allSdLans: mockedOverlapSdLans , allPins: [] }}
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    screen.getByRole('row', { name: /My-Venue/i })
    screen.getByRole('row', { name: /SG office/i })
    expect(screen.queryByRole('row', { name: /airport/i })).not.toBe(null)
  })

  it('should filter venues which has been tied with PIN on add mode', async () => {
    mockPinListForMutullyExclusive.data[0].venueId = targetVenue.id
    render(<MockedTargetComponent ctxValues={{ allSdLans: [], allPins: [mockPinListForMutullyExclusive.data[0]] }} />,
      { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    expect(screen.queryByRole('row', { name: /airport/i })).toBe(null)
    screen.getByRole('row', { name: /My-Venue/i })
    screen.getByRole('row', { name: /SG office/i })
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
      ctxValues={{ allSdLans: [], allPins: [mockPinListForMutullyExclusive.data[0]] }}
      form={stepFormRef.current}
      editMode={true}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    screen.getByRole('row', { name: /My-Venue/i })
    screen.getByRole('row', { name: /SG office/i })
    expect(screen.queryByRole('row', { name: /airport/i })).toBe(null)
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
        (_req, res, ctx) => res(ctx.json({ data: mockedVenueList.data.slice(0, 1) }))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (_, res, ctx) => res(ctx.json(mockApCompatibilitiesVenue)))
    )

    render(<MockedTargetComponent />, { route: { params: { tenantId: 't-id' } } })

    const row = await screen.findByRole('row', { name: /My-Venue .* 0/i })
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
  const rows = await screen.findAllByRole('row', { name: /MockedVenue/i })
  expect(rows.length).toBe(2)
}
