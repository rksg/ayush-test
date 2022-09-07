import userEvent             from '@testing-library/user-event'
import { DefaultOptionType } from 'antd/lib/select'

import { dataApiURL }                                  from '@acx-ui/analytics/services'
import { defaultNetworkPath }                          from '@acx-ui/analytics/utils'
import { Provider, store }                             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent } from '@acx-ui/test-utils'
import { DateRange }                                   from '@acx-ui/utils'

import { api }               from './services'
import { networkHierarchy }  from './services.spec'
import { NonSelectableItem } from './styledComponents'

import NetworkFilter, { onApply, displayRender } from './index'


const mockSetNetworkPath = jest.fn()
const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}
const mockUseAnalyticsFilter = {
  filters,
  setNetworkPath: mockSetNetworkPath,
  raw: []
}
jest.mock('@acx-ui/analytics/utils', () => ({
  defaultNetworkPath: [{ type: 'network', name: 'Network' }],
  useAnalyticsFilter: () => mockUseAnalyticsFilter
}))
describe('Network Filter', () => {
  
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    jest.clearAllMocks()
  })
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><NetworkFilter /></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render network filter', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: { children: null } } }
    })
    const { asFragment } = render(<Provider><NetworkFilter /></Provider>)
    await screen.findByText('Entire Organization')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('span[class="ant-select-arrow"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should select network node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><NetworkFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('venue1'))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'zone', name: 'venue1' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNetworkPath).toHaveBeenCalledTimes(1)
    expect(mockSetNetworkPath).toHaveBeenCalledWith(path, raw)
    await userEvent.click(screen.getByRole('combobox'))
  })
  it('should not select non-selectable element', async () => {
    const select = jest.fn()
    render(<NonSelectableItem onClick={select}>item</NonSelectableItem>)
    fireEvent.click(screen.getByText('item'))
    expect(select).toBeCalledTimes(0)
  })
  it('should search node', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
    render(<Provider><NetworkFilter /></Provider>)
    await screen.findByText('Entire Organization')
    await userEvent.type(screen.getByRole('combobox'), 'swg')
    await screen.findByText('swg')    
    fireEvent.click(screen.getByText('swg'))
    const path = [
      { type: 'network', name: 'Network' },
      { type: 'switchGroup', name: 'swg' }
    ]
    const raw = [JSON.stringify(path)]
    expect(mockSetNetworkPath).toHaveBeenCalledTimes(1)
    expect(mockSetNetworkPath).toHaveBeenCalledWith(path, raw)
   
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
