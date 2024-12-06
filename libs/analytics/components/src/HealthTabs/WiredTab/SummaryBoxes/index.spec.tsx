import { useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { BrowserRouter as Router }                                                from '@acx-ui/react-router-dom'
import { Provider, store, dataApiURL }                                            from '@acx-ui/store'
import { render, waitForElementToBeRemoved, screen, mockGraphqlQuery, fireEvent } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                                                   from '@acx-ui/utils'
import { DateRange }                                                              from '@acx-ui/utils'

import { impactedClientsData, moreDetailsDataFixture } from '../MoreDetails/__tests__/fixtures'

import {
  wiredSummaryDataFixture,
  wiredSummaryNoDataFixture
} from './__tests__/fixtures'
import { api } from './services'

import { SummaryBoxes } from '.'

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('Wired SummaryBoxes', () => {
  beforeEach(()=>{
    store.dispatch(api.util.resetApiState())
  })
  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'WiredSummaryQuery', { data: wiredSummaryDataFixture })

    const { asFragment } = render(
      <Router><Provider><SummaryBoxes
        filters={filters}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly when 10010e FF is enabled', async () => {
    mockGraphqlQuery(dataApiURL, 'WiredSummaryQuery', { data: wiredSummaryDataFixture })
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { asFragment } = render(
      <Router><Provider><SummaryBoxes
        filters={filters}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should show no data when no switches', async () => {
    mockGraphqlQuery(dataApiURL, 'WiredSummaryQuery', { data: wiredSummaryNoDataFixture })
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters} noSwitches={true} /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should show when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'WiredSummaryQuery', { data: wiredSummaryNoDataFixture })
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters} /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should open the drawer on more info click', async () => {
    mockGraphqlQuery(dataApiURL, 'WiredSummaryQuery', { data: wiredSummaryDataFixture })
    mockGraphqlQuery(dataApiURL, 'Network', { data: moreDetailsDataFixture })
    mockGraphqlQuery(dataApiURL, 'SwitchClients', { data: impactedClientsData })
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes
        filters={filters}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const tiles = screen.getAllByText(/\(more details\)/i)
    tiles.forEach( async tile => {
      await fireEvent.click(tile)
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
