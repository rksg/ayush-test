
import { NetworkTopologyType } from './NetworkTopologyForm'

import { getStepsByTopologyType } from '.'

describe('PersonalIdentityNetworkForm', () => {

  it('Test getStepsByTopologyType', () => {
    const wirelessSteps = getStepsByTopologyType(NetworkTopologyType.Wireless)
    expect(wirelessSteps.length).toBe(5)
    expect(wirelessSteps[0].title.defaultMessage[0].value).toBe('General Settings')
    expect(wirelessSteps[1].title.defaultMessage[0].value).toBe('Network Topology')
    expect(wirelessSteps[2].title.defaultMessage[0].value).toBe('RUCKUS Edge')
    expect(wirelessSteps[3].title.defaultMessage[0].value).toBe('Wireless Network')
    expect(wirelessSteps[4].title.defaultMessage[0].value).toBe('Summary')
    const twoTierSteps = getStepsByTopologyType(NetworkTopologyType.TwoTier)
    expect(twoTierSteps.length).toBe(6)
    expect(twoTierSteps[0].title.defaultMessage[0].value).toBe('General Settings')
    expect(twoTierSteps[1].title.defaultMessage[0].value).toBe('Network Topology')
    expect(twoTierSteps[2].title.defaultMessage[0].value).toBe('RUCKUS Edge')
    expect(twoTierSteps[3].title.defaultMessage[0].value).toBe('Dist. Switch')
    expect(twoTierSteps[4].title.defaultMessage[0].value).toBe('Access Switch')
    expect(twoTierSteps[5].title.defaultMessage[0].value).toBe('Summary')
    const threeTierSteps = getStepsByTopologyType(NetworkTopologyType.ThreeTier)
    expect(threeTierSteps.length).toBe(7)
    expect(threeTierSteps[0].title.defaultMessage[0].value).toBe('General Settings')
    expect(threeTierSteps[1].title.defaultMessage[0].value).toBe('Network Topology')
    expect(threeTierSteps[2].title.defaultMessage[0].value).toBe('RUCKUS Edge')
    expect(threeTierSteps[3].title.defaultMessage[0].value).toBe('Dist. Switch')
    expect(threeTierSteps[4].title.defaultMessage[0].value).toBe('Access Switch')
    expect(threeTierSteps[5].title.defaultMessage[0].value).toBe('Wireless Network')
    expect(threeTierSteps[6].title.defaultMessage[0].value).toBe('Summary')
  })
})