import {
  getUnionValuesByKey
} from './editPortDrawer.flexAuth.utils'

describe('getUnionValuesByKey', () => {
  const aggregateData = {
    authDefaultVlan: { 'c0:c5:20:aa:35:d9': [3,10] },
    authDefaultVlan2: { 'c0:c5:20:aa:35:d9': { '1/1/3': [3], '1/1/4': [10] } },
    authenticationProfileId: {},
    criticalVlan: {},
    defaultVlan: { 'c0:c5:20:aa:35:d9': 1, 'c0:c5:20:aa:32:55': 1 },
    enableAuthPorts: { 'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4'], 'c0:c5:20:aa:32:55': [] },
    guestVlan: {},
    hasMultipleValue: [],
    profileAuthDefaultVlan: {},
    restrictedVlan: { 'c0:c5:20:aa:35:d9': 9 },
    selectedPortIdentifier: {
      'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4'], 'c0:c5:20:aa:32:55': ['1/1/5']
    },
    switchLevelAuthDefaultVlan: { 'c0:c5:20:aa:35:d9': 3, 'c0:c5:20:aa:32:55': 12 },
    taggedVlans: { 'c0:c5:20:aa:35:d9': ['3', '10'], 'c0:c5:20:aa:32:55': ['3'] },
    untaggedVlan: {}
  }
  it('should get union values correctly', async () => {
    await expect(getUnionValuesByKey('authDefaultVlan', aggregateData)).toStrictEqual([3, 10])
    // await expect(getUnionValuesByKey('authDefaultVlan2', aggregateData)).toStrictEqual([3, 10])
    await expect(getUnionValuesByKey('defaultVlan', aggregateData)).toStrictEqual([1])
    await expect(getUnionValuesByKey('restrictedVlan', aggregateData)).toStrictEqual([9])
    await expect(getUnionValuesByKey(
      'switchLevelAuthDefaultVlan', aggregateData)).toStrictEqual([3, 12]
    )
    await expect(getUnionValuesByKey('taggedVlans', aggregateData)).toStrictEqual(['3', '10'])
    await expect(getUnionValuesByKey('untaggedVlan', aggregateData)).toStrictEqual([])
  })
})