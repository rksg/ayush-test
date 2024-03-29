import { render, screen } from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../../ClusterConfigWizardDataProvider'

import { LagTable } from './LagTable'

describe('InterfaceSettings - Summary > LagTable', () => {
  it('should render correctly', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <LagTable
          data={mockClusterConfigWizardData.lagSettings}
          portSettings={mockClusterConfigWizardData.portSettings}
        />
      </ClusterConfigWizardContext.Provider>
    )

    expect((await screen.findAllByRole('row', { name: /Smart Edge/i })).length).toBe(2)
  })
})