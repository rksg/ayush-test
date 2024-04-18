import { render, screen } from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../../ClusterConfigWizardDataProvider'

import { VipCard } from './VipCard'


describe('InterfaceSettings - Summary > LagTable', () => {
  it('should render correctly', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <VipCard
          index={1}
          data={mockClusterConfigWizardData.vipConfig[0]}
        />
      </ClusterConfigWizardContext.Provider>
    )

    expect(screen.getByText('#1 Virtual IP')).toBeVisible()
    expect(screen.getByText('Smart Edge 1 - Port2')).toBeVisible()
    expect(screen.getByText('Smart Edge 2 - Port2')).toBeVisible()
  })
})