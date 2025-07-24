/* eslint-disable max-len */

import { Features }       from '@acx-ui/feature-toggle'
import { render, screen } from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../../ClusterConfigWizardDataProvider'

import { PortGeneralTable } from './PortGeneralTable'

jest.mock('@acx-ui/rc/components', () => ({
}))

const mockUseIsEdgeFeatureReady = jest.fn().mockImplementation(() => false)
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: (ff: string) => mockUseIsEdgeFeatureReady(ff)
}))

describe('InterfaceSettings - Summary > port general table', () => {
  it('should render correctly', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <PortGeneralTable
          data={mockClusterConfigWizardData.portSettings}
        />
      </ClusterConfigWizardContext.Provider>
    )

    const node1PortsRow = await screen.findAllByRole('row', { name: /Smart Edge 1/ })
    expect(node1PortsRow.length).toBe(2)
    expect(screen.getByRole('row', { name: 'Smart Edge 1 Port1 Disabled WAN Static IP 1.1.1.1' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(screen.getByRole('row', { name: 'Smart Edge 1 Port2 Enabled LAN Static IP 2.2.2.3' })).toBeVisible()
    const node2PortsRow = await screen.findAllByRole('row', { name: /Smart Edge 2/ })
    expect(node2PortsRow.length).toBe(2)
    expect(screen.getByRole('row', { name: 'Smart Edge 2 Port1 Disabled WAN DHCP' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(screen.getByRole('row', { name: 'Smart Edge 2 Port2 Enabled LAN Static IP 2.2.2.2' })).toBeVisible()
  })

  describe('Core Access', () => {
    beforeEach(() => {
      // eslint-disable-next-line max-len
      mockUseIsEdgeFeatureReady.mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    })

    afterEach(() => {
      mockUseIsEdgeFeatureReady.mockImplementation(() => false)
    })

    it('should show core port and access port column when FF is on', async () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <PortGeneralTable
            data={mockClusterConfigWizardData.portSettings}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByRole('columnheader', { name: 'Core Port' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Access Port' })).toBeVisible()
    })
  })
})
