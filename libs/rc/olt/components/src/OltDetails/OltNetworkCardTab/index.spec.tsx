import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetailsContext } from '../OltDetailsContext'

import { OltNetworkCardTab } from './index'

const { mockOlt } = OltFixtures

describe('OltNetworkCardTab', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  it('should render correctly', () => {
    render(
      <Provider>
        <OltDetailsContext.Provider value={{
          oltDetailsContextData: mockOlt
        }}>
          <OltNetworkCardTab />
        </OltDetailsContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByRole('tab', { name: 'Uplink' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'OOB' })).toBeVisible()

  })
})
