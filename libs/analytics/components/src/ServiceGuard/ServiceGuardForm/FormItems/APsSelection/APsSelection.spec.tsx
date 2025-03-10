import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { defaultNetworkPath }                                    from '@acx-ui/analytics/utils'
import { get }                                                   from '@acx-ui/config'
import { dataApi, dataApiURL, rbacApi, rbacApiURL, store }       from '@acx-ui/store'
import { mockGraphqlQuery, mockServer, screen, waitFor, within } from '@acx-ui/test-utils'
import { NetworkNode }                                           from '@acx-ui/utils'

import { mockNetworkHierarchy, mockHiddenAPs, renderForm, mockApHierarchy, mockSystems, mockNetworkNodes } from '../../../__tests__/fixtures'
import { ClientType }                                                                                      from '../../../types'

import { APsSelection, transformSANetworkHierarchy } from './APsSelection'


const { click, type, clear } = userEvent

jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

describe('APsSelection', () => {
  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', { data: mockNetworkHierarchy })
  })

  it('supports select AP from venue', async () => {
    renderForm(<APsSelection />, { initialValues: { clientType: ClientType.VirtualClient } })

    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await click(await screen.findByRole('menuitemcheckbox', { name: /Venue 1/ }))
    await click(await screen.findByRole('menuitemcheckbox', { name: /APs/ }))
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 1/ }))
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 2/ }))

    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByTestId('form-values'))
      .toHaveTextContent(JSON.stringify([{ type: 'zone', name: 'Venue 1' }]))
  })

  it('supports select partial of APs from venue', async () => {
    renderForm(<APsSelection />, { initialValues: { clientType: ClientType.VirtualClient } })

    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await click(await screen.findByRole('menuitemcheckbox', { name: /Venue 2/ }))
    await click(await screen.findByRole('menuitemcheckbox', { name: /APs/ }))
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 3/ }))
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 4/ }))

    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByTestId('form-values')).toHaveTextContent(JSON.stringify([
      { type: 'zone', name: 'Venue 2' },
      { type: 'apMac', list: ['00:00:00:00:00:03', '00:00:00:00:00:04'] }
    ]))
  })

  it('can search for AP', async () => {
    renderForm(<APsSelection />, { initialValues: { clientType: ClientType.VirtualClient } })

    expect(await screen.findByRole('menu')).toBeInTheDocument()

    const combobox = await screen.findByRole('combobox')

    await type(combobox, 'AP 4')
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 4/ }))

    await type(combobox, 'AP 3')
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 3/ }))

    await type(combobox, 'AP 2')
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 2/ }))

    await click(screen.getByRole('button', { name: 'Submit' }))

    const values = await screen.findByTestId('form-values')
    expect(values).toHaveTextContent(JSON.stringify([
      { type: 'zone', name: 'Venue 2' },
      { type: 'apMac', list: ['00:00:00:00:00:04', '00:00:00:00:00:03'] }
    ]))
    expect(values).toHaveTextContent(JSON.stringify([
      { type: 'zone', name: 'Venue 1' },
      { type: 'apMac', list: ['00:00:00:00:00:02'] }
    ]))
  })

  it('should hide unsupport APs when ClientType.VirtualClient', async () => {
    mockGraphqlQuery(
      dataApiURL, 'VenueHierarchy', { data: mockHiddenAPs })
    renderForm(<APsSelection />, { initialValues: { clientType: ClientType.VirtualClient } })

    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await click(await screen.findByRole('menuitemcheckbox', { name: /Venue 1/ }))
    await click(await screen.findByRole('menuitemcheckbox', { name: /APs/ }))
    expect(screen.queryByRole('menuitemcheckbox', { name: /AP 1/ })).toBeNull()
    expect(screen.queryByRole('menuitemcheckbox', { name: /AP 2/ })).toBeNull()
    expect(screen.queryByRole('menuitemcheckbox', { name: /AP 3/ })).toBeValid()
  })

  it('should hide unsupport APs when ClientType.VirtualWirelessClient', async () => {
    mockGraphqlQuery(
      dataApiURL, 'VenueHierarchy', { data: mockHiddenAPs })
    renderForm(<APsSelection />,
      { initialValues: { clientType: ClientType.VirtualWirelessClient } })

    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await click(await screen.findByRole('menuitemcheckbox', { name: /Venue 1/ }))
    await click(await screen.findByRole('menuitemcheckbox', { name: /APs/ }))
    expect(screen.queryByRole('menuitemcheckbox', { name: /AP 1/ })).toBeValid()
    expect(screen.queryByRole('menuitemcheckbox', { name: /AP 2/ })).toBeNull()
    expect(screen.queryByRole('menuitemcheckbox', { name: /AP 3/ })).toBeValid()
  })
})

describe('APsSelection.FieldSummary', () => {
  beforeEach(() => store.dispatch(dataApi.util.resetApiState()))
  it('renders selected APs in Venues', async () => {
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', { data: mockNetworkHierarchy })

    renderForm(<APsSelection.FieldSummary />, {
      initialValues: {
        clientType: ClientType.VirtualClient,
        configs: [{
          networkPaths: {
            networkNodes: [
              [{ type: 'zone', name: 'Venue 2' }],
              [{ type: 'zone', name: 'Venue 1' }, { type: 'apMac', list: ['00:00:00:00:00:01'] }]
            ]
          }
        }]
      }
    })

    const field = within(screen.getByTestId('field'))

    expect(await field.findByText(/Venue 2 — 3 APs/)).toBeVisible()
    expect(await field.findByText(/Venue 1 — 1 AP/)).toBeVisible()
  })
})

describe('RA', () => {
  beforeEach(() => {
    jest.mocked(get).mockReturnValue('true')
    store.dispatch(dataApi.util.resetApiState())
    store.dispatch(rbacApi.util.resetApiState())
    mockServer.use(rest
      .get(`${rbacApiURL}/systems`, (_req, res, ctx) => res(ctx.json(mockSystems))))
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockApHierarchy })
  })
  describe('APsSelection', () => {
    it('supports select AP from network hierarchy', async () => {
      renderForm(<APsSelection />, { initialValues: { clientType: ClientType.VirtualClient } })

      expect(await screen.findByRole('menu')).toBeInTheDocument()

      await click(document.body)
      await click(await screen.findByText(/system 1/))
      await click(await screen.findByText(/zone 1/))
      await click(await screen.findByText(/group 1/))

      await click(screen.getByRole('button', { name: 'Submit' }))

      expect(await screen.findByTestId('form-values'))
        .toHaveTextContent(JSON.stringify([
          { type: 'system', name: 'system 1' },
          { type: 'zone', name: 'zone 1' }
        ]))
    })
    it('supports select partial of APs from network hierarchy', async () => {
      renderForm(<APsSelection />, { initialValues: { clientType: ClientType.VirtualClient } })

      expect(await screen.findByRole('menu')).toBeInTheDocument()

      await click(document.body)
      await click(await screen.findByText(/system 1/))
      await click(await screen.findByText(/domain/))
      await click(await screen.findByText(/zone 2/))
      await click(await screen.findByText(/group 2/))
      await click(await screen.findByText(/ap 1/))

      await click(screen.getByRole('button', { name: 'Submit' }))

      expect(await screen.findByTestId('form-values'))
        .toHaveTextContent(JSON.stringify([
          { type: 'system', name: 'system 1' },
          { type: 'apMac', list: ['00:00:00:00:00:01'] }
        ]))
    })
    it('can search for AP', async () => {
      renderForm(<APsSelection />, { initialValues: { clientType: ClientType.VirtualClient } })

      expect(await screen.findByRole('menu')).toBeInTheDocument()

      await waitFor(async () => { // seems combobox is being replaced
        const combobox = await screen.findByRole('combobox')
        await clear(combobox)
        await type(combobox, 'ap 1')
        await click(await screen.findByRole('menuitemcheckbox', { name: /ap 1/ }))
      }, { timeout: 10000 })
      await click(screen.getByRole('button', { name: 'Submit' }))

      expect(await screen.findByTestId('form-values'))
        .toHaveTextContent(JSON.stringify([
          { type: 'system', name: 'system 1' },
          { type: 'apMac', list: ['00:00:00:00:00:01'] }
        ]))
    })
    it('should hide unsupport APs when ClientType.VirtualClient', async () => {
      renderForm(<APsSelection />, { initialValues: { clientType: ClientType.VirtualClient } })

      expect(await screen.findByRole('menu')).toBeInTheDocument()

      await click(document.body)
      await click(await screen.findByText(/system 1/))
      await click(await screen.findByText(/domain/))
      await click(await screen.findByText(/zone 2/))
      await click(await screen.findByText(/group 2/))

      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 1/ })).toBeValid()
      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 2/ })).toBeValid()
      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 3/ })).toBeNull()
      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 4/ })).toBeNull()
      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 5/ })).toBeValid()
    })
    it('should hide unsupport APs when ClientType.VirtualWirelessClient', async () => {
      renderForm(<APsSelection />, {
        initialValues: { clientType: ClientType.VirtualWirelessClient } })

      expect(await screen.findByRole('menu')).toBeInTheDocument()

      await click(document.body)
      await click(await screen.findByText(/system 1/))
      await click(await screen.findByText(/domain/))
      await click(await screen.findByText(/zone 2/))
      await click(await screen.findByText(/group 2/))

      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 1/ })).toBeValid()
      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 2/ })).toBeValid()
      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 3/ })).toBeValid()
      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 4/ })).toBeNull()
      expect(screen.queryByRole('menuitemcheckbox', { name: /ap 5/ })).toBeValid()
    })
    it('should hide system', async () => {
      renderForm(<APsSelection />, {
        initialValues: { clientType: ClientType.VirtualClient } })

      expect(await screen.findByRole('menu')).toBeInTheDocument()

      await click(document.body)
      await click(await screen.findByText(/system 1/))

      expect(screen.queryByRole('menuitemcheckbox', { name: /system 1/ })).toBeValid()
      expect(screen.queryByRole('menuitemcheckbox', { name: /system 2/ })).toBeValid()
      expect(screen.queryByRole('menuitemcheckbox', { name: /system 3/ })).toBeValid()
      expect(screen.queryByRole('menuitemcheckbox', { name: /system 4/ })).toBeNull()
      expect(screen.queryByRole('menuitemcheckbox', { name: /system 5/ })).toBeNull()
    })
  })
  describe('APsSelection.FieldSummary', () => {
    it('renders selected APs in network hierarchy', async () => {
      renderForm(<APsSelection.FieldSummary />, {
        initialValues: {
          clientType: ClientType.VirtualClient,
          configs: [{
            networkPaths: {
              networkNodes: [
                [ { name: 'system 1', type: 'system' }],
                [ { name: 'system 1', type: 'system' },
                  { name: 'domain', type: 'domain' },
                  { name: 'zone 2', type: 'zone' },
                  { name: 'group 4', type: 'apGroup' }],
                [ { name: 'system 1', type: 'system' },
                  { type: 'apMac', list: ['00:00:00:00:00:01'] }]
              ]
            }
          }]
        }
      })

      const field = within(screen.getByTestId('field'))

      expect(await field
        .findByText(/system 1 \(SZ Cluster\) — 3 AP/)).toBeVisible()
      expect(await field
        // eslint-disable-next-line max-len
        .findByText(/system 1 \(SZ Cluster\) > domain \(Domain\) > zone 2 \(Zone\) > group 4 \(AP Group\) — 0 AP/))
        .toBeVisible()
      expect(await field.findByText(/system 1 \(SZ Cluster\) — 1 AP/)).toBeVisible()
    })
  })
})

describe('transformSANetworkHierarchy', () => {
  it('transform label correctly', () => {
    const data = mockNetworkNodes as NetworkNode[]
    const expectLabels = data[0]['children']?.map(ap => `${ap.name} (${ap.mac}) (Access Point)`)
    const result = transformSANetworkHierarchy(data, defaultNetworkPath)
    const labels = result[0]['children']?.map(node => node.label)
    expect(result[0].label).toEqual(`${data[0].name} (AP Group)`)
    expect(labels).toEqual(expectLabels)
  })
})
