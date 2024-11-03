/* eslint-disable max-len */
import { Form } from 'antd'

import {
  PortSettingModel,
  SwitchDefaultVlan
} from '@acx-ui/rc/utils'
import { renderHook } from '@acx-ui/test-utils'

import {
  aggregatePortSettings,
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
      enableAuthPorts: { 'c0:c5:20:aa:32:55': [], 'c0:c5:20:aa:35:d9': [] },
      guestVlan: {}, hasMultipleValue: [], profileAuthDefaultVlan: {}, restrictedVlan: {},
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
      enableAuthPorts: { 'c0:c5:20:aa:32:55': [] },
      guestVlan: {}, hasMultipleValue: [], profileAuthDefaultVlan: {}, restrictedVlan: {},
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
      enableAuthPorts: { 'c0:c5:20:aa:32:55': [] },
      guestVlan: {}, hasMultipleValue: [], profileAuthDefaultVlan: {}, restrictedVlan: {},
      selectedPortIdentifier: { 'c0:c5:20:aa:32:55': ['1/1/3'] },
      shouldAlertAaaAndRadiusNotApply: false,
      switchLevelAuthDefaultVlan: { 'c0:c5:20:aa:32:55': 12 },
      taggedVlans: { 'c0:c5:20:aa:32:55': [] },
      untaggedVlan: { 'c0:c5:20:aa:32:55': ['1'] }
    })
  })
})

describe('getCurrentVlansByKey', () => {
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
    expect(getCurrentVlansByKey({
      key: 'untaggedVlan', switchId: 'c0:c5:20:aa:35:d9', aggregateData,
      isMultipleEdit: true, portVlansCheckbox: false, hasMultipleValue: ['untaggedVlan'], form: formRef.current
    })).toStrictEqual([2])
  })

  it('should get value correctly when overriding the port VLAN', async () => {
    // after overriding untagged vlan, "untaggedVlan" would be remove from hasMultipleValue
    formRef.current.setFieldsValue({
      untaggedVlan: '3',
      untaggedVlanCheckbox: true,
      portVlansCheckbox: true
    })

    expect(getCurrentVlansByKey({
      key: 'untaggedVlan', switchId: 'c0:c5:20:aa:35:d9', aggregateData,
      isMultipleEdit: true, portVlansCheckbox: true, hasMultipleValue: [], form: formRef.current
    })).toStrictEqual([3])
  })

})

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
    untaggedVlan: {},
    shouldAlertAaaAndRadiusNotApply: false
  }
  it('should get union values correctly', async () => {
    expect(getUnionValuesByKey('authDefaultVlan', aggregateData)).toStrictEqual([3, 10])
    // expect(getUnionValuesByKey('authDefaultVlan2', aggregateData)).toStrictEqual([3, 10])
    expect(getUnionValuesByKey('defaultVlan', aggregateData)).toStrictEqual([1])
    expect(getUnionValuesByKey('restrictedVlan', aggregateData)).toStrictEqual([9])
    expect(getUnionValuesByKey(
      'switchLevelAuthDefaultVlan', aggregateData)).toStrictEqual([3, 12]
    )
    expect(getUnionValuesByKey('taggedVlans', aggregateData)).toStrictEqual(['3', '10'])
    expect(getUnionValuesByKey('untaggedVlan', aggregateData)).toStrictEqual([])
  })
})
