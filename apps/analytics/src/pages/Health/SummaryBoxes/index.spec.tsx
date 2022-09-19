import userEvent from '@testing-library/user-event'

import { dataApiURL }                                                  from '@acx-ui/analytics/services'
import { Provider, store }                                             from '@acx-ui/store'
import { render, waitForElementToBeRemoved, screen, mockGraphqlQuery } from '@acx-ui/test-utils'

import { fakeSummary } from './__tests__/fixtures'
import { api }         from './services'

import { SummaryBoxes } from '.'

jest.mock('@acx-ui/icons', ()=> ({
  ...jest.requireActual('@acx-ui/icons'),
  CaretDoubleUpOutlined: () => <div data-testid='up-arrow'/>,
  CaretDoubleDownOutlined: () => <div data-testid='down-arrow'/>
}), { virtual: true })

describe('Incidents Page', () => {
  beforeEach(()=>{
    store.dispatch(api.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'Summary', { data: fakeSummary })
  })
  it('should match snapshot', async () => {
    const { asFragment } = render(<Provider><SummaryBoxes/></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle onClick', async () => {
    render(<Provider><SummaryBoxes/></Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const arrows = screen.getAllByTestId('down-arrow')
    await userEvent.click(arrows[0])
    screen.getAllByTestId('up-arrow')
  })
})
