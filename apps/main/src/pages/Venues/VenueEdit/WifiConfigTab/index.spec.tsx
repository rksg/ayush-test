import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, RogueApUrls }           from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { EditContext, VenueEditContext } from '../index'

import { WifiConfigTab } from './index'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
        (_, res, ctx) => res(ctx.json(policyListContent)))
    )

    render(
      <Provider>
        <VenueEditContext.Provider value={{
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
    await screen.findByRole('tab', { name: 'Network Controls' })
    await screen.findByRole('tab', { name: 'Advanced' })

    fireEvent.click(await screen.findByRole('tab', { name: 'Security' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/edit/wifi/security`,
      hash: '',
      search: ''
    })
  })
})
