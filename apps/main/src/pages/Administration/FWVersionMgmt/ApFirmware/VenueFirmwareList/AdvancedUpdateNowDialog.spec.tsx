import { screen, render } from '@acx-ui/test-utils'

import { ABFUpgradeWarning } from './AdvancedUpdateNowDialog'

describe('EolABFUpgradeWarning Component', () => {
  it('renders null when no AP models are present', async () => {
    const { container } = render(
      <ABFUpgradeWarning
        abfName='ABF2-3R'
        apModels={[]}
        upgradableApModelsAndFamilies={{}}
        isLegacyABF={true} />
    )
    expect(container.firstChild).toBeNull()
  })

  // eslint-disable-next-line max-len
  it('renders null when AP models are present but have been promoted to the upper ABF', async () => {
    const apModelsWithLegacy = ['R350', 'R760']

    const { container } = render(
      <ABFUpgradeWarning
        abfName='ABF2-3R'
        apModels={apModelsWithLegacy}
        upgradableApModelsAndFamilies={{
          'active': { apModels: apModelsWithLegacy, familyNames: ['Wi-Fi 6'], sequence: 3 },
          'ABF2-3R': { apModels: apModelsWithLegacy, familyNames: ['Wi-Fi 6'], sequence: 2 }
        }}
        isLegacyABF={true}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders warning messages when AP models are present', async () => {
    const apModelsWithLegacy = ['R350', 'R760']

    const { rerender } = render(
      <ABFUpgradeWarning
        abfName='ABF2-3R'
        apModels={apModelsWithLegacy}
        upgradableApModelsAndFamilies={{}}
        isLegacyABF={true}
      />
    )

    // eslint-disable-next-line max-len
    expect(screen.getByText('There are one or more legacy devices in selected venues (R350, R760).')).toBeInTheDocument()

    rerender(
      <ABFUpgradeWarning
        abfName='ABF2-3R'
        apModels={apModelsWithLegacy}
        upgradableApModelsAndFamilies={{
          'active': { apModels: ['R350'], familyNames: ['Wi-Fi 6'], sequence: 3 },
          'ABF2-3R': { apModels: apModelsWithLegacy, familyNames: ['Wi-Fi 6'], sequence: 2 }
        }}
        isLegacyABF={true}
      />
    )

    // eslint-disable-next-line max-len
    expect(screen.getByText('There are one or more legacy devices in selected venues (R760).')).toBeInTheDocument()
  })

  it('renders warning messages for active ABF when AP models are present', async () => {
    render(
      <ABFUpgradeWarning
        abfName='active'
        apModels={['R770']}
        upgradableApModelsAndFamilies={{
          // eslint-disable-next-line max-len
          'active': { apModels: ['R770', 'R760'], familyNames: ['Wi-Fi 7', 'Wi-Fi 6'], sequence: 3 },
          'ABF2-3R': { apModels: ['R760'], familyNames: ['Wi-Fi 6'], sequence: 2 }
        }}
        isLegacyABF={false}
      />
    )

    // eslint-disable-next-line max-len
    expect(screen.getByText('There are one or more devices in selected venues (R770).')).toBeInTheDocument()
  })
})
