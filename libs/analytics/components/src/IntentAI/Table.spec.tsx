/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Tooltip }                           from '@acx-ui/components'
import { get }                               from '@acx-ui/config'
import { TenantLink }                        from '@acx-ui/react-router-dom'
import { render, screen }                    from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'
import { type NodeType }                     from '@acx-ui/utils'

import { aiFeatureWithAIOps, aiFeatureWithEquiFlex, aiFeatureWithEquiFlexWithNewStatus, aiFeatureWithEcoFlex, aiFeatureWithRRM, mockAIDrivenRow } from './__tests__/fixtures'
import { Icon }                                                                                                                                   from './common/IntentIcon'
import { AiFeatures }                                                                                                                             from './config'
import { DisplayStates, Statuses, StatusReasons }                                                                                                 from './states'
import * as UI                                                                                                                                    from './styledComponents'
import { AIFeature, iconTooltips }                                                                                                                from './Table'
import { Actions, isVisibleByAction }                                                                                                             from './utils'

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
          title={iconTooltips[AiFeatures.RRM]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.RRM} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithRRM.root}/${aiFeatureWithRRM.sliceId}/${aiFeatureWithRRM.code}`}>
          <span>{aiFeatureWithRRM.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithEquiFlex)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.EquiFlex]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.EquiFlex} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithEquiFlex.root}/${aiFeatureWithEquiFlex.sliceId}/${aiFeatureWithEquiFlex.code}`}>
          <span>{aiFeatureWithEquiFlex.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAIOps)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.AIOps]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.AIOps} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAIOps.root}/${aiFeatureWithAIOps.sliceId}/${aiFeatureWithAIOps.code}`}>
          <span>{aiFeatureWithAIOps.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithEcoFlex)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.EcoFlex]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.EcoFlex} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithEcoFlex.root}/${aiFeatureWithEcoFlex.sliceId}/${aiFeatureWithEcoFlex.code}`}>
          <span>{aiFeatureWithEcoFlex.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )
  })

  it('should render AIFeature for R1', async () => {
    expect(AIFeature(aiFeatureWithRRM)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.RRM]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.RRM} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithRRM.sliceId}/${aiFeatureWithRRM.code}`}>
          <span>{aiFeatureWithRRM.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithEquiFlex)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.EquiFlex]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.EquiFlex} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithEquiFlex.sliceId}/${aiFeatureWithEquiFlex.code}`}>
          <span>{aiFeatureWithEquiFlex.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithAIOps)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.AIOps]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.AIOps} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithAIOps.sliceId}/${aiFeatureWithAIOps.code}`}>
          <span>{aiFeatureWithAIOps.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )

    expect(AIFeature(aiFeatureWithEcoFlex)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.EcoFlex]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.EcoFlex} />
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithEcoFlex.sliceId}/${aiFeatureWithEcoFlex.code}`}>
          <span>{aiFeatureWithEcoFlex.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )
  })

  it('should not render link for AIFeature when status is new', async () => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ WRITE_INTENT_AI: true } as RaiPermissions)
    expect(AIFeature(aiFeatureWithEquiFlexWithNewStatus)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.EquiFlex]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.EquiFlex} />
        </Tooltip>
        <span>{aiFeatureWithEquiFlex.aiFeature}</span>
      </UI.FeatureIcon>
    )
  })

  it('should render link for AIFeature when status is new & READ_ONLY user', async () => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ WRITE_INTENT_AI: false } as RaiPermissions)
    const root = aiFeatureWithEquiFlexWithNewStatus.root
    const sliceId = aiFeatureWithEquiFlexWithNewStatus.sliceId
    const code = aiFeatureWithEquiFlexWithNewStatus.code
    expect(AIFeature(aiFeatureWithEquiFlexWithNewStatus)).toEqual(
      <UI.FeatureIcon>
        <Tooltip
          placement='right'
          title={iconTooltips[AiFeatures.EquiFlex]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <Icon feature={AiFeatures.EquiFlex} />
        </Tooltip>
        <TenantLink
          to={`/analytics/intentAI/${root}/${sliceId}/${code}`}>
          <span>{aiFeatureWithEquiFlexWithNewStatus.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )
  })

  describe('isVisibleByAction', () => {
    const extractItem = {
      aiFeature: AiFeatures.RRM,
      root: 'root',
      sliceId: 'sliceId',
      sliceType: 'network' as NodeType,
      intent: 'Client Density vs. Throughput for 5 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: Statuses.new,
      statusLabel: 'New',
      statusTooltip: 'IntentAI is active and has successfully applied the changes to the zone-1.',
      statusTrail: [],
      metadata: {
        appliedAt: '',
        scheduledAt: '',
        dataEndTime: '2024-04-19T07:30:00.000Z'
      }
    }
    const makeRow = (status: Statuses, displayStatus: DisplayStates) => ({
      ...mockAIDrivenRow, ...extractItem, displayStatus, status, statusReason: StatusReasons.byDefault
    })
    const newRow = makeRow(Statuses.new, DisplayStates.new)
    const activeRow = makeRow(Statuses.active, DisplayStates.active)
    const activeRowAfterApply = {
      ...makeRow(Statuses.active, DisplayStates.active),
      metadata: { ...extractItem.metadata, appliedAt: '2024-04-19T07:30:00.000Z' }
    }
    const pausedApplyFailedRow = makeRow(Statuses.paused, DisplayStates.pausedApplyFailed)
    const scheduledOneClickRow = makeRow(Statuses.scheduled, DisplayStates.scheduledOneClick)
    const revertScheduledRow = {
      ...makeRow(Statuses.revertScheduled, DisplayStates.revertScheduled),
      metadata: { ...extractItem.metadata, appliedAt: '2024-04-19T07:30:00.000Z' }
    }
    it('should return true for all actions', () => {
      expect(isVisibleByAction([newRow, newRow], Actions.One_Click_Optimize)).toBeTruthy()
      expect(isVisibleByAction([newRow, activeRow], Actions.One_Click_Optimize)).toBeFalsy()
      expect(isVisibleByAction([scheduledOneClickRow], Actions.Optimize)).toBeTruthy()
      expect(isVisibleByAction([newRow, revertScheduledRow], Actions.Optimize)).toBeFalsy()
      expect(isVisibleByAction([activeRow, revertScheduledRow], Actions.Revert)).toBeFalsy()
      expect(isVisibleByAction([activeRowAfterApply, revertScheduledRow], Actions.Revert)).toBeTruthy()
      expect(isVisibleByAction([newRow, revertScheduledRow], Actions.Revert)).toBeFalsy()
      expect(isVisibleByAction([scheduledOneClickRow, activeRow], Actions.Pause)).toBeTruthy()
      expect(isVisibleByAction([newRow, pausedApplyFailedRow], Actions.Pause)).toBeFalsy()
      expect(isVisibleByAction([scheduledOneClickRow, revertScheduledRow], Actions.Cancel)).toBeTruthy()
      expect(isVisibleByAction([newRow, revertScheduledRow], Actions.Cancel)).toBeFalsy()
    })
  })

  it('should trigger click tooltip for R1', async () => {
    render(iconTooltips[AiFeatures.RRM])
    await userEvent.click(await screen.findByTestId('featureTooltip'))
  })
})
