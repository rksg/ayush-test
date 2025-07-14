import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'


import { CommonUrlsInfo, RogueApUrls, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { mockServer, render, screen }                                  from '@acx-ui/test-utils'

import { venueCaps }                     from '../../__tests__/fixtures'
import { defaultValue }                  from '../../contentsMap'
import { EditContext, VenueEditContext } from '../index'


import { WifiConfigTab } from './index'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./RadioTab/RadioTab', () => ({
  RadioTab: () => <div data-testid='radio-tab' />
}))

const venueDosProtection = {
  enabled: true,
  blockingPeriod: 50,
  failThreshold: 6,
  checkPeriod: 30
}

const venueRogueAp = {
  enabled: true,
  reportThreshold: 0,
  roguePolicyId: '9700ca95e4be4a22857f0e4b621a685f'
}

const policyListContent = [
  {
    id: 'policyId1',
    name: 'test',
    description: '',
    numOfRules: 1,
    lastModifier: 'FisrtName 1649 LastName 1649',
    lastUpdTime: 1664790827392,
    numOfActiveVenues: 0,
    activeVenues: []
  },
  {
    id: 'be62604f39aa4bb8a9f9a0733ac07add',
    name: 'test6',
    description: '',
    numOfRules: 1,
    lastModifier: 'FisrtName 1649 LastName 1649',
    lastUpdTime: 1667215711375,
    numOfActiveVenues: 0,
    activeVenues: []
  }
]

const policyListViewModel = {
  totalCount: 2,
  data: [{
    id: 'policyId1',
    name: 'test'
  }, {
    id: 'be62604f39aa4bb8a9f9a0733ac07add',
    name: 'test6'
  }]
}

describe('WifiConfigTab', () => {
  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDenialOfServiceProtection.url,
        (_, res, ctx) => res(ctx.json(venueDosProtection))),
      rest.get(
        CommonUrlsInfo.getVenueRogueAp.url,
        (_, res, ctx) => res(ctx.json(venueRogueAp))),
      rest.get(
        RogueApUrls.getRoguePolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListContent))),
      rest.post(
        RogueApUrls.getEnhancedRoguePolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListViewModel))),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      // rbac
      rest.get(
        WifiRbacUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(
        CommonUrlsInfo.getVenueApEnhancedKey.url,
        (_req, res, ctx) => res(ctx.json({ tlsKeyEnhancedModeEnabled: false }))
      )
    )

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          ...defaultValue,
          editContextData: {} as EditContext,
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          <WifiConfigTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })
    await screen.findByRole('tab', { name: 'Radio' })
    await screen.findByRole('tab', { name: 'Networking' })
    await screen.findByRole('tab', { name: 'Security' })
    await screen.findByRole('tab', { name: 'Network Control' })
    await screen.findByRole('tab', { name: 'Advanced' })

    const securityTab = await screen.findByRole('tab', { name: 'Security' })
    await userEvent.click(securityTab)
    expect(securityTab.getAttribute('aria-selected')).toBeTruthy()
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/edit/wifi/security`,
      hash: '',
      search: ''
    })
  })
})
