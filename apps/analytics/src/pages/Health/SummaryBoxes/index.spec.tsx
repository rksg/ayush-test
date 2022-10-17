import userEvent from '@testing-library/user-event'

import { dataApiURL }                                                  from '@acx-ui/analytics/services'
import { BrowserRouter as Router }                                     from '@acx-ui/react-router-dom'
import { Provider, store }                                             from '@acx-ui/store'
import { render, waitForElementToBeRemoved, screen, mockGraphqlQuery } from '@acx-ui/test-utils'

import { fakeSummary, fakeEmptySummary } from './__tests__/fixtures'
import { api }                           from './services'

import { SummaryBoxes } from '.'

jest.mock('@acx-ui/icons', ()=> ({
  ...jest.requireActual('@acx-ui/icons'),
  CaretDoubleUpOutlined: () => <div data-testid='up-arrow'/>,
  CaretDoubleDownOutlined: () => <div data-testid='down-arrow'/>
}), { virtual: true })
describe('Incidents Page', () => {
  beforeEach(()=>{
    store.dispatch(api.util.resetApiState())
  })
  it('should match snapshot', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
    const { asFragment } = render(<Router><Provider><SummaryBoxes/></Provider></Router>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show - when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeEmptySummary })
    const { asFragment } = render(<Router><Provider><SummaryBoxes/></Provider></Router>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  describe('toggle stats', () => {
    it('should handle toggle stats', async () => {
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      render(<Router><Provider><SummaryBoxes/></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const downArrows = screen.getAllByTestId('down-arrow')
      expect(downArrows).toHaveLength(4)

      await userEvent.click(downArrows[0])
      const upArrows = screen.getAllByTestId('up-arrow')
      expect(upArrows).toHaveLength(3)

      await userEvent.click(upArrows[1])
      expect(screen.getAllByTestId('down-arrow')).toHaveLength(4)
    })

    it('should handle toggle ttc', async () => {
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      render(<Router><Provider><SummaryBoxes/></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      expect(screen.getAllByTestId('down-arrow')).toHaveLength(4)

      const button = screen.getByRole('button', { name: /time to connect/i })
      await userEvent.click(button)
      expect(screen.getAllByTestId('up-arrow')).toHaveLength(1)

      await userEvent.click(button)
      expect(screen.getAllByTestId('down-arrow')).toHaveLength(4)
    })
  })
})
