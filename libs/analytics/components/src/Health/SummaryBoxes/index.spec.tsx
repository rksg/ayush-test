import userEvent from '@testing-library/user-event'

import { BrowserRouter as Router }     from '@acx-ui/react-router-dom'
import { Provider, store, dataApiURL } from '@acx-ui/store'
import { render,
  waitForElementToBeRemoved,
  screen,
  mockGraphqlQuery,
  act,
  within,
  waitFor } from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import { mockConnectionDrillDown, mockTtcDrillDown } from '../HealthDrillDown/__tests__/fixtures'

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
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes
        filters={filters}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show - when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeEmptySummary })
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters} /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  describe('SummaryBoxes open drawer', () => {
    it('should match snapshot open drawer connectionFailure', async () => {
      mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      const { asFragment } = render(<Router><Provider>
        <SummaryBoxes filters={filters} /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/Successful Connections/i)).toBeVisible()
      const tiles = screen.getAllByText(/\(more details\)/i)
      expect(tiles).toHaveLength(4)
      tiles.forEach( async tile => {
        await userEvent.click(tile)
      })
      expect(asFragment()).toMatchSnapshot()
    })

    it('should handle open drawer Successful Connections', async () => {
      mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      render(<Router><Provider>
        <SummaryBoxes filters={filters} /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/Successful Connections/i)).toBeVisible()
      const tiles = screen.getAllByText(/\(more details\)/i)
      expect(tiles).toHaveLength(4)
      await act(async () => await userEvent.click(tiles[0]))
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/Connection Failures/i)).toBeVisible()
      const icon = await within(dialog).findByTestId('CloseSymbol')
      expect(icon).toBeVisible()
      await userEvent.click(icon)
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should handle open drawer Failed Connections', async () => {
      mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      render(<Router><Provider>
        <SummaryBoxes filters={filters} /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/Failed Connections/i)).toBeVisible()
      const tiles = screen.getAllByText(/\(more details\)/i)
      expect(tiles).toHaveLength(4)
      await act(async () => await userEvent.click(tiles[1]))
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/Connection Failures/i)).toBeVisible()
      const icon = await within(dialog).findByTestId('CloseSymbol')
      expect(icon).toBeVisible()
      await userEvent.click(icon)
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should handle open drawer Connection Success Ratio', async () => {
      mockGraphqlQuery(dataApiURL, 'ConnectionDrilldown', { data: mockConnectionDrillDown })
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      render(<Router><Provider>
        <SummaryBoxes filters={filters} /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/Connection Success Ratio/i)).toBeVisible()
      const tiles = screen.getAllByText(/\(more details\)/i)
      expect(tiles).toHaveLength(4)
      await act(async () => await userEvent.click(tiles[2]))
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/Connection Failures/i)).toBeVisible()
      const icon = await within(dialog).findByTestId('CloseSymbol')
      expect(icon).toBeVisible()
      await userEvent.click(icon)
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should handle open drawer ttc', async () => {
      mockGraphqlQuery(dataApiURL, 'TTCDrilldown', { data: mockTtcDrillDown })
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      render(<Router><Provider>
        <SummaryBoxes filters={filters} /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/Avg Time To Connect/i)).toBeVisible()
      const tiles = screen.getAllByText(/\(more details\)/i)
      expect(tiles).toHaveLength(4)
      await act(async () => await userEvent.click(tiles[3]))
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/Average Time To Connect/i)).toBeVisible()
      const icon = await within(dialog).findByTestId('CloseSymbol')
      expect(icon).toBeVisible()
      await userEvent.click(icon)
      await waitFor(() => expect(dialog).not.toBeVisible())
    })
  })
})
