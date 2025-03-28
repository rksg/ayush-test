import { ReactNode } from 'react'

import { get }            from '@acx-ui/config'
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ConfigChange from './ConfigChange'

jest.mock('./SyncedChart', () => ({ SyncedChart: () => <div data-testid='SyncedChart' /> }))
jest.mock('./KPI', () => ({ KPIs: () => <div data-testid='KPIs' /> }))
jest.mock('./PagedTable', () => ({ PagedTable: () => <div data-testid='PagedTable' /> }))
jest.mock('./Filter', () => ({ Filter: () => <div data-testid='Filter' /> }))
jest.mock('./NetworkFilter', () => ({ NetworkFilter: () => <div data-testid='NetworkFilter' /> }))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  GridCol: (props: { children: ReactNode, style: Record<string, string> }) =>
    <div {...props} data-testid='GridCol' />
}))

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('ConfigChange', () => {
  beforeEach(() => {
    mockGet.mockReturnValue('')
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
  it('should render component correctly', async () => {
    render(<ConfigChange/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('Filter')).toBeVisible()
    expect(await screen.findByTestId('SyncedChart')).toBeVisible()
    expect(await screen.findByTestId('KPIs')).toBeVisible()
    expect(await screen.findByTestId('PagedTable')).toBeVisible()
    expect((await screen.findAllByTestId('GridCol'))[0]).toHaveStyle('minHeight: 170px')
  })
  it('should render component correctly when IS_MLISA_SA', async () => {
    mockGet.mockReturnValue('true')
    render(<ConfigChange/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('Filter')).toBeVisible()
    expect(await screen.findByTestId('SyncedChart')).toBeVisible()
    expect(await screen.findByTestId('KPIs')).toBeVisible()
    expect(await screen.findByTestId('PagedTable')).toBeVisible()
    expect((await screen.findAllByTestId('GridCol'))[0]).toHaveStyle('minHeight: 200px')
  })
})
