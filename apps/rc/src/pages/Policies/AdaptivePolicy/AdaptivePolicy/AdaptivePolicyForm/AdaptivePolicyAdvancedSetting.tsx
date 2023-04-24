import React from 'react'

import { FormInstance } from 'antd'
import { v4 as uuidv4 } from 'uuid'

import { AccessCondition } from '@acx-ui/rc/utils'

import { AccessConditionDrawer }            from './AccessConditionDrawer'
import { RadiusAttributeGroupSelectDrawer } from './RadiusAttributeGroupSelectDrawer'

interface AdaptivePolicyAdvancedSettingProps {
  accessConditionDrawerVisible: boolean
  setAccessConditionDrawerVisible: (visible: boolean) => void
  isConditionEdit?: boolean,
  editCondition?: AccessCondition,
  radiusAttributeDrawerVisible: boolean
  setRadiusAttributeDrawerVisible: (visible: boolean) => void
  settingForm?: FormInstance
}

export function AdaptivePolicyAdvancedSetting (props: AdaptivePolicyAdvancedSettingProps) {

  const { accessConditionDrawerVisible, setAccessConditionDrawerVisible, isConditionEdit = false,
    editCondition, radiusAttributeDrawerVisible,
    setRadiusAttributeDrawerVisible, settingForm } = props

  const setAccessConditions = (condition: AccessCondition) => {
    const evaluationRules = settingForm?.getFieldValue('evaluationRules')
    const newConditions: AccessCondition[] = evaluationRules ? evaluationRules.slice() : []
    if (isConditionEdit) {
      const targetIdx = newConditions.findIndex((r: AccessCondition) => r.id === condition.id)
      newConditions.splice(targetIdx, 1, condition)
    } else {
      condition.id = uuidv4()
      newConditions.push(condition)
    }
    settingForm?.setFieldValue('evaluationRules', newConditions)
  }

  return (
    <>
      <AccessConditionDrawer
        visible={accessConditionDrawerVisible}
        setVisible={setAccessConditionDrawerVisible}
        setAccessConditions={setAccessConditions}
        editCondition={editCondition}
        isEdit={isConditionEdit}
        settingForm={settingForm}/>
      <RadiusAttributeGroupSelectDrawer
        visible={radiusAttributeDrawerVisible}
        setVisible={setRadiusAttributeDrawerVisible}
        settingForm={settingForm}
      />
    </>
  )
}
