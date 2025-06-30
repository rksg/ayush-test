/* eslint-disable max-len */

import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { EdgeClusterStatus, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { render, screen, within }                 from '@acx-ui/test-utils'

import { NatPoolFormItemTitle } from './NatPoolFormItemTitle'

const { mockEdgeList } = EdgeGeneralFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

const params = { tenantId: 'mock_t', clusterId: 'test-cluster-id' }
const defaultProps = {
  serialNumber: mockEdgeClusterList.data[0].edgeList[0].serialNumber,
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  requiredFw: '2.4.0.1'
}

describe('NatPoolFormItemTitle', () => {
  it('renders title when serialNumber is provided', async () => {
    render(<Provider>
      <NatPoolFormItemTitle {...defaultProps} />
    </Provider>)

    expect(screen.getByText('NAT IP Addresses Range')).toBeInTheDocument()
  })

  it('renders tooltip when requiredFw is lower than edge data firmware version', async () => {
    render(<Provider>
      <NatPoolFormItemTitle {...defaultProps} />
    </Provider>, { route: { path: '/:tenantId/t/devices/edge/cluster/:clusterId/configure', params } })

    const natPoolTitle = await screen.findByText('NAT IP Addresses Range')
    const warningIcon = await within(natPoolTitle).findByTestId('WarningTriangleSolid')
    expect(warningIcon).toBeVisible()
    await userEvent.hover(warningIcon)
    const tooltip = await screen.findByText(/Multiple NAT IP addresses feature requires your/)
    expect(tooltip).toBeInTheDocument()
  })

  it('does not render tooltip when requiredFw is not lower than edge data firmware version', async () => {
    const mockData = cloneDeep(mockEdgeList)
    mockData.data[0].firmwareVersion = '2.4.0.2'
    const mockProps = {
      ...defaultProps,
      clusterInfo: { ...defaultProps.clusterInfo, edgeList: mockData.data } as EdgeClusterStatus
    }

    render(<Provider>
      <NatPoolFormItemTitle {...mockProps} />
    </Provider>, { route: { path: '/:tenantId/t/devices/edge/cluster/:clusterId/configure', params } })

    const natPoolTitle = await screen.findByText('NAT IP Addresses Range')
    expect(within(natPoolTitle).queryByTestId('WarningTriangleSolid')).toBeNull()
  })

  it('does not render tooltip when serialNumber is not provided', async () => {
    render(<Provider>
      <NatPoolFormItemTitle {...defaultProps} serialNumber={undefined} />
    </Provider>)

    const natPoolTitle = await screen.findByText('NAT IP Addresses Range')
    expect(within(natPoolTitle).queryByTestId('WarningTriangleSolid')).toBeNull()
  })
})