import userEvent from '@testing-library/user-event'

import { dataApiURL }                                                  from '@acx-ui/analytics/services'
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
    mockGraphqlQuery(dataApiURL, 'Summary', { data: fakeSummary })
    const { asFragment } = render(<Provider><SummaryBoxes/></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show - when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Summary', { data: fakeEmptySummary })
    const { asFragment } = render(<Provider><SummaryBoxes/></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle onClick', async () => {
    mockGraphqlQuery(dataApiURL, 'Summary', { data: fakeSummary })
    render(<Provider><SummaryBoxes/></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const arrows = screen.getAllByTestId('down-arrow')
    await userEvent.click(arrows[0])
    screen.getAllByTestId('up-arrow')
  })
})
