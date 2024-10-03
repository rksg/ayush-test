/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Tooltip }                   from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { TenantLink }                from '@acx-ui/react-router-dom'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { aiFeatureWithAIOps, aiFeatureWithEquiFlex, aiFeatureWithEquiFlexWithNewStatus, aiFeatureWithEcoFlex, aiFeatureWithRRM, mockAIDrivenRow } from './__tests__/fixtures'
import { Icon }                                                                                                                                   from './common/IntentIcon'
import { AiFeatures }                                                                                                                             from './config'
import { DisplayStates, Statuses }                                                                                                                from './states'
import * as UI                                                                                                                                    from './styledComponents'
import { AIFeature, Banner, iconTooltips }                                                                                                        from './Table'
import { Actions, isVisibledByAction }                                                                                                            from './utils'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = jest.mocked(get)

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useRaiHelpPageLink: () => 'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/userguide/GUID-CAAC695C-6740-499D-8C42-AB521CEE65F6.html'
}))

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

  describe('isVisibledByAction', () => {
    const extractItem = {
      aiFeature: AiFeatures.RRM,
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
    render(iconTooltips[AiFeatures.RRM])
    await userEvent.click(await screen.findByTestId('featureTooltip'))
  })
})

describe('Banner Component', () => {
  it('should open the documentation link when the button is clicked', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {return null})

    render(<Banner />, {
      route: {
        path: '/1d4c01e03b9540f29a3ebac62d56c8fb/t/analytics/intentAI',
        wrapRoutes: false
      }
    })

    const button = screen.getByRole('button', { name: /Learn More/i })
    fireEvent.click(button)
    expect(openSpy).toHaveBeenCalledWith(
      'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/userguide/GUID-CAAC695C-6740-499D-8C42-AB521CEE65F6.html',
      '_blank'
    )

    openSpy.mockRestore()
  })
})