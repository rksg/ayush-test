import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                     from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import { mockServer, screen, render }   from '@acx-ui/test-utils'

import { VenueEditContext }                                  from '../..'
import {
  externalAntennaApModels,
  venueData, venueExternalAntenna, venueExternalAntennaCap
} from '../../../__tests__/fixtures'

import { RadioTab } from './RadioTab'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('RadioTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        WifiUrlsInfo.GetVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json(venueExternalAntenna))),
      rest.get(
        WifiUrlsInfo.GetVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueExternalAntennaCap))),
      rest.put(
        WifiUrlsInfo.UpdateVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  it('should render External Antenna: E510 correctly', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels
        },
        setEditRadioContextData: jest.fn()
      }}>
        <RadioTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })

    await screen.findByText('No model selected')
    const apModelSelect = screen.getByRole('combobox')
    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('E510'))
    expect(await screen.findByText('Enable 2.4 GHz:')).toBeVisible()
    expect(await screen.findByText('Enable 5 GHz:')).toBeVisible()

    const toggle24G = screen.getByRole('switch', { name: /Enable 2.4 GHz:/i })
    await userEvent.click(toggle24G)
    expect(await screen.findByText('2.4 GHz Antenna gain:')).toBeVisible()
    const toggle50G = screen.getByRole('switch', { name: /Enable 5 GHz:/i })
    await userEvent.click(toggle50G)
    expect(await screen.findByText('5 GHz Antenna gain:')).toBeVisible()

    const gain24G = screen.getByTestId('gain24G')
    const gain50G = screen.getByTestId('gain50G')
    await userEvent.type(gain24G, '1')
    await userEvent.type(gain50G, '1')
    await userEvent.click(toggle24G)
    await userEvent.click(toggle50G)

    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('T350SE'))
    expect(await screen.findByRole('switch', { name: 'Enable:' })).toBeVisible()

    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('E510'))
    expect(await screen.findByRole('switch', { name: 'Enable 2.4 GHz:' })).toBeVisible()
    await userEvent.click(await screen.findByRole('switch', { name: 'Enable 2.4 GHz:' }))
    const gain51024G = screen.getByTestId('gain24G')
    expect(gain51024G).toHaveValue('3') // reset to API value
  })

  it('should render External Antenna: T350SE & T300E correctly', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels
        },
        setEditRadioContextData: jest.fn()
      }}>
        <RadioTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })

    await screen.findByText('No model selected')
    const apModelSelect = screen.getByRole('combobox')

    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('T350SE'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    await userEvent.click(screen.getByRole('switch', { name: /Enable:/i }))

    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('T300E'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    await userEvent.click(screen.getByRole('switch', { name: /Enable:/i }))

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  })
})
