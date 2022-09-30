import '@testing-library/jest-dom'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { SwitchAAATab } from './SwitchAAATab'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('SwitchAAATab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><SwitchAAATab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
