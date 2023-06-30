import userEvent from '@testing-library/user-event'

import { Provider, dataApiURL, store }                                                    from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, within, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import '@testing-library/jest-dom'

import { configChanges } from '../__tests__/fixtures'
import { api }           from '../services'

import { Table } from '.'

describe('Table', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<Table/>, { wrapper: Provider, route: {} })
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<Table/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(1)
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<Table/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(8)
    expect(await screen.findByText('480')).toBeVisible()
    expect(await screen.findByText('Background scanning')).toBeVisible()
    expect(await screen.findByText('Auto')).toBeVisible()
    expect(await screen.findByText('true')).toBeVisible()
    expect(await screen.findByText('Default')).toBeVisible()
    expect(await screen.findByText('Enabled')).toBeVisible()
  })

  it('should log rows when clicked', async () => {
    const onRowClick = jest.fn()
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<Table onRowClick={onRowClick}/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    const radio = await screen.findAllByRole('radio')

    await userEvent.click(radio[0])

    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick).toHaveBeenCalledWith({
      id: 0,
      value: {
        children: undefined,
        id: 0,
        key: 'initialState.ccmAp.radio24g.radio.channel_fly_mtbc',
        name: '94:B3:4F:3D:21:80',
        newValues: ['480'],
        oldValues: [],
        timestamp: '1685427082100',
        type: 'ap'
      }
    })
  })
})
