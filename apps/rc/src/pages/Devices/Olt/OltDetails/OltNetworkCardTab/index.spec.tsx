import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetailsContext } from '../index'

import { OltNetworkCardTab } from './index'

const params = {
  tenantId: 'tenant-id',
  oltId: 'olt-id'
}

const { mockOlt } = OltFixtures

describe('OltNetworkCardTab', ()=>{ //TODO
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

    expect(screen.getByText(/OltNetworkCardTab/)).toBeVisible()
  })
})
