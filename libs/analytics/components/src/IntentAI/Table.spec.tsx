/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { Tooltip }    from '@acx-ui/components'
import { get }        from '@acx-ui/config'
import { TenantLink } from '@acx-ui/react-router-dom'

import { aiFeatureWithAIOps, aiFeatureWithAirFlexAI, aiFeatureWithEcoFlexAI, aiFeatureWithRRM, mockAIDrivenRow } from './__tests__/fixtures'
import { aiFeatures }                                                                                            from './config'
import { displayStates, statuses }                                                                               from './states'
import * as UI                                                                                                   from './styledComponents'
import { AIFeature, icons, iconTooltips, isVisibledByAction }                                                    from './Table'
import { Actions }                                                                                               from './utils'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = get as jest.Mock

describe('AIFeature component', () => {

  beforeEach(() => {
    jest.mocked(get).mockReturnValue('') // get('IS_MLISA_SA')
  })

  it('should render AIFeature for RAI', async () => {
    mockGet.mockReturnValue('true')

    expect(AIFeature(aiFeatureWithRRM)).toEqual(
      <UI.FeatureIcon>
        <UI.TooltipContent />
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.RRM]}
        >
          {icons[aiFeatures.RRM]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithRRM.root}/${aiFeatureWithRRM.sliceId}/${aiFeatureWithRRM.code}`}>
          <span>{aiFeatureWithRRM.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAirFlexAI)).toEqual(
      <UI.FeatureIcon>
        <UI.TooltipContent />
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AirFlexAI]}
        >
          {icons[aiFeatures.AirFlexAI]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAirFlexAI.root}/${aiFeatureWithAirFlexAI.sliceId}/${aiFeatureWithAirFlexAI.code}`}>
          <span>{aiFeatureWithAirFlexAI.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAIOps)).toEqual(
      <UI.FeatureIcon>
        <UI.TooltipContent />
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AIOps]}
        >
          {icons[aiFeatures.AIOps]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAIOps.root}/${aiFeatureWithAIOps.sliceId}/${aiFeatureWithAIOps.code}`}>
          <span>{aiFeatureWithAIOps.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithEcoFlexAI)).toEqual(
      <UI.FeatureIcon>
        <UI.TooltipContent />
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.EcoFlexAI]}
        >
          {icons[aiFeatures.EcoFlexAI]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithEcoFlexAI.root}/${aiFeatureWithEcoFlexAI.sliceId}/${aiFeatureWithEcoFlexAI.code}`}>
          <span>{aiFeatureWithEcoFlexAI.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )
  })

  it('should render AIFeature for R1', async () => {
    expect(AIFeature(aiFeatureWithRRM)).toEqual(
      <UI.FeatureIcon>
        <UI.TooltipContent />
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.RRM]}
        >
          {icons[aiFeatures.RRM]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithRRM.sliceId}/${aiFeatureWithRRM.code}`}>
          <span>{aiFeatureWithRRM.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAirFlexAI)).toEqual(
      <UI.FeatureIcon>
        <UI.TooltipContent />
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AirFlexAI]}
        >
          {icons[aiFeatures.AirFlexAI]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAirFlexAI.sliceId}/${aiFeatureWithAirFlexAI.code}`}>
          <span>{aiFeatureWithAirFlexAI.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAIOps)).toEqual(
      <UI.FeatureIcon>
        <UI.TooltipContent />
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AIOps]}
        >
          {icons[aiFeatures.AIOps]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAIOps.sliceId}/${aiFeatureWithAIOps.code}`}>
          <span>{aiFeatureWithAIOps.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithEcoFlexAI)).toEqual(
      <UI.FeatureIcon>
        <UI.TooltipContent />
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.EcoFlexAI]}
        >
          {icons[aiFeatures.EcoFlexAI]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithEcoFlexAI.sliceId}/${aiFeatureWithEcoFlexAI.code}`}>
          <span>{aiFeatureWithEcoFlexAI.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )
  })

  describe('isVisibledByAction', () => {
    const extractItem = {
      aiFeature: aiFeatures.RRM,
      root: 'root',
      sliceId: 'sliceId',
      intent: 'Client Density vs. Throughput for 5 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: statuses.new,
      statusTooltip: 'IntentAI is active and has successfully applied the changes to the zone-1.',
      statusTrail: []
    }
    const newRow = { ...mockAIDrivenRow, ...extractItem, displayStatus: displayStates.new }
    const activeRow = { ...mockAIDrivenRow, ...extractItem, displayStatus: displayStates.active }
    const pausedApplyFailedRow = { ...mockAIDrivenRow, ...extractItem, displayStatus: displayStates.pausedApplyFailed }
    const scheduledOneClickRow = { ...mockAIDrivenRow, ...extractItem, displayStatus: displayStates.scheduledOneClick }
    const revertScheduledRow = { ...mockAIDrivenRow, ...extractItem, displayStatus: displayStates.revertScheduled }
    it('should return true for all actions', () => {
      expect(isVisibledByAction([newRow, newRow], Actions.One_Click_Optimize)).toBeTruthy()
      expect(isVisibledByAction([newRow, activeRow], Actions.One_Click_Optimize)).toBeFalsy()
      expect(isVisibledByAction([scheduledOneClickRow], Actions.Optimize)).toBeTruthy()
      expect(isVisibledByAction([newRow, revertScheduledRow], Actions.Optimize)).toBeFalsy()
      expect(isVisibledByAction([activeRow, revertScheduledRow], Actions.Revert)).toBeTruthy()
      expect(isVisibledByAction([newRow, revertScheduledRow], Actions.Revert)).toBeFalsy()
      expect(isVisibledByAction([scheduledOneClickRow, activeRow], Actions.Stop)).toBeTruthy()
      expect(isVisibledByAction([newRow, pausedApplyFailedRow], Actions.Stop)).toBeFalsy()
      expect(isVisibledByAction([scheduledOneClickRow, revertScheduledRow], Actions.Cancel)).toBeTruthy()
      expect(isVisibledByAction([newRow, revertScheduledRow], Actions.Cancel)).toBeFalsy()
    })

  })

})
