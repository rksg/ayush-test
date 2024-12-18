import { useContext } from 'react'

import userEvent from '@testing-library/user-event'

import type { ConfigChange, ConfigChangePaginationParams }             from '@acx-ui/components'
import { get }                                                         from '@acx-ui/config'
import { useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { Provider, dataApiURL }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { DateRange }                                                   from '@acx-ui/utils'

import { configChanges } from './__tests__/fixtures'
import { Chart }         from './Chart'
import {
  ConfigChangeProvider,
  ConfigChangeContext
} from './context'

jest.mock('@acx-ui/components', () => {
  const configChange = (require('./__tests__/fixtures')
    .configChanges as ConfigChange[])
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .map((value, id)=>({ ...value, id }))
    .at(-1)!
  return {
    ...jest.requireActual('@acx-ui/components'),
    ConfigChangeChart: ({ data, selectedData, pagination, onDotClick }: {
      data: ConfigChange[],
      selectedData?: ConfigChange,
      pagination?: ConfigChangePaginationParams
      onDotClick: (params: ConfigChange) => void
    }) => {
      return <>
        <div>{data.at(-1)?.type}</div>
        <div>{selectedData?.type}</div>
        <div>{JSON.stringify(pagination)}</div>
        <div data-testid='dot' onClick={() => onDotClick(configChange)} />
        <div data-testid='ConfigChangeChart' />
      </>
    }
  }
})

const mockGet = jest.mocked(get)
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('Chart', () => {
  const data = configChanges
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .map((value, id)=>({ ...value, id }))
  beforeEach(() => {
    mockGet.mockReturnValue('true')
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  it('should render page correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Chart/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    expect(await screen.findAllByText('intentAI')).toHaveLength(1)
  })
  it('should show empty chart', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Chart/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
  })
  it('should render page correctly with selected data', async () => {
    const TestComponent = () => {
      const { setSelected } = useContext(ConfigChangeContext)
      return <div data-testid='test' onClick={() => { setSelected(data[0]) }}/>
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: data } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <div><Chart/><TestComponent/></div>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()

    await userEvent.click(await screen.findByTestId('test'))
    expect(await screen.findAllByText('intentAI')).toHaveLength(1)
    expect(await screen.findByText('ap')).toBeVisible()
  })
  it('should handle click on dot', async () => {
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    render(<ConfigChangeProvider dateRange={DateRange.last7Days}>
      <Chart/>
    </ConfigChangeProvider>, { wrapper: Provider, route: {} })
    expect(await screen.findAllByText('intentAI')).toHaveLength(1)
    expect(await screen.findByTestId('ConfigChangeChart')).toBeVisible()
    expect(await screen.findByText(
      '{"current":1,"pageSize":10,"defaultPageSize":10,"total":0}')).toBeVisible()

    await userEvent.click(screen.getByTestId('dot'))
    expect(await screen.findAllByText('intentAI')).toHaveLength(2)
    expect(await screen.findByText(
      '{"current":2,"pageSize":10,"defaultPageSize":10,"total":0}')).toBeVisible()
  })
})
