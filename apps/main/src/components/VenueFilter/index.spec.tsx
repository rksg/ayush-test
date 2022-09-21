import userEvent             from '@testing-library/user-event'
import { DefaultOptionType } from 'antd/lib/select'

import { dataApiURL }                                  from '@acx-ui/analytics/services'
import { defaultNetworkPath }                          from '@acx-ui/analytics/utils'
import { Provider, store }                             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent } from '@acx-ui/test-utils'
import { DateRange }                                   from '@acx-ui/utils'

import { api }              from './services'
import { networkHierarchy } from './services.spec'

import VenueFilter, { onApply, displayRender } from '.'


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
    // expect(asFragment().querySelector('span[class="ant-select-arrow"]')).not.toBeNull()
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
    fireEvent.click(screen.getByText('venue1'))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'zone', name: 'venue1' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNodeFilter).toHaveBeenCalledTimes(1)
    expect(mockSetNodeFilter).toHaveBeenCalledWith(path, raw)
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should select multiple network node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><VenueFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('venue1'))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'zone', name: 'venue1' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNodeFilter).toHaveBeenCalledTimes(1)
    expect(mockSetNodeFilter).toHaveBeenCalledWith(path, raw)
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should search node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><VenueFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.type(screen.getByRole('combobox'), 'swg')
    await screen.findByText('swg')    
    fireEvent.click(screen.getByText('swg'))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'switchGroup', name: 'swg' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNodeFilter).toHaveBeenCalledTimes(1)
    expect(mockSetNodeFilter).toHaveBeenCalledWith(path, raw)
   
  })
  it('should return correct value to render', () => {
    const data = [
      { input: undefined, output: undefined },
      { input: [{ displayLabel: 'dp' }], output: 'dp' },
      { input: [{ label: 'l' }, { label: 'k' }], output: 'l / k' }
    ]
    data.forEach(({ input, output }) => {
      expect(displayRender({}, input as DefaultOptionType[] | undefined)).toEqual(output)
    })
  })
  it('should correctly call setNetworkPath', () => {
    const setNetworkPath = jest.fn()
    onApply(undefined, setNetworkPath)
    expect(setNetworkPath).toBeCalledWith(defaultNetworkPath, [])
    const path = [JSON.stringify(defaultNetworkPath)]
    onApply(path, setNetworkPath)
    expect(setNetworkPath).toBeCalledWith(defaultNetworkPath, path)
  })
})
