import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetailsContext } from '../../OltDetailsContext'

import { OltPanelTab } from './'

const { mockOlt } = OltFixtures

jest.mock('../../OltFrontPanel', () => ({
  OltFrontPanel: () => <div data-testid='OltFrontPanel' />
}))

describe('OltPanelTab', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }
  it('should render correctly', async () => {
    render(<Provider>
      <OltDetailsContext.Provider value={{
        oltDetailsContextData: mockOlt
      }}>
        <OltPanelTab />
      </OltDetailsContext.Provider>
    </Provider>, {
      route: { params }
    })
    expect(screen.getByTestId('OltFrontPanel')).toBeInTheDocument()
  })
})
