import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ConfigChange } from '.'

import {} from './Chart'

jest.mock('./Chart', () => ({
  Chart: () => <div data-testid='Chart' />
}))

jest.mock('./ConfigChangeTable', () => ({
  ConfigChangeTable: () => <div data-testid='ConfigChangeTable' />
}))

describe('ConfigChange', () => {
  it('should render page correctly', async () => {
    render(<ConfigChange/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('Chart')).toBeVisible()
    expect(await screen.findByText('kpi')).toBeVisible()
    expect(await screen.findByTestId('ConfigChangeTable')).toBeVisible()
  })
})
