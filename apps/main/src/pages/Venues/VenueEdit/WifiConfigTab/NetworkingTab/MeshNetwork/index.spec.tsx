import '@testing-library/jest-dom'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { MeshNetwork } from './'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('MeshNetwork', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><MeshNetwork /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
