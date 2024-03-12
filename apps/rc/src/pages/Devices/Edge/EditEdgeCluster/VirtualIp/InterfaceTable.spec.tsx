/* eslint-disable max-len */
import { EdgeGeneralFixtures, EdgePortConfigFixtures, EdgeStatus } from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { InterfaceTable } from './InterfaceTable'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockLanInterfaces } = EdgePortConfigFixtures

const mockSelectedInterface = Object.fromEntries(Object.entries(mockLanInterfaces)
  .map(([k, v]) => [k, v[0]]))


describe('VirtualIp - InterfaceTable', () => {
  it('should render InterfaceTable successfully', async () => {
    render(
      <InterfaceTable
        nodeList={mockEdgeClusterList.data[0].edgeList as EdgeStatus[]}
        selectedInterface={mockSelectedInterface}
      />
    )

    expect(await screen.findByRole('row', { name: 'Smart Edge 1 Port3 192.168.14.135/ 24' })).toBeVisible()
    expect(await screen.findByRole('row', { name: 'Smart Edge 2 Port3 192.168.14.135/ 24' })).toBeVisible()
  })
})