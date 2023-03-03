import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi }                                              from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                        from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ServerSettingContext }          from '..'
import { EditContext, VenueEditContext } from '../../..'

import { mockBonjourFencing } from './__tests__/fixtures'
import { BonjourFencing }     from './BonjourFencing'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'servers'
}

describe('Venue Bonjour Fencing', () => {
  let editContextData = {} as EditContext
  const setEditContextData = jest.fn()
  let editServerContextData = {} as ServerSettingContext
  const setEditServerContextData = jest.fn()

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueBonjourFencingPolicy.url,
        (_, res, ctx) => res(ctx.json(mockBonjourFencing))),
      rest.post(
        CommonUrlsInfo.updateVenueBonjourFencingPolicy.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it ('should render correctly', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <BonjourFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('switch', { name: 'Use Bonjour Fencing Service' })
    )

  })

  it ('should render drawer and save data', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <BonjourFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // BonjourFencingTable
    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Service' })
    )

    // BonjourFencingDrawer
    await userEvent.click(await screen.findByRole('combobox', { name: 'Service' }))
    await userEvent.click(await screen.findByTitle('Airport Management'))

    await userEvent.click(await screen.findByRole('switch', { name: 'Wireless Connection' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it ('should render drawer and cancel', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <BonjourFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // BonjourFencingTable
    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Service' })
    )

    // BonjourFencingDrawer
    await userEvent.click(await screen.findByRole('combobox', { name: 'Service' }))
    await userEvent.click(await screen.findByTitle('Airport Management'))

    await userEvent.click(await screen.findByRole('switch', { name: 'Wireless Connection' }))
    await userEvent.click(await screen.findByRole('switch', { name: 'Wired Connection' }))
    await userEvent.click(await screen.findByRole('switch', { name: 'Custom Mapping' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it ('should at least one fencing rule in the Wired Connection settings', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <BonjourFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // BonjourFencingTable
    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Service' })
    )

    // BonjourFencingDrawer
    await userEvent.click(await screen.findByRole('combobox', { name: 'Service' }))
    await userEvent.click(await screen.findByTitle('Airport Management'))

    await userEvent.click(await screen.findByRole('switch', { name: 'Wired Connection' }))

    const addButtons= await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButtons[1])

    await screen.findByText('The Wired Connection settings must contain at least one fencing rule.')
  })

  it ('The Custom String List can\'t empty', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <BonjourFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // BonjourFencingTable
    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Service' })
    )

    // BonjourFencingDrawer
    await userEvent.click(await screen.findByRole('combobox', { name: 'Service' }))
    await userEvent.click(await screen.findByTitle('Airport Management'))

    await userEvent.click(await screen.findByRole('switch', { name: 'Custom Mapping' }))

    const addButtons= await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButtons[1])

    await screen.findByText('The Custom String List can\'t empty.')
  })
})
