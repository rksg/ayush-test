/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Tooltip }        from '@acx-ui/components'
import { get }            from '@acx-ui/config'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { render, screen } from '@acx-ui/test-utils'

import { aiFeatureWithAIOps, aiFeatureWithAirFlexAI, aiFeatureWithEcoFlexAI, aiFeatureWithRRM } from './__tests__/fixtures'
import { aiFeatures }                                                                           from './config'
import * as UI                                                                                  from './styledComponents'
import { AIFeature, icons, iconTooltips }                                                       from './Table'

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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.RRM]}
          overlayInnerStyle={{ width: '345px' }}
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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AirFlexAI]}
          overlayInnerStyle={{ width: '345px' }}
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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AIOps]}
          overlayInnerStyle={{ width: '345px' }}
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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.EcoFlexAI]}
          overlayInnerStyle={{ width: '345px' }}
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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.RRM]}
          overlayInnerStyle={{ width: '345px' }}
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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AirFlexAI]}
          overlayInnerStyle={{ width: '345px' }}
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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.AIOps]}
          overlayInnerStyle={{ width: '345px' }}
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
        <Tooltip
          placement='right'
          title={iconTooltips[aiFeatures.EcoFlexAI]}
          overlayInnerStyle={{ width: '345px' }}
        >
          {icons[aiFeatures.EcoFlexAI]}
        </Tooltip>
        <TenantLink to={`/analytics/intentAI/${aiFeatureWithEcoFlexAI.sliceId}/${aiFeatureWithEcoFlexAI.code}`}>
          <span>{aiFeatureWithEcoFlexAI.aiFeature}</span>
        </TenantLink>
      </UI.FeatureIcon>
    )
  })

  it('should trigger click tooltip for R1', async () => {
    render(iconTooltips[aiFeatures.RRM])
    await userEvent.click(await screen.findByTestId('featureTooltip'))
  })
})
