import { screen, render } from '@acx-ui/test-utils'

import { EolABFUpgradeWarning } from './AdvancedUpdateNowDialog'

describe('EolABFUpgradeWarning Component', () => {
  it('renders null when no AP models are present', async () => {
    const { container } = render(
      <EolABFUpgradeWarning abfName='ABF2-3R' apModels={[]} upgradableApModelsAndFamilies={{}} />
    )
    expect(container.firstChild).toBeNull()
  })

  // eslint-disable-next-line max-len
  it('renders null when AP models are present but have been promoted to the upper ABF', async () => {
    const apModelsWithLegacy = ['R350', 'R760']

    const { container } = render(
      <EolABFUpgradeWarning
        abfName='ABF2-3R'
        apModels={apModelsWithLegacy}
        upgradableApModelsAndFamilies={{
          active: { apModels: apModelsWithLegacy, familyNames: ['WiFi 6'] }
        }}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders warning messages when AP models are present', async () => {
    const apModelsWithLegacy = ['R350', 'R760']

    const { rerender } = render(
      <EolABFUpgradeWarning
        abfName='ABF2-3R'
        apModels={apModelsWithLegacy}
        upgradableApModelsAndFamilies={{}}
      />
    )

    // eslint-disable-next-line max-len
    expect(screen.getByText('There are one or more legacy devices in selected venues (R350, R760).')).toBeInTheDocument()

    rerender(
      <EolABFUpgradeWarning
        abfName='ABF2-3R'
        apModels={apModelsWithLegacy}
        upgradableApModelsAndFamilies={{
          active: { apModels: ['R350'], familyNames: ['WiFi 6'] }
        }}
      />
    )

    // eslint-disable-next-line max-len
    expect(screen.getByText('There are one or more legacy devices in selected venues (R760).')).toBeInTheDocument()
  })
})
