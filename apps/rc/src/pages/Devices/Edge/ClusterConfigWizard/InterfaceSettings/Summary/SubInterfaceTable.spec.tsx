/* eslint-disable max-len */
import { Features }              from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { render, screen }        from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingsFormType }                   from '../types'

import { SubInterfaceTable } from './SubInterfaceTable'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('InterfaceSettings - Summary > sub-interface table', () => {
  it('should render correctly', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <SubInterfaceTable
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
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    })

    afterEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })

    it('should show core port and access port column when FF is on', async () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
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