import '@testing-library/jest-dom'


import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { AlarmsTable } from '.'


describe('AlarmsTable', () => {
  const params = { venueId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }


  it('should render CellularRadioSimSettings  successfully', async () => {

    const { asFragment } = render(
      <Provider>
        <AlarmsTable />
      </Provider> , {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

})
