import { Dispatch, SetStateAction, useState } from 'react'

import { Form }     from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'

import { ApplicationDrawer, DeviceOSDrawer, Layer2Drawer, Layer3Drawer } from '@acx-ui/rc/components'
import { PolicyType, policyTypeLabelMapping }                            from '@acx-ui/rc/utils'
import { getIntl }                                                       from '@acx-ui/utils'

import { createPolicyMenuItem } from '.'

type AccessControlSubPolicyType =
  PolicyType.LAYER_2_POLICY |
  PolicyType.LAYER_3_POLICY |
  PolicyType.DEVICE_POLICY |
  PolicyType.APPLICATION_POLICY

const INIT_STATE = {
  [PolicyType.LAYER_2_POLICY]: false,
  [PolicyType.LAYER_3_POLICY]: false,
  [PolicyType.DEVICE_POLICY]: false,
  [PolicyType.APPLICATION_POLICY]: false
} as AccessControlSubPolicyVisibility

export type AccessControlSubPolicyVisibility = Record<AccessControlSubPolicyType, boolean>

export function AccessControlSubPolicyDrawers (
  props: {
    accessControlSubPolicyVisible: AccessControlSubPolicyVisibility,
    // eslint-disable-next-line max-len
    setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void
  }
) {
  const { accessControlSubPolicyVisible, setAccessControlSubPolicyVisible } = props

  return <Form >
    <Layer2Drawer
      onlyAddMode={{
        enable: true, visible: accessControlSubPolicyVisible[PolicyType.LAYER_2_POLICY] }}
      callBack={() => setAccessControlSubPolicyVisible(INIT_STATE)}
    />
    <Layer3Drawer
      onlyAddMode={{
        enable: true, visible: accessControlSubPolicyVisible[PolicyType.LAYER_3_POLICY] }}
      callBack={() => setAccessControlSubPolicyVisible(INIT_STATE)}
    />
    <DeviceOSDrawer
      onlyAddMode={{
        enable: true, visible: accessControlSubPolicyVisible[PolicyType.DEVICE_POLICY] }}
      callBack={() => setAccessControlSubPolicyVisible(INIT_STATE)}
    />
    <ApplicationDrawer
      onlyAddMode={{
        enable: true, visible: accessControlSubPolicyVisible[PolicyType.APPLICATION_POLICY] }}
      callBack={() => setAccessControlSubPolicyVisible(INIT_STATE)}
    />
  </Form>
}

export function useAccessControlSubPolicyVisible () {
  return useState<AccessControlSubPolicyVisibility>(INIT_STATE)
}

export function createAccessControlPolicyMenuItem (
  setAccessControlSubPolicyVisible: Dispatch<SetStateAction<AccessControlSubPolicyVisibility>>
): ItemType {
  const { $t } = getIntl()

  return {
    key: 'add-accessControl-set',
    label: $t({ defaultMessage: 'Access Control Set' }),
    children: [
      createPolicyMenuItem(PolicyType.ACCESS_CONTROL, 'add-accessControl'),
      createAccessControlSubPolicyMenuItem(
        PolicyType.LAYER_2_POLICY,
        setAccessControlSubPolicyVisible,
        'add-accessControl-layer2'
      ),
      createAccessControlSubPolicyMenuItem(
        PolicyType.LAYER_3_POLICY,
        setAccessControlSubPolicyVisible,
        'add-accessControl-layer3'
      ),
      createAccessControlSubPolicyMenuItem(
        PolicyType.DEVICE_POLICY,
        setAccessControlSubPolicyVisible,
        'add-accessControl-device'
      ),
      createAccessControlSubPolicyMenuItem(
        PolicyType.APPLICATION_POLICY,
        setAccessControlSubPolicyVisible,
        'add-accessControl-application'
      )
    ]
  }
}

function createAccessControlSubPolicyMenuItem (
  accessControlSubPolicyType: AccessControlSubPolicyType,
  setAccessControlVisible: Dispatch<SetStateAction<AccessControlSubPolicyVisibility>>,
  key: string
) {
  const { $t } = getIntl()

  return {
    key,
    label: <div onClick={() => setAccessControlVisible({
      ...INIT_STATE,
      [accessControlSubPolicyType]: true
    })}>
      {$t(policyTypeLabelMapping[accessControlSubPolicyType])}
    </div>
  }
}
