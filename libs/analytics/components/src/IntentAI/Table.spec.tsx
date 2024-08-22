/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Tooltip }        from '@acx-ui/components'
import { get }            from '@acx-ui/config'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { render, screen } from '@acx-ui/test-utils'

import { aiFeatureWithAIOps, aiFeatureWithAirFlexAI, aiFeatureWithEcoFlexAI, aiFeatureWithRRM, mockAIDrivenRow } from './__tests__/fixtures'
import { Icon }                                                                                                  from './common/IntentIcon'
import { aiFeatures }                                                                                            from './config'
import { DisplayStates, Statuses }                                                                               from './states'
import * as UI                                                                                                   from './styledComponents'
import { AIFeature, iconTooltips }                                                                               from './Table'
import { Actions, isVisibledByAction }                                                                           from './utils'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = jest.mocked(get)

describe('AIFeature component', () => {

  beforeEach(() => {
    jest.mocked(get).mockReturnValue('') // get('IS_MLISA_SA')
  })

  it('should render AIFeature for RAI', async () => {
    mockGet.mockReturnValue('true')

    expect(AIFeature(aiFeatureWithRRM)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.RRM]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={aiFeatures.RRM} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithRRM.root}/${aiFeatureWithRRM.sliceId}/${aiFeatureWithRRM.code}`}>
          <span>{aiFeatureWithRRM.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAirFlexAI)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AirFlexAI]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={aiFeatures.AirFlexAI} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAirFlexAI.root}/${aiFeatureWithAirFlexAI.sliceId}/${aiFeatureWithAirFlexAI.code}`}>
          <span>{aiFeatureWithAirFlexAI.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAIOps)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AIOps]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={aiFeatures.AIOps} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAIOps.root}/${aiFeatureWithAIOps.sliceId}/${aiFeatureWithAIOps.code}`}>
          <span>{aiFeatureWithAIOps.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithEcoFlexAI)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.EcoFlexAI]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={aiFeatures.EcoFlexAI} />
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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.RRM]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={aiFeatures.RRM} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithRRM.sliceId}/${aiFeatureWithRRM.code}`}>
          <span>{aiFeatureWithRRM.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAirFlexAI)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AirFlexAI]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={aiFeatures.AirFlexAI} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAirFlexAI.sliceId}/${aiFeatureWithAirFlexAI.code}`}>
          <span>{aiFeatureWithAirFlexAI.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAIOps)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AIOps]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={aiFeatures.AIOps} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAIOps.sliceId}/${aiFeatureWithAIOps.code}`}>
          <span>{aiFeatureWithAIOps.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithEcoFlexAI)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.EcoFlexAI]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={aiFeatures.EcoFlexAI} />
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
      status: Statuses.new,
      statusLabel: 'New',
      statusTooltip: 'IntentAI is active and has successfully applied the changes to the zone-1.',
      statusTrail: []
    }
    const makeRow = (status: Statuses, displayStatus: DisplayStates) => ({
      ...mockAIDrivenRow, ...extractItem, displayStatus, status
    })
    const newRow = makeRow(Statuses.new, DisplayStates.new)
    const activeRow = makeRow(Statuses.active, DisplayStates.active)
    const pausedApplyFailedRow = makeRow(Statuses.paused, DisplayStates.pausedApplyFailed)
    const scheduledOneClickRow = makeRow(Statuses.scheduled, DisplayStates.scheduledOneClick)
    const revertScheduledRow = makeRow(Statuses.revertScheduled, DisplayStates.revertScheduled)
    it('should return true for all actions', () => {
      expect(isVisibledByAction([newRow, newRow], Actions.One_Click_Optimize)).toBeTruthy()
      expect(isVisibledByAction([newRow, activeRow], Actions.One_Click_Optimize)).toBeFalsy()
      expect(isVisibledByAction([scheduledOneClickRow], Actions.Optimize)).toBeTruthy()
      expect(isVisibledByAction([newRow, revertScheduledRow], Actions.Optimize)).toBeFalsy()
      expect(isVisibledByAction([activeRow, revertScheduledRow], Actions.Revert)).toBeTruthy()
      expect(isVisibledByAction([newRow, revertScheduledRow], Actions.Revert)).toBeFalsy()
      expect(isVisibledByAction([scheduledOneClickRow, activeRow], Actions.Pause)).toBeTruthy()
      expect(isVisibledByAction([newRow, pausedApplyFailedRow], Actions.Pause)).toBeFalsy()
      expect(isVisibledByAction([scheduledOneClickRow, revertScheduledRow], Actions.Cancel)).toBeTruthy()
      expect(isVisibledByAction([newRow, revertScheduledRow], Actions.Cancel)).toBeFalsy()
    })

  })

  it('should trigger click tooltip for R1', async () => {
    render(iconTooltips[aiFeatures.RRM])
    await userEvent.click(await screen.findByTestId('featureTooltip'))
  })
})
