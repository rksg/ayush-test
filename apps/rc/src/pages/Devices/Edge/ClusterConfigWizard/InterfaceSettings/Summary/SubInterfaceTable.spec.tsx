/* eslint-disable max-len */

import { Features }       from '@acx-ui/feature-toggle'
import { render, screen } from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingsFormType }                   from '../types'

import { SubInterfaceTable } from './SubInterfaceTable'

jest.mock('@acx-ui/rc/components', () => ({
}))

const mockUseIsEdgeFeatureReady = jest.fn().mockImplementation(() => false)
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: (ff: string) => mockUseIsEdgeFeatureReady(ff)
}))

describe('InterfaceSettings - Summary > sub-interface table', () => {
  it('should render correctly', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <SubInterfaceTable
          lagData={mockClusterConfigWizardData.lagSettings}
          portData={mockClusterConfigWizardData.portSettings}
          portSubInterfaceData={mockClusterConfigWizardData.portSubInterfaces as InterfaceSettingsFormType['portSubInterfaces']}
          lagSubInterfaceData={mockClusterConfigWizardData.lagSubInterfaces as unknown as InterfaceSettingsFormType['portSubInterfaces']}
        />
      </ClusterConfigWizardContext.Provider>
    )

    expect(screen.getByRole('row', { name: 'Smart Edge 1 Port1 LAN STATIC 1.1.5.1 255.255.255.0 123' })).toBeVisible()
    expect(screen.getByRole('row', { name: 'Smart Edge 2 Port2 LAN STATIC 1.1.2.1 255.255.255.0 1' })).toBeVisible()
    expect(screen.getByRole('row', { name: 'Smart Edge 1 Lag0 LAN STATIC 1.1.3.1 255.255.255.0 1' })).toBeVisible()
    expect(screen.getByRole('row', { name: 'Smart Edge 2 Lag1 LAN DHCP 3' })).toBeVisible()
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
          <SubInterfaceTable
            lagData={mockClusterConfigWizardData.lagSettings}
            portData={mockClusterConfigWizardData.portSettings}
            portSubInterfaceData={mockClusterConfigWizardData.portSubInterfaces as InterfaceSettingsFormType['portSubInterfaces']}
            lagSubInterfaceData={mockClusterConfigWizardData.lagSubInterfaces as unknown as InterfaceSettingsFormType['portSubInterfaces']}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByRole('columnheader', { name: 'Core Port' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Access Port' })).toBeVisible()
    })
  })
})
