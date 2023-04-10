/* eslint-disable max-len */
import { initialize } from '@googlemaps/jest-mocks'
import { rest }       from 'msw'

import { AdministrationUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { GoogleMapWithPreference } from './'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  GoogleMap: ({ loaderOpts }:{ loaderOpts?: {
    language?: string;
    region?: string;
  } }) =>
    (<div data-testid={'acx-GoogleMap'} title='acx-GoogleMap'>{loaderOpts?.region}</div>)
}))

describe('load Google map with preference', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  beforeEach(() => {
    initialize()

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({
          global: {
            mapRegion: 'TW'
          }
        }))
      )
    )
  })

  it('should render successfully', async () => {
    render(
      <Provider>
        <GoogleMapWithPreference
          libraries={['places']}
        />
      </Provider>, {
        route: { params }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect((await screen.findByTestId('acx-GoogleMap')).textContent).toBe('TW')
  })
})
