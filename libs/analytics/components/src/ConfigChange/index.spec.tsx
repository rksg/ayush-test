import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ConfigChange } from '.'

jest.mock('./Chart', () => ({ Chart: () => <div data-testid='Chart' /> }))
jest.mock('./KPI', () => ({ KPIs: () => <div data-testid='KPIs' /> }))
jest.mock('./Table', () => ({ Table: () => <div data-testid='Table' /> }))

describe('ConfigChange', () => {
  it('should render page correctly', async () => {
    render(<ConfigChange/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('Chart')).toBeVisible()
    expect(await screen.findByTestId('KPIs')).toBeVisible()
    expect(await screen.findByTestId('Table')).toBeVisible()
  })
})
