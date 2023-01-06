import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ReportHeader } from '.'


jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  NetworkFilter: () => <div data-testid='network-filter' />
}))

describe('Report Header', () => {
  const params = { tenantId: 'tenant-id' }

  it('should render the report header', async () => {
    render(<Provider>
      <ReportHeader name={'Some Report'} />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Some Report')).toBeTruthy()
  })

  it('should render the report header with footer', async () => {
    const footer = <div>Footer component</div>
    render(<Provider>
      <ReportHeader name={'Some Report'} footer={footer}/>
    </Provider>, { route: { params } })
    expect(await screen.findByText('Footer component')).toBeTruthy()
  })
})
