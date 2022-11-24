import '@testing-library/jest-dom'
import { rest } from 'msw'

import { apApi }                                                            from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                                     from '@acx-ui/rc/utils'
import { Provider, store  }                                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { apDetails, apLanPorts, apRadio, apViewModel } from '../../__tests__/fixtures'

import { ApProperties } from '.'

const params = {
  venueId: 'venue-id',
  tenantId: 'tenant-id',
  serialNumber: 'serial-number'
}

describe('ApProperties', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(apViewModel))
      )
    )
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (req, res, ctx) => res(ctx.json(apDetails))
      )
    )
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (req, res, ctx) => res(ctx.json({
          address: {
            latitude: 37.4112751,
            longitude: -122.0191908
          }
        }))
      )
    )
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApLanPorts.url,
        (req, res, ctx) => res(ctx.json(apLanPorts))
      )
    )
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApRadioCustomization.url,
        (req, res, ctx) => res(ctx.json(apRadio))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><ApProperties /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText('AP Properties')).toBeVisible()
    fireEvent.click(screen.getByText('More'))
    expect(await screen.findByText('Properties')).toBeVisible()
    fireEvent.click(screen.getByText('Settings'))
    const button = screen.getByRole('button', { name: /close/i })
    fireEvent.click(button)
  })

})
