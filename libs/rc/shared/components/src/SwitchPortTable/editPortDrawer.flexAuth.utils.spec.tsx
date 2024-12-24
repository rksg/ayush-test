/* eslint-disable max-len */
import { Form } from 'antd'

import {
  PortSettingModel,
  SwitchDefaultVlan,
  SwitchPortViewModel
} from '@acx-ui/rc/utils'
import { renderHook } from '@acx-ui/test-utils'

import {
  aggregatePortSettings,
  checkAllSelectedPortsMatch,
  getCurrentVlansByKey,
  getUnionValuesByKey
} from './editPortDrawer.flexAuth.utils'


describe('aggregatePortSettings', () => {
  const portsSetting = [{
    port: '1/1/2',
    authDefaultVlan: 5,
    shouldAlertAaaAndRadiusNotApply: false,
    switchLevelAuthDefaultVlan: 12,
    switchMac: 'c0:c5:20:aa:32:55',
    taggedVlans: ['100', '300'],
    untaggedVlan: '200'
  }, {
    port: '1/1/3',
    authDefaultVlan: 5,
    shouldAlertAaaAndRadiusNotApply: false,
    switchLevelAuthDefaultVlan: 12,
    switchMac: 'c0:c5:20:aa:32:55',
    untaggedVlan: '1'
  }, {
    port: '1/1/1',
    authDefaultVlan: 5,
    shouldAlertAaaAndRadiusNotApply: false,
    switchLevelAuthDefaultVlan: 5,
    switchMac: 'c0:c5:20:aa:35:d9',
    taggedVlans: ['102'],
    untaggedVlan: '101'
  }] as PortSettingModel[]

  const defaultVlans = [{
    defaultVlanId: 1,
    switchId: 'c0:c5:20:aa:35:d9'
  }, {
    defaultVlanId: 1,
    switchId: 'c0:c5:20:aa:32:55'
  }, {
    defaultVlanId: 1,
    switchId: 'c0:c5:20:aa:35:d9'
  }] as SwitchDefaultVlan[]

  it('should aggregate data correctly', async () => {
    expect(aggregatePortSettings(portsSetting.slice(0, 3), defaultVlans.slice(0, 3))).toStrictEqual({
      authDefaultVlan: { 'c0:c5:20:aa:32:55': [5, 5], 'c0:c5:20:aa:35:d9': [5] },
      authenticationProfileId: {}, criticalVlan: {},
      defaultVlan: { 'c0:c5:20:aa:32:55': 1, 'c0:c5:20:aa:35:d9': 1 },
      dot1xPortControl: {},
      enableAuthPorts: { 'c0:c5:20:aa:32:55': [], 'c0:c5:20:aa:35:d9': [] },
      guestVlan: {}, hasMultipleValue: [],
      ipsg: { 'c0:c5:20:aa:32:55': [false], 'c0:c5:20:aa:35:d9': [false] },
      profileAuthDefaultVlan: {}, restrictedVlan: {},
      selectedPortIdentifier: {
        'c0:c5:20:aa:32:55': ['1/1/2', '1/1/3'], 'c0:c5:20:aa:35:d9': ['1/1/1']
      },
      shouldAlertAaaAndRadiusNotApply: false,
      switchLevelAuthDefaultVlan: { 'c0:c5:20:aa:32:55': 12, 'c0:c5:20:aa:35:d9': 5 },
      taggedVlans: { 'c0:c5:20:aa:32:55': ['100', '300'], 'c0:c5:20:aa:35:d9': ['102'] },
      untaggedVlan: { 'c0:c5:20:aa:32:55': ['200', '1'], 'c0:c5:20:aa:35:d9': ['101'] }
    })
    expect(aggregatePortSettings(portsSetting.slice(0, 2), defaultVlans.slice(1, 2))).toStrictEqual({
      authDefaultVlan: { 'c0:c5:20:aa:32:55': [5, 5] },
      authenticationProfileId: {}, criticalVlan: {},
      defaultVlan: { 'c0:c5:20:aa:32:55': 1 },
      dot1xPortControl: {},
      enableAuthPorts: { 'c0:c5:20:aa:32:55': [] },
      guestVlan: {}, hasMultipleValue: [],
      ipsg: { 'c0:c5:20:aa:32:55': [false] },
      profileAuthDefaultVlan: {}, restrictedVlan: {},
      selectedPortIdentifier: { 'c0:c5:20:aa:32:55': ['1/1/2', '1/1/3'] },
      shouldAlertAaaAndRadiusNotApply: false,
      switchLevelAuthDefaultVlan: { 'c0:c5:20:aa:32:55': 12 },
      taggedVlans: { 'c0:c5:20:aa:32:55': ['100', '300'] },
      untaggedVlan: { 'c0:c5:20:aa:32:55': ['200', '1'] }
    })
    expect(aggregatePortSettings(portsSetting.slice(1, 2), defaultVlans.slice(1, 2))).toStrictEqual({
      authDefaultVlan: { 'c0:c5:20:aa:32:55': [5] },
      authenticationProfileId: {}, criticalVlan: {},
      defaultVlan: { 'c0:c5:20:aa:32:55': 1 },
      dot1xPortControl: {},
      enableAuthPorts: { 'c0:c5:20:aa:32:55': [] },
      guestVlan: {}, hasMultipleValue: [],
      ipsg: { 'c0:c5:20:aa:32:55': [false] },
      profileAuthDefaultVlan: {}, restrictedVlan: {},
      selectedPortIdentifier: { 'c0:c5:20:aa:32:55': ['1/1/3'] },
      shouldAlertAaaAndRadiusNotApply: false,
      switchLevelAuthDefaultVlan: { 'c0:c5:20:aa:32:55': 12 },
      taggedVlans: { 'c0:c5:20:aa:32:55': [] },
      untaggedVlan: { 'c0:c5:20:aa:32:55': ['1'] }
    })
  })
})

describe('checkAllSelectedPortsMatch', () => {
  const selectedPorts = [{
    switchMac: 'c0:c5:20:aa:35:d9'
  }, {
    switchMac: 'c0:c5:20:aa:32:55'
  }] as SwitchPortViewModel[]
  const aggregateData = {
    authDefaultVlan: { 'c0:c5:20:aa:35:d9': [3,10] },
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
    untaggedVlan: { 'c0:c5:20:aa:35:d9': ['2'], 'c0:c5:20:aa:32:55': ['1'] },
    shouldAlertAaaAndRadiusNotApply: false
  }

  it('should check correctly', async () => {
    expect(checkAllSelectedPortsMatch(selectedPorts, aggregateData)).toBe(true)
    expect(checkAllSelectedPortsMatch(selectedPorts.slice(0,1), aggregateData)).toBe(true)
    expect(checkAllSelectedPortsMatch(selectedPorts.slice(1,2), aggregateData)).toBe(true)
    expect(checkAllSelectedPortsMatch(selectedPorts, {
      ...aggregateData,
      enableAuthPorts: { 'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4'], 'c0:c5:20:aa:32:55': ['1/1/5'] }
    })).toBe(true)
    expect(checkAllSelectedPortsMatch(selectedPorts, {
      ...aggregateData,
      enableAuthPorts: {}
    })).toBe(true)
    expect(checkAllSelectedPortsMatch(selectedPorts, {
      ...aggregateData,
      enableAuthPorts: { 'c0:c5:20:aa:35:d9': [], 'c0:c5:20:aa:32:55': [] }
    })).toBe(true)
    expect(checkAllSelectedPortsMatch(selectedPorts.slice(0,1), {
      ...aggregateData,
      selectedPortIdentifier: { 'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4'] },
      enableAuthPorts: { 'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4'] }
    })).toBe(true)

    expect(checkAllSelectedPortsMatch(selectedPorts, {
      ...aggregateData,
      enableAuthPorts: { 'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4', '1/1/5'], 'c0:c5:20:aa:32:55': [] }
    })).toBe(false)
    expect(checkAllSelectedPortsMatch(selectedPorts, {
      ...aggregateData,
      enableAuthPorts: { 'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4'], 'c0:c5:20:aa:32:55': ['1/1/3'] }
    })).toBe(false)
    expect(checkAllSelectedPortsMatch(selectedPorts, {
      ...aggregateData,
      selectedPortIdentifier: { 'c0:c5:20:aa:35:d9': ['1/1/3'], 'c0:c5:20:aa:32:55': ['1/1/3'] },
      enableAuthPorts: { 'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4'], 'c0:c5:20:aa:32:55': ['1/1/3'] }
    })).toBe(false)
    expect(checkAllSelectedPortsMatch(selectedPorts.slice(0,1), {
      ...aggregateData,
      selectedPortIdentifier: { 'c0:c5:20:aa:35:d9': ['1/1/3'] },
      enableAuthPorts: { 'c0:c5:20:aa:35:d9': ['1/1/3', '1/1/4'] }
    })).toBe(false)
  })
})

describe('getCurrentVlansByKey', () => {
  const aggregateData = {
    authDefaultVlan: { 'c0:c5:20:aa:35:d9': [3,10] },
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
    untaggedVlan: { 'c0:c5:20:aa:35:d9': ['2'], 'c0:c5:20:aa:32:55': ['1'] },
    shouldAlertAaaAndRadiusNotApply: false
  }
  const { result: formRef } = renderHook(() => {
    const [ form ] = Form.useForm()
    return form
  })

  it('should get value correctly when editing a single port', async () => {
    formRef.current.setFieldValue('untaggedVlan', '2')
    expect(getCurrentVlansByKey({
      key: 'untaggedVlan', switchId: 'c0:c5:20:aa:35:d9', aggregateData,
      isMultipleEdit: false, portVlansCheckbox: false, hasMultipleValue: [], form: formRef.current
    })).toStrictEqual([2])
  })

  it('should get value correctly when editing multiple ports', async () => {
    formRef.current.setFieldValue('untaggedVlan', '')
    formRef.current.setFieldValue('taggedVlans', [7])
    expect(getCurrentVlansByKey({
      key: 'untaggedVlan', switchId: 'c0:c5:20:aa:35:d9', aggregateData,
      isMultipleEdit: true, portVlansCheckbox: false, hasMultipleValue: ['untaggedVlan', 'taggedVlans'], form: formRef.current
    })).toStrictEqual([2])
    expect(getCurrentVlansByKey({
      key: 'taggedVlans', switchId: 'c0:c5:20:aa:35:d9', aggregateData,
      isMultipleEdit: true, portVlansCheckbox: false, hasMultipleValue: ['untaggedVlan', 'taggedVlans'], form: formRef.current
    })).toStrictEqual([3, 10])
    expect(getCurrentVlansByKey({
      key: 'untaggedVlan', aggregateData,
      isMultipleEdit: true, portVlansCheckbox: false, hasMultipleValue: ['untaggedVlan', 'taggedVlans'], form: formRef.current
    })).toStrictEqual([2, 1])
    expect(getCurrentVlansByKey({
      key: 'taggedVlans', aggregateData,
      isMultipleEdit: true, portVlansCheckbox: false, hasMultipleValue: ['untaggedVlan', 'taggedVlans'], form: formRef.current
    })).toStrictEqual([3, 10])
  })

  it('should get value correctly when overriding the port VLAN', async () => {
    // after overriding untagged vlan, "untaggedVlan" would be removed from hasMultipleValue
    formRef.current.setFieldsValue({
      untaggedVlan: '3',
      untaggedVlanCheckbox: true,
      portVlansCheckbox: true
    })

    expect(getCurrentVlansByKey({
      key: 'untaggedVlan', switchId: 'c0:c5:20:aa:35:d9', aggregateData,
      isMultipleEdit: true, portVlansCheckbox: true, hasMultipleValue: ['taggedVlans'], form: formRef.current
    })).toStrictEqual([3])
  })

})

describe('getUnionValuesByKey', () => {
  const aggregateData = {
    authDefaultVlan: { 'c0:c5:20:aa:35:d9': [3,10] },
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
    untaggedVlan: {},
    shouldAlertAaaAndRadiusNotApply: false
  }
  it('should get union values correctly', async () => {
    expect(getUnionValuesByKey('authDefaultVlan', aggregateData)).toStrictEqual([3, 10])
    expect(getUnionValuesByKey('defaultVlan', aggregateData)).toStrictEqual([1])
    expect(getUnionValuesByKey('restrictedVlan', aggregateData)).toStrictEqual([9])
    expect(getUnionValuesByKey(
      'switchLevelAuthDefaultVlan', aggregateData)).toStrictEqual([3, 12]
    )
    expect(getUnionValuesByKey('taggedVlans', aggregateData)).toStrictEqual(['3', '10'])
    expect(getUnionValuesByKey('untaggedVlan', aggregateData)).toStrictEqual([])
  })
})
