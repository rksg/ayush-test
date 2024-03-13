import userEvent from '@testing-library/user-event'

import { BrowserRouter as Router }                                          from '@acx-ui/react-router-dom'
import { Provider, store, dataApiURL }                                      from '@acx-ui/store'
import { render, waitForElementToBeRemoved, screen, mockGraphqlQuery, act } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                                             from '@acx-ui/utils'
import { DateRange }                                                        from '@acx-ui/utils'

import { DrilldownSelection } from '../HealthDrillDown/config'

import { fakeSummary, fakeEmptySummary } from './__tests__/fixtures'
import { api }                           from './services'

import { SummaryBoxes } from '.'

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('Health Page', () => {
  beforeEach(()=>{
    store.dispatch(api.util.resetApiState())
  })
  it('should match snapshot', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
    const drilldownSelection = null
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes
        filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={jest.fn()}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show - when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeEmptySummary })
    const drilldownSelection = null
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={jest.fn()}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('render when feature toggle is disabled', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeEmptySummary })
    const drilldownSelection = null
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={jest.fn()}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  describe('toggle stats', () => {
    it('should handle toggle stats', async () => {
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      let drilldownSelection: DrilldownSelection = null
      const setDrilldownSelection = jest.fn(
        (val: typeof drilldownSelection) => drilldownSelection = val
      )
      const { rerender } = render(<Router><Provider><SummaryBoxes
        filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={setDrilldownSelection}
      /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const moreDetailsLinks = screen.getAllByText('(More details)')
      expect(moreDetailsLinks).toHaveLength(4)

      await act(async () => await userEvent.click(moreDetailsLinks[0]))
      rerender(<Router><Provider><SummaryBoxes
        filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={setDrilldownSelection}
      /></Provider></Router>)
      expect(moreDetailsLinks).toHaveLength(4)

      await act(async () => await userEvent.click(moreDetailsLinks[0]))
      rerender(<Router><Provider><SummaryBoxes
        filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={setDrilldownSelection}
      /></Provider></Router>)
      expect(moreDetailsLinks).toHaveLength(4)
    })

    it('should handle toggle ttc', async () => {
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      let drilldownSelection: DrilldownSelection = null
      const setDrilldownSelection = jest.fn(
        (val: typeof drilldownSelection) => drilldownSelection = val
      )
      const { rerender } = render(<Router><Provider><SummaryBoxes
        filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={setDrilldownSelection}
      /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      expect(screen.getAllByText('(More details)')).toHaveLength(4)

      const moreDetailsLinks = screen.getAllByText('(More details)')
      await act(async () => await userEvent.click(moreDetailsLinks[3]))
      rerender(<Router><Provider><SummaryBoxes
        filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={setDrilldownSelection}
      /></Provider></Router>)
      expect(screen.getAllByText('(More details)')).toHaveLength(4)

      await act(async () => await userEvent.click(moreDetailsLinks[3]))
      rerender(<Router><Provider><SummaryBoxes
        filters={filters}
        drilldownSelection={drilldownSelection}
        setDrilldownSelection={setDrilldownSelection}
      /></Provider></Router>)
      expect(screen.getAllByText('(More details)')).toHaveLength(4)
    })
  })
})
