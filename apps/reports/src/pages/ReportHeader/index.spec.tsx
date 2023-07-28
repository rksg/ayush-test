import { ReportType }     from '@acx-ui/reports/components'
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
      <ReportHeader name={'Some Report'} type={ReportType.ACCESS_POINT}/>
    </Provider>, { route: { params } })
    expect(await screen.findByText('Some Report')).toBeTruthy()
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider>
      <ReportHeader name={'Some Report'} type={ReportType.ACCESS_POINT}/>
    </Provider>, { route: { params } })
    expect(await screen.findByText('Business Insights')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Reports'
    })).toBeVisible()
  })

  it('should render the report header with footer', async () => {
    const footer = <div>Footer component</div>
    render(<Provider>
      <ReportHeader name={'Some Report'} footer={footer} type={ReportType.ACCESS_POINT}/>
    </Provider>, { route: { params } })
    expect(await screen.findByText('Footer component')).toBeTruthy()
  })
})
