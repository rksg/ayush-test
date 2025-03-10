import React, { useState } from 'react'

import { Form } from 'antd'

import {
  AccessControlPolicyForTemplateCheckType, AclOptionType,
  ConfigTemplateType,
  PolicyType
} from '@acx-ui/rc/utils'

import { SimpleListTooltip }                                             from '../../SimpleListTooltip'
import { Layer2Drawer, Layer3Drawer, DeviceOSDrawer, ApplicationDrawer } from '../AccessControlForm'

type AccessControlSubPolicyType =
  PolicyType.LAYER_2_POLICY |
  PolicyType.LAYER_3_POLICY |
  PolicyType.DEVICE_POLICY |
  PolicyType.APPLICATION_POLICY

type SubPolicyStatus = {
  visible: boolean,
  id: string,
  drawerViewMode?: boolean
}

export const ACCESS_CONTROL_SUB_POLICY_INIT_STATE = {
  [PolicyType.LAYER_2_POLICY]: { visible: false, id: '' },
  [PolicyType.LAYER_3_POLICY]: { visible: false, id: '' },
  [PolicyType.DEVICE_POLICY]: { visible: false, id: '' },
  [PolicyType.APPLICATION_POLICY]: { visible: false, id: '' }
} as AccessControlSubPolicyVisibility

export type AccessControlSubPolicyVisibility = Record<AccessControlSubPolicyType, SubPolicyStatus>

export function AccessControlSubPolicyDrawers (
  props: {
    accessControlSubPolicyVisible: AccessControlSubPolicyVisibility,
    // eslint-disable-next-line max-len
    setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void
  }
) {
  const { accessControlSubPolicyVisible, setAccessControlSubPolicyVisible } = props

  const convertProps = (subPolicyStatus: SubPolicyStatus) => {
    // view detail
    if (subPolicyStatus.drawerViewMode) {
      return {
        drawerViewModeId: subPolicyStatus.id,
        isOnlyViewMode: true,
        onlyViewMode: {
          id: subPolicyStatus.id, viewText: ''
        }
      }
    }

    // edit
    if (subPolicyStatus.id) {
      return {
        editMode: {
          id: subPolicyStatus.id, isEdit: true
        },
        isOnlyViewMode: true,
        onlyViewMode: {
          id: subPolicyStatus.id, viewText: ''
        }
      }
    }

    // add
    return {
      onlyAddMode: {
        enable: true,
        visible: subPolicyStatus.visible
      },
      editMode: {
        id: '', isEdit: false
      }
    }
  }

  return <Form >
    {accessControlSubPolicyVisible[PolicyType.LAYER_2_POLICY].visible && <Layer2Drawer
      {...convertProps(accessControlSubPolicyVisible[PolicyType.LAYER_2_POLICY])}
      callBack={() => setAccessControlSubPolicyVisible(ACCESS_CONTROL_SUB_POLICY_INIT_STATE)}
    />}
    {accessControlSubPolicyVisible[PolicyType.LAYER_3_POLICY].visible && <Layer3Drawer
      {...convertProps(accessControlSubPolicyVisible[PolicyType.LAYER_3_POLICY])}
      callBack={() => setAccessControlSubPolicyVisible(ACCESS_CONTROL_SUB_POLICY_INIT_STATE)}
    />}
    {accessControlSubPolicyVisible[PolicyType.DEVICE_POLICY].visible && <DeviceOSDrawer
      {...convertProps(accessControlSubPolicyVisible[PolicyType.DEVICE_POLICY])}
      callBack={() => setAccessControlSubPolicyVisible(ACCESS_CONTROL_SUB_POLICY_INIT_STATE)}
    />}
    {accessControlSubPolicyVisible[PolicyType.APPLICATION_POLICY].visible && <ApplicationDrawer
      {...convertProps(accessControlSubPolicyVisible[PolicyType.APPLICATION_POLICY])}
      callBack={() => setAccessControlSubPolicyVisible(ACCESS_CONTROL_SUB_POLICY_INIT_STATE)}
    />}
  </Form>
}

export function useAccessControlSubPolicyVisible () {
  return useState<AccessControlSubPolicyVisibility>(ACCESS_CONTROL_SUB_POLICY_INIT_STATE)
}

export function isAccessControlSubPolicy (type: ConfigTemplateType) {
  return type in AccessControlPolicyForTemplateCheckType
}

export function isNotAllowToApplyPolicy (type: ConfigTemplateType) {
  return [
    ...Object.values(AccessControlPolicyForTemplateCheckType),
    ConfigTemplateType.AP_GROUP
  ].includes(type)
}

export const subPolicyMappingType : Partial<Record<ConfigTemplateType, PolicyType>> = {
  [ConfigTemplateType.LAYER_2_POLICY]: PolicyType.LAYER_2_POLICY,
  [ConfigTemplateType.LAYER_3_POLICY]: PolicyType.LAYER_3_POLICY,
  [ConfigTemplateType.DEVICE_POLICY]: PolicyType.DEVICE_POLICY,
  [ConfigTemplateType.APPLICATION_POLICY]: PolicyType.APPLICATION_POLICY
}

// eslint-disable-next-line max-len
export function getToolTipByNetworkFilterOptions (row: { networkIds?: string[] }, networkFilterOptions: AclOptionType[]) {
  if (!row.networkIds || row.networkIds.length === 0) return 0
  const tooltipItems = networkFilterOptions
    .filter(v => row.networkIds!.includes(v.key))
    .map(v => v.value)
  return <SimpleListTooltip items={tooltipItems} displayText={row.networkIds.length} />
}
