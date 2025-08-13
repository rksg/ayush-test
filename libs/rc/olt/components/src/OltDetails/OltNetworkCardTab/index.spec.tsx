import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetailsContext } from '../OltDetailsContext'

import { OltNetworkCardTab } from './index'

const { mockOlt, mockOltPortList } = OltFixtures

describe('OltNetworkCardTab', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  it('should render correctly', () => {
    render(
      <Provider>
        <OltDetailsContext.Provider value={{
          oltDetailsContextData: mockOlt
        }}>
          <OltNetworkCardTab
            oltDetails={mockOlt}
            oltPorts={mockOltPortList}
            isLoading={false}
            isFetching={false}/>
        </OltDetailsContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText(/Uplink/)).toBeVisible()
    expect(screen.getByText(/OOB/)).toBeVisible()
  })
})
