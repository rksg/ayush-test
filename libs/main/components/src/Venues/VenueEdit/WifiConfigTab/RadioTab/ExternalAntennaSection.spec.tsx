import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi }                                                               from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo, WifiUrlsInfo }                                         from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { VenueEditContext }                                                       from '../..'
import { externalAntennaApModels, venueExternalAntenna, venueExternalAntennaCap } from '../../../__tests__/fixtures'

import { ExternalAntennaSection } from './ExternalAntennaSection'


const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'radio'
}

describe('Venue External Antenna Settings', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json(venueExternalAntenna))),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueExternalAntennaCap))),
      rest.put(
        WifiUrlsInfo.updateVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json({}))),
      // RBAC API
      rest.get(
        WifiRbacUrlsInfo.getVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json(venueExternalAntenna))),
      rest.put(
        WifiRbacUrlsInfo.updateVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json({})))
    )})

  it('should render External Antenna: E510 correctly', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editRadioContextData: {
            apiApModels: externalAntennaApModels,
            apModels: externalAntennaApModels
          },
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          <Form>
            <ExternalAntennaSection />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByText('No model selected')

    const apModelSelect = await screen.findByRole('combobox', { name: /AP Model/ })
    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('E510'))

    await waitFor(() => {
      expect(screen.queryByText('Enable 2.4 GHz:')).toBeVisible()
    })

    const toggle24G = await screen.findByRole('switch', { name: /Enable 2.4 GHz:/i })
    const toggle50G = await screen.findByRole('switch', { name: /Enable 5 GHz:/i })
    await userEvent.click(toggle24G)
    await userEvent.click(toggle50G)

    expect(await screen.findAllByRole('spinbutton')).toHaveLength(2)

    const gain24G = await screen.findByTestId('gain24G')
    const gain50G = await screen.findByTestId('gain50G')
    await userEvent.type(gain24G, '1')
    await userEvent.type(gain50G, '1')
    await userEvent.click(toggle24G)
    await userEvent.click(toggle50G)

    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T350SE'))
    expect(await screen.findByRole('switch', { name: 'Enable:' })).toBeVisible()

    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('E510'))
    expect(await screen.findByRole('switch', { name: 'Enable 2.4 GHz:' })).toBeVisible()
    await userEvent.click(await screen.findByRole('switch', { name: 'Enable 2.4 GHz:' }))
    const gain51024G = await screen.findByTestId('gain24G')
    expect(gain51024G).toHaveValue('3') // reset to API value

    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('No model selected'))
    expect(await screen.findByRole('img')).toBeVisible()
  })

  it('should render External Antenna: T350SE & T300E correctly', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels
        },
        setEditContextData: jest.fn(),
        setEditRadioContextData: jest.fn()
      }}>
        <Form>
          <ExternalAntennaSection />
        </Form>
      </VenueEditContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
    })

    // this would only be visible when loader removed
    const sectionEl = await screen.findByTestId('external-antenna-section')
    const section = within(sectionEl)

    await section.findByText('No model selected')
    const apModelSelect = await section.findByRole('combobox')
    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T350SE'))

    expect(await screen.findByText('Enable:')).toBeVisible()
    expect(await screen.findAllByRole('spinbutton')).toHaveLength(2) // 2.4 GHz & 5 GHz Antenna gain

    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T300E'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    expect(await screen.findAllByRole('spinbutton')).toHaveLength(1) // 5 GHz Antenna gain
    await userEvent.click(await screen.findByRole('switch', { name: /Enable:/i }))
    await waitFor(() => {
      expect(screen.queryAllByRole('spinbutton')).toHaveLength(0)
    })
  })
})