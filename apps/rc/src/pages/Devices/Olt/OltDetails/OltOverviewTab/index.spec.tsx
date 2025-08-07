import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetailsContext } from '../index'

import { OltOverviewTab } from './'

const { mockOlt } = OltFixtures

describe('OltOverviewTab', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  it('should render correctly', async () => {
    render(<Provider>
      <OltDetailsContext.Provider value={{
        oltDetailsContextData: mockOlt
      }}>
        <OltOverviewTab />
      </OltDetailsContext.Provider>
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText(/MF-2/)).toBeInTheDocument()
  })
})
