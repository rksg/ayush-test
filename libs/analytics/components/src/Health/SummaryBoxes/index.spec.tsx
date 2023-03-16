import userEvent         from '@testing-library/user-event'
import { defineMessage } from 'react-intl'

import { AnalyticsFilter }                                             from '@acx-ui/analytics/utils'
import { BrowserRouter as Router }                                     from '@acx-ui/react-router-dom'
import { dataApiURL, Provider, store }                                 from '@acx-ui/store'
import { render, waitForElementToBeRemoved, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                                                   from '@acx-ui/utils'

import { fakeSummary, fakeEmptySummary } from './__tests__/fixtures'
import { api }                           from './services'

import { SummaryBoxes, Box } from '.'

describe('box', () => {
  const boxProps = {
    type: 'successCount',
    title: defineMessage({ defaultMessage: 'test box' }),
    suffix: '/suffix',
    // isOpen: false,
    value: '100'
  }
  it('should render correctly', async () => {
    // TODO: post GA
    // const onClick = jest.fn()
    // const { asFragment } = render(<Box {...boxProps} isOpen onClick={onClick}/>)
    // expect(asFragment()).toMatchSnapshot()
    // await userEvent.click(screen.getByTestId('CaretDoubleUpOutlined'))
    // expect(onClick).toBeCalledTimes(1)
    const { asFragment } = render(<Box {...boxProps} />)
    expect(asFragment()).toMatchSnapshot()
  })
})

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}

describe('Incidents Page', () => {
  beforeEach(()=>{
    store.dispatch(api.util.resetApiState())
  })
  it('should match snapshot', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters}/></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show - when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeEmptySummary })
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters}/></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  // TODO: remove skip after feature available
  describe.skip('toggle stats', () => {
    it('should handle toggle stats', async () => {
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      render(<Router><Provider><SummaryBoxes filters={filters}/></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const downArrows = screen.getAllByTestId('CaretDoubleDownOutlined')
      expect(downArrows).toHaveLength(4)

      await userEvent.click(downArrows[0])
      const upArrows = screen.getAllByTestId('CaretDoubleUpOutlined')
      expect(upArrows).toHaveLength(3)

      await userEvent.click(upArrows[1])
      expect(screen.getAllByTestId('CaretDoubleDownOutlined')).toHaveLength(4)
    })

    it('should handle toggle ttc', async () => {
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      render(<Router><Provider><SummaryBoxes filters={filters}/></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      expect(screen.getAllByTestId('CaretDoubleDownOutlined')).toHaveLength(4)

      const button = screen.getByRole('button', { name: /time to connect/i })
      await userEvent.click(button)
      expect(screen.getAllByTestId('CaretDoubleUpOutlined')).toHaveLength(1)

      await userEvent.click(button)
      expect(screen.getAllByTestId('CaretDoubleDownOutlined')).toHaveLength(4)
    })
  })
})
