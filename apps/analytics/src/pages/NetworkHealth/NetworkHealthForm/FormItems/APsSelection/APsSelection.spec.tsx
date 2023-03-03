import userEvent from '@testing-library/user-event'

import { dataApi, dataApiURL }              from '@acx-ui/analytics/services'
import { store }                            from '@acx-ui/store'
import { mockGraphqlQuery, screen, within } from '@acx-ui/test-utils'

import { mockNetworkHierarchy, renderForm } from '../../../__tests__/fixtures'

import { APsSelection } from './APsSelection'

const { click, type } = userEvent

describe('APsSelection', () => {
  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', { data: mockNetworkHierarchy })
  })

  it('supports select AP from venue', async () => {
    renderForm(<APsSelection />)

    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await click(await screen.findByRole('menuitemcheckbox', { name: 'Venue 1' }))
    await click(await screen.findByRole('menuitemcheckbox', { name: 'APs' }))
    await click(await screen.findByRole('menuitemcheckbox', { name: 'AP 1' }))
    await click(await screen.findByRole('menuitemcheckbox', { name: 'AP 2' }))

    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByTestId('form-values'))
      .toHaveTextContent(JSON.stringify([{ type: 'zone', name: 'Venue 1' }]))
  })

  it('supports select partial of APs from venue', async () => {
    renderForm(<APsSelection />)

    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await click(await screen.findByRole('menuitemcheckbox', { name: 'Venue 2' }))
    await click(await screen.findByRole('menuitemcheckbox', { name: 'APs' }))
    await click(await screen.findByRole('menuitemcheckbox', { name: 'AP 3' }))
    await click(await screen.findByRole('menuitemcheckbox', { name: 'AP 4' }))

    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByTestId('form-values')).toHaveTextContent(JSON.stringify([
      { type: 'zone', name: 'Venue 2' },
      { type: 'apMac', list: ['00:00:00:00:00:03', '00:00:00:00:00:04'] }
    ]))
  })

  it('can search for AP', async () => {
    renderForm(<APsSelection />)

    expect(await screen.findByRole('menu')).toBeInTheDocument()

    const combobox = await screen.findByRole('combobox')

    await type(combobox, '2')
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 4/ }))

    await type(combobox, '2')
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 3/ }))

    await type(combobox, '2')
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
})

describe('APsSelection.FieldSummary', () => {
  beforeEach(() => store.dispatch(dataApi.util.resetApiState()))

  it('renders selected APs in Venues', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', { data: mockNetworkHierarchy })

    renderForm(<APsSelection.FieldSummary />, {
      initialValues: {
        networkPaths: {
          networkNodes: [
            [{ type: 'zone', name: 'Venue 2' }],
            [{ type: 'zone', name: 'Venue 1' }, { type: 'apMac', list: ['00:00:00:00:00:01'] }]
          ]
        }
      }
    })

    const field = within(screen.getByTestId('field'))

    expect(await field.findByText(/Venue 2 — 3 APs/)).toBeVisible()
    expect(await field.findByText(/Venue 1 — 1 AP/)).toBeVisible()
  })
})
