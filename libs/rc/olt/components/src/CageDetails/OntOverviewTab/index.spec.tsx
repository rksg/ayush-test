import { OltCageStateEnum } from '@acx-ui/olt/utils'
import { Provider }         from '@acx-ui/store'
import { screen, render }   from '@acx-ui/test-utils'

import { OntOverviewTab } from '.'

describe('OntOverviewTab', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OntOverviewTab data={[{
        portIdx: '1',
        status: OltCageStateEnum.UP,
        vlan: ['30'],
        poePower: 2.5,
        taggedVlan: ['30'],
        untaggedVlan: ['12']
      }]} />
    </Provider>, { route: { params } })

    expect(screen.getByText('01')).toBeInTheDocument()
  })

})
