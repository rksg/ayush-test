import '@testing-library/jest-dom'


import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { NetworkingTab } from '.'


describe('CellularOptionsForm', () => {
  const params = { venueId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }


  it('should render CellularRadioSimSettings  successfully', async () => {

    const { asFragment } = render(
      <Provider>
        <NetworkingTab />
      </Provider> , {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

})
