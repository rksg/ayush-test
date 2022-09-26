import userEvent from '@testing-library/user-event'

import { dataApiURL }                                  from '@acx-ui/analytics/services'
import { Provider, store }                             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent } from '@acx-ui/test-utils'
import { DateRange }                                   from '@acx-ui/utils'

import { api }              from './services'
import { networkHierarchy } from './services.spec'

import VenueFilter from '.'


const mockSetNodeFilter = jest.fn()
const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: { networkNodes: [] , switchNodes: [] }
}
const mockUseDashboardFilter = {
  filters,
  setNodeFilter: mockSetNodeFilter
}
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  defaultNetworkPath: [{ type: 'network', name: 'Network' }],
  useDashboardFilter: () => mockUseDashboardFilter
}))
describe('venue Filter', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    jest.clearAllMocks()
  })
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><VenueFilter /></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render venue filter', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    const { asFragment } = render(<Provider><VenueFilter /></Provider>)
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[class="ant-select-selector"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should select network node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><VenueFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(await screen.findByRole('combobox'))
    fireEvent.click(await screen.findByText('venue A'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(mockSetNodeFilter).toHaveBeenCalledTimes(1)
    expect(mockSetNodeFilter).toHaveBeenCalledWith([['venue1']])
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should select multiple network node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><VenueFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(await screen.findByRole('combobox'))
    fireEvent.click(await screen.findByText('venue A'))
    fireEvent.click(await screen.findByText('venue B'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(mockSetNodeFilter).toHaveBeenCalledTimes(1)
    expect(mockSetNodeFilter).toHaveBeenCalledWith([['venue1'], ['venue2']])
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should search node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><VenueFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.type(screen.getByRole('combobox'), 'venue B')
    const ele = await screen.findAllByText('venue B')
    fireEvent.click(ele[1])
    fireEvent.click(await screen.findByText('Apply'))
    expect(mockSetNodeFilter).toHaveBeenCalledTimes(1)
    expect(mockSetNodeFilter).toHaveBeenCalledWith([['venue2']])
  })
})
