/* eslint-disable max-len */
import { render, screen } from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingsFormType }                   from '../types'

import { SubInterfaceTable } from './SubInterfaceTable'

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
})