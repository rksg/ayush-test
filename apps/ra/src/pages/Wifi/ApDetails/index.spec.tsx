import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ApDetails from '.'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))


describe('ApDetails', () => {
  it('should render correctly', async () => {
    const params = {
      apId: 'ap-id'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/wifi/:apId/details/reports' }
    })
    expect(screen.getByRole('heading', { name: /ap\-id/i }).textContent)
      .toEqual('ap-id')
  })

})
