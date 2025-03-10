import { NetworkVenue, VlanPool } from '../../models'

import {
  getVlanString,
  aggregateApGroupPayload
} from './apGroupDialog.utils'

const data = {
  venueId: '4c778ed630394b76b17bce7fe230cf9f',
  tripleBandEnabled: false,
  networkId: '1ab720533d624ee4b5745b67d84fa422',
  allApGroupsRadio: 'Both',
  allApGroupsRadioTypes: [ '2.4-GHz', '5-GHz'],
  scheduler: { type: 'ALWAYS_ON' },
  isAllApGroups: true,
  id: '9367fd6cb2f94a2dbba7ba839b13c0a5'
}

const info = {
  selectionType: 1,
  apgroups: [{
    apGroupId: '9150b159b5f748a1bbf55dab35a60bce',
    radio: 'Both',
    radioTypes: [ '2.4-GHz', '5-GHz'],
    isDefault: true,
    validationErrorReachedMaxConnectedNetworksLimit: false,
    validationErrorSsidAlreadyActivated: false,
    validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
    validationError: false,
    id: '1df50503ee9141f592fa37b2b6cdb2e8',
    selected: true,
    vlanType: 'vlanId',
    vlanId: 1
  }, {
    apGroupId: '99227979648c421c93c15c586e6ed80b',
    radio: '2.4-GHz',
    radioTypes: [ '2.4-GHz'],
    isDefault: false,
    apGroupName: 'ewrw',
    validationErrorReachedMaxConnectedNetworksLimit: false,
    validationErrorSsidAlreadyActivated: false,
    validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
    validationError: false,
    id: 'e10f183395e34ccaa30d025851ea8ccf',
    selected: true,
    vlanType: 'vlanPool',
    vlanId: 1,
    vlanPoolId: '7b5b3b03492d4a0b84ff9d1d11c4770d',
    vlanPoolName: 'test pool'
  }, {
    apGroupId: '8d3c419b34d0497fac46740ebfa6e649',
    radio: 'Both',
    radioTypes: [ '2.4-GHz', '5-GHz'],
    isDefault: false,
    apGroupName: 'www',
    validationErrorReachedMaxConnectedNetworksLimit: false,
    validationErrorSsidAlreadyActivated: false,
    validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
    validationError: false,
    id: '357e2e8373d64d7aa288b2eaec306c8b',
    selected: false,
    vlanType: 'vlanId',
    vlanId: 1
  }]
}


describe('Test apGroupDialog.utils', () => {
  it('getVlanString', async () => {
    const ret1 = getVlanString(null, 2, true)
    expect(ret1.vlanText).toEqual('VLAN-2 (Custom)')

    const ret2 = getVlanString({ name: 'vpool', vlanMembers: [] } as VlanPool)
    expect(ret2.vlanText).toEqual('VLAN Pool: vpool (Default)')
  })
  it('aggregateApGroupPayload', async () => {
    const ret = aggregateApGroupPayload({ forms: {}, values: info }, data as NetworkVenue)
    expect(ret.isAllApGroups).toEqual(false)
    expect(ret.apGroups).toHaveLength(2)
  })
})
