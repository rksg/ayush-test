import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  venueData,
  venueSetting,
  venueApsList
} from '../../../../__tests__/fixtures'

import { MeshNetwork } from './'

const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}

describe('MeshNetwork', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.put(
        CommonUrlsInfo.updateVenueMesh.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(venueApsList)))
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><MeshNetwork /></Provider>, { route: { params } })

    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(await screen.findByRole('switch'))
    await userEvent.click(await screen.findByRole('button', { name: 'Enable Mesh' }))

    await userEvent.click(await screen.findByRole('switch'))

    await userEvent.click(await screen.findByRole('switch'))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
  it('should render disabled switch button correctly', async () => {
    venueSetting.dhcpServiceSetting.enabled = true
    const { asFragment } = render(<Provider><MeshNetwork /></Provider>, { route: { params } })

    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(await screen.findByRole('switch'))
  })
})
