import '@testing-library/jest-dom'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { NetworkDetailsReportTab } from './index'

describe('NetworkDetailsReportTab', () => {
  it('renders without crashing', () => {
    render(<NetworkDetailsReportTab />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(screen.getByText('Network Overview')).toBeInTheDocument()
  })
})
