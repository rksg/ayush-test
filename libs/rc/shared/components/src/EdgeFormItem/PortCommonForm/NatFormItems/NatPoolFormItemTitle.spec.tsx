/* eslint-disable max-len */
import React from 'react'

import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { EdgeCompatibilityFixtures, EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                     from '@acx-ui/store'
import { mockServer, render, screen, within }                           from '@acx-ui/test-utils'

import { NatPoolFormItemTitle } from './NatPoolFormItemTitle'

const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures
const { mockEdgeList } = EdgeGeneralFixtures

const mockSn = 'mock-edge-sn'
const params = { tenantId: 'mock_t', clusterId: 'test-cluster-id' }
describe('NatPoolFormItemTitle', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))
      )
    )
  })

  it('renders title when serialNumber is provided', async () => {
    render(<Provider>
      <NatPoolFormItemTitle serialNumber={mockSn} />
    </Provider>)

    expect(screen.getByText('NAT IP Addresses Range')).toBeInTheDocument()
  })

  it('renders tooltip when requiredFw is lower than edge data firmware version', async () => {
    render(<Provider>
      <NatPoolFormItemTitle serialNumber={mockSn} />
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

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => res(ctx.json(mockData))
      )
    )
    render(<Provider>
      <NatPoolFormItemTitle serialNumber={mockSn} />
    </Provider>, { route: { path: '/:tenantId/t/devices/edge/cluster/:clusterId/configure', params } })

    const natPoolTitle = await screen.findByText('NAT IP Addresses Range')
    expect(within(natPoolTitle).queryByTestId('WarningTriangleSolid')).toBeNull()
  })

  it('does not render tooltip when serialNumber is not provided', async () => {
    render(<Provider>
      <NatPoolFormItemTitle serialNumber={undefined} />
    </Provider>)

    const natPoolTitle = await screen.findByText('NAT IP Addresses Range')
    expect(within(natPoolTitle).queryByTestId('WarningTriangleSolid')).toBeNull()
  })
})