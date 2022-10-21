import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                  from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import { mockServer, screen, render, within, fireEvent } from '@acx-ui/test-utils'

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

    const anchor = await screen.findAllByText('External Antenna')
    await userEvent.click(anchor[0])
    await screen.findByText('No model selected')
    const apModelSelect = screen.getByRole('combobox')
    await userEvent.click(apModelSelect)
    userEvent.click(screen.getByTitle('E510'))
    expect(await screen.findByText('Enable 2.4 GHz:')).toBeVisible()
    expect(await screen.findByText('Enable 5 GHz:')).toBeVisible()

    const view24G = screen.getByText(/Enable 2.4 GHz:/i)
    await userEvent.click(within(view24G).getByRole('switch'))
    expect(await screen.findByText('2.4 GHz Antenna gain:')).toBeVisible()
    const view50G = screen.getByText(/Enable 5 GHz:/i)
    await userEvent.click(within(view50G).getByRole('switch'))
    expect(await screen.findByText('5 GHz Antenna gain:')).toBeVisible()

    const gain24G = screen.getByTestId('gain24G')
    const gain50G = screen.getByTestId('gain50G')
    fireEvent.change(gain24G, { target: { value: 1 } })
    fireEvent.change(gain50G, { target: { value: 1 } })
    await userEvent.click(within(view24G).getByRole('switch'))
    await userEvent.click(within(view50G).getByRole('switch'))

    await userEvent.click(apModelSelect)
    userEvent.click(screen.getByTitle('T350SE'))
    expect(await screen.findByText('Enable:')).toBeVisible()

    await userEvent.click(apModelSelect)
    userEvent.click(screen.getByTitle('E510'))
    expect(await screen.findByText('Enable 2.4 GHz:')).toBeVisible()
    await userEvent.click(within(screen.getByText(/Enable 2.4 GHz:/i)).getByRole('switch'))
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

    const anchor = await screen.findAllByText('External Antenna')
    await userEvent.click(anchor[0])
    await screen.findByText('No model selected')
    const apModelSelect = screen.getByRole('combobox')
    await userEvent.click(apModelSelect)

    userEvent.click(screen.getByTitle('T350SE'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    const viewSingleEnable = screen.getByText(/Enable:/i)
    await userEvent.click(within(viewSingleEnable).getByRole('switch'))

    await userEvent.click(apModelSelect)
    userEvent.click(screen.getByTitle('T300E'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    const viewT300ESingleEnable = screen.getByText(/Enable:/i)
    await userEvent.click(within(viewT300ESingleEnable).getByRole('switch'))

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  })
})
