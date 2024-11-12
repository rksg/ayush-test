import _ from 'lodash'

import { EdgeLag, EdgeLagFixtures, EdgePort, EdgePortConfigFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'


import { LagMembersComponent } from './LagMembersComponent'
const { mockEdgePortConfig } = EdgePortConfigFixtures
const { mockedEdgeLagList } = EdgeLagFixtures
const mockEdgeCorePortPortConfig = _.cloneDeep(mockEdgePortConfig.ports)
mockEdgeCorePortPortConfig.splice(0, 1)

describe('Edge LAG Members Component', () => {
  it('should correctly render port max speed capability is 0', async () => {
    render(
      <Provider>
        <LagMembersComponent
          data={mockedEdgeLagList.content[0] as EdgeLag}
          portList={mockEdgePortConfig.ports as EdgePort[]}
          existedLagList={mockedEdgeLagList.content as EdgeLag[]}
          lagEnabled={true}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })
    const portCheckboxes = screen.getAllByRole('checkbox')
    expect(portCheckboxes).toHaveLength(mockEdgePortConfig.ports.length)
    expect(screen
    // eslint-disable-next-line max-len
      .queryByText('Please ensure that a LAG requires its port members to have the same speed capability.'))
      .toBeNull()
  })

  it('should correctly render ports max speed capability are different', async () => {
    const mockEdgePortConfigDifferentMaxSpeed = _.cloneDeep(mockEdgePortConfig.ports)
    mockEdgePortConfigDifferentMaxSpeed[0].maxSpeedCapa = 100.123
    render(
      <Provider>
        <LagMembersComponent
          data={mockedEdgeLagList.content[0] as EdgeLag}
          portList={mockEdgePortConfigDifferentMaxSpeed as EdgePort[]}
          existedLagList={mockedEdgeLagList.content as EdgeLag[]}
          lagEnabled={true}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })
    const portCheckboxes = screen.getAllByRole('checkbox')
    expect(portCheckboxes).toHaveLength(mockEdgePortConfigDifferentMaxSpeed.length)
    expect(await screen
      // eslint-disable-next-line max-len
      .findByText('Please ensure that a LAG requires its port members to have the same speed capability.'))
      .toBeVisible()
  })

})