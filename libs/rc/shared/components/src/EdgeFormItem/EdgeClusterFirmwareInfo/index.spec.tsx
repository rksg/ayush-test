/* eslint-disable max-len */
import  userEvent    from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { EdgeCompatibilityFixtures, EdgeGeneralFixtures, EdgeUrlsInfo, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider }                                                                              from '@acx-ui/store'
import { mockServer, render, screen }                                                            from '@acx-ui/test-utils'

import { EdgeClusterFirmwareInfo } from './'

const { mockEdgeList } = EdgeGeneralFixtures
const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures

describe('EdgeClusterFirmwareInfo', () => {
  let params: { tenantId: string } = { tenantId: 'mock_t' }
  const mockRouteInfo = {
    path: '/:tenantId/t/' ,
    params
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeList))
      )
    )
  })

  it('should correctly render', async () => {
    render(<Provider>
      <EdgeClusterFirmwareInfo
        featureName={IncompatibilityFeatures.SD_LAN}
        clusterId='test-cluster-id'
      /></Provider>, { route: mockRouteInfo })

    expect(await screen.findByText('Cluster Firmware Version: 1.9.0.100')).toBeVisible()
    const icon = await screen.findByTestId('WarningTriangleSolid')
    await userEvent.hover(icon)
    const warningTxt = await screen.findByText(/SD-LAN feature requires your RUCKUS Edge cluster running firmware version/)
    expect(warningTxt).toHaveTextContent('SD-LAN feature requires your RUCKUS Edge cluster running firmware version 2.1.0.600 or higher. You may upgrade your venue firmware from Administration > Version Management > RUCKUS Edge Firmware')
  })

  it('displays the message when message is a string', async () => {
    const message = 'Test message'
    render(<Provider>
      <EdgeClusterFirmwareInfo
        featureName={IncompatibilityFeatures.SD_LAN}
        clusterId='test-cluster-id'
        message={message}
      /></Provider>, { route: mockRouteInfo })

    expect(await screen.findByText('Cluster Firmware Version: 1.9.0.100')).toBeVisible()
    const icon = await screen.findByTestId('WarningTriangleSolid')
    await userEvent.hover(icon)
    expect(await screen.findByText(message)).toBeInTheDocument()
  })

  it('displays the result of calling the message function when message is a function', async () => {
    const message = (requiredFw?: string) => `Test message with requiredFw: ${requiredFw}`
    render(<Provider>
      <EdgeClusterFirmwareInfo
        featureName={IncompatibilityFeatures.SD_LAN}
        clusterId='test-cluster-id'
        message={message}
      /></Provider>, { route: mockRouteInfo })

    expect(await screen.findByText('Cluster Firmware Version: 1.9.0.100')).toBeVisible()
    const icon = await screen.findByTestId('WarningTriangleSolid')
    await userEvent.hover(icon)
    expect(await screen.findByText('Test message with requiredFw: 2.1.0.600')).toBeInTheDocument()
  })

  it('does not display the Tooltip component when isLower is false', async () => {
    const mockData = cloneDeep(mockEdgeList)
    mockData.data.forEach(node => node.firmwareVersion = '2.1.0.900')

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => res(ctx.json(mockData))
      ))

    render(<Provider><EdgeClusterFirmwareInfo
      featureName={IncompatibilityFeatures.SD_LAN}
      clusterId='test-cluster-id'
    /></Provider>, { route: mockRouteInfo })

    expect(await screen.findByText('Cluster Firmware Version: 2.1.0.900')).toBeVisible()
    expect(screen.queryByTestId('WarningTriangleSolid')).toBeNull()
  })
})