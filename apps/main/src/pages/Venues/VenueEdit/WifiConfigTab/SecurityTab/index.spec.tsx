import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                    from '@acx-ui/rc/services'
import { CommonUrlsInfo, RogueApUrls } from '@acx-ui/rc/utils'
import { Provider, store }             from '@acx-ui/store'
import { mockServer, render, screen }  from '@acx-ui/test-utils'

import {
  venueData,
  venueRogueAp,
  venueDosProtection,
  venueRoguePolicy,
  venueRoguePolicyList,
  rogueApPolicyNotDefaultProfile
} from '../../../__tests__/fixtures'
import { VenueEditContext } from '../../index'


import { SecurityTab } from '.'

const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}

describe('SecurityTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        RogueApUrls.getRoguePolicyList.url,
        (_, res, ctx) => res(ctx.json(venueRoguePolicy))),
      rest.get(
        CommonUrlsInfo.getDenialOfServiceProtection.url,
        (_, res, ctx) => res(ctx.json(venueDosProtection))),
      rest.get(
        CommonUrlsInfo.getVenueRogueAp.url,
        (_, res, ctx) => res(ctx.json(venueRogueAp))),
      rest.put(
        CommonUrlsInfo.getDenialOfServiceProtection.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(
        CommonUrlsInfo.updateVenueRogueAp.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        RogueApUrls.getRoguePolicy.url,
        (_, res, ctx) => res(ctx.json(rogueApPolicyNotDefaultProfile))
      )
    )
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <SecurityTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

    const switchButton = await screen.findAllByRole('switch')
    await userEvent.click(switchButton[0])
    await userEvent.click(switchButton[1])
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    // await userEvent.click(await screen.findByRole('switch'))

    // await userEvent.click(await screen.findByRole('switch'))
    // await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should render correctly with RogueApProfile settings', async () => {
    mockServer.use(
      rest.get(
        RogueApUrls.getRoguePolicyList.url,
        (_, res, ctx) => res(ctx.json(venueRoguePolicyList)))
    )
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <SecurityTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await screen.findByTitle('roguePolicy1')

    await userEvent.click(await screen.findByRole('button', { name: 'View Details' }))

    await screen.findByTitle('Rogue AP Detection Policy Profile:')

    await screen.findByTitle('Classification rules (2)')

    const cancelButton = await screen.findAllByRole('button', { name: 'Cancel' })

    await userEvent.click(cancelButton[1])

    expect(screen.queryByText(/rogue ap detection policy details: roguepolicy1/i)).toBeNull()

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should render correctly with RogueApProfile settings then cancel', async () => {
    mockServer.use(
      rest.get(
        RogueApUrls.getRoguePolicyList.url,
        (_, res, ctx) => res(ctx.json(venueRoguePolicyList)))
    )

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <SecurityTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await screen.findByTitle('roguePolicy1')

    await userEvent.click(await screen.findByRole('button', { name: 'View Details' }))

    await screen.findByTitle('Rogue AP Detection Policy Profile:')

    await screen.findByTitle('Classification rules (2)')

    const cancelButton = await screen.findAllByRole('button', { name: 'Cancel' })

    await userEvent.click(cancelButton[1])

    expect(screen.queryByText(/rogue ap detection policy details: roguepolicy1/i)).toBeNull()
  })
})
