
import { edgeApi }                         from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeStatus } from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { NodesTabs } from './'

const { mockEdgeClusterList } = EdgeGeneralFixtures

describe('EdgeCluster NodesTabs', () => {
  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())
  })

  it('should display all nodes', async () => {
    render(<Provider>
      <NodesTabs
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        content={() => <div data-testid='rc-nodeTabs-content'/>}
      />
    </Provider>)

    await screen.findByRole('tab', { name: 'Smart Edge 1' })
    screen.getByRole('tab', { name: 'Smart Edge 2' })
    expect(screen.getAllByRole('tab').length).toBe(2)
  })
})