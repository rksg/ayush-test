import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed }                                         from '@acx-ui/feature-toggle'
import { AaaUrls, CommonUrlsInfo, MacRegListUrlsInfo, WifiUrlsInfo, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen }                                             from '@acx-ui/test-utils'

import {
  mockAAAPolicyListResponse,
  mockMacRegistrationPoolList,
  networkDeepResponse,
  networksResponse,
  venueListResponse,
  venuesResponse
} from '../__tests__/fixtures'
import { MLOContext } from '../NetworkForm'

import { OpenSettingsForm } from './OpenSettingsForm'

jest.mock('./MacRegistrationListComponent', () => () => {
  return <div data-testid='MacRegistrationListComponentId' />
})

jest.mock('../../EdgeSdLan/useEdgeSdLanActions', () => ({
  ...jest.requireActual('../../EdgeSdLan/useEdgeSdLanActions'),
  useSdLanScopedNetworkVenues: jest.fn().mockReturnValue({})
}))

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  useNetworkVxLanTunnelProfileInfo: jest.fn().mockReturnValue({
    enableTunnel: false,
    enableVxLan: false,
    vxLanTunnels: undefined
  })
}))

jest.mock('../../ApCompatibility', () => ({
  ...jest.requireActual('../../ApCompatibility'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

describe('OpenNetwork form', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.get(WifiUrlsInfo.getVlanPools.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockMacRegistrationPoolList))),
      rest.post(AaaUrls.queryAAAPolicyList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )

  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should render OpenNetwork successfully with mac address format', async () => {
    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <OpenSettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    await userEvent.click(await screen.findByTestId('mac-auth-switch'))
    await screen.findByText(/mac address format/i)

    await userEvent.click(await screen.findByLabelText(/MAC Registration list/i))
    expect(screen.queryByText(/mac address format/i)).not.toBeInTheDocument()
  })

  it('should render OpenNetwork with R370 compatibility tooltip', async () => {
    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <OpenSettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
    expect(toolTips.length).toBe(1)
    toolTips.forEach(t => expect(t).toBeVisible())
    expect(await screen.findByTestId('ApCompatibilityDrawer')).toBeVisible()
  })
})
