import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetailsContext } from '../index'

import { OltLineCardTab } from './index'

const { mockOlt, mockOltCageList } = OltFixtures

describe('OltLineCardTab', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  it('should render correctly', () => {
    render(
      <Provider>
        <OltDetailsContext.Provider value={{
          oltDetailsContextData: mockOlt
        }}>
          <OltLineCardTab
            oltDetails={mockOlt}
            oltCages={mockOltCageList}
            isLoading={false}
            isFetching={false}
          />
        </OltDetailsContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getAllByText(/PON LC/)).toHaveLength(2)
  })
})
