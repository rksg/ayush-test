import { useState } from 'react'

import { ApplyConfigTemplatePaylod, ConfigTemplate, ConfigTemplateType } from '@acx-ui/rc/utils'
import { flattenObject }                                                 from '@acx-ui/utils'

import { OverrideEntitiyType } from './types'

import { ConfigTemplateOverrideModalProps } from '.'

export type OverrideValuesPerTarget = { [id in string]: OverrideEntitiyType }

// eslint-disable-next-line max-len
export function useConfigTemplateOverride (selectedTemplate: ConfigTemplate, selectedTargets: Array<{ id: string }>) {
  const [ overrideModalVisible, setOverrideModalVisible ] = useState(false)
  const [ overrideValues, setOverrideValues ] = useState<OverrideValuesPerTarget>()

  const isOverridable = (selectedTemplate: ConfigTemplate): boolean => {
    return selectedTemplate.type === ConfigTemplateType.VENUE
  }

  const onOverrideModalClose = () => {
    setOverrideModalVisible(false)
  }

  const updateOverrideValue = (values: OverrideEntitiyType) => {
    const resolvedValues = selectedTargets.reduce((acc, curr) => {
      acc[curr.id] = values
      return acc
    }, {} as OverrideValuesPerTarget)

    setOverrideValues(origin => ({ ...origin, ...resolvedValues }))
  }

  const createOverrideModalProps = (): ConfigTemplateOverrideModalProps => {
    const targetWithOverrideValues = selectedTargets.find(mspEc => overrideValues?.[mspEc.id])
    // eslint-disable-next-line max-len
    const existingOverrideValues = targetWithOverrideValues ? overrideValues![targetWithOverrideValues.id] : {}

    return {
      templateId: selectedTemplate.id!,
      templateType: selectedTemplate.type,
      existingOverrideValues,
      onCancel: onOverrideModalClose,
      updateOverrideValue
    }
  }

  return {
    overrideModalVisible,
    overrideValues,
    setOverrideModalVisible,
    isOverridable,
    createOverrideModalProps
  }
}

export function transformOverrideValues (entity?: OverrideEntitiyType): ApplyConfigTemplatePaylod {
  if (!entity) return { overrides: [] }

  const values = flattenObject(entity)

  return {
    overrides: Object.entries(values).map(([name, value]) => ({ [name]: value }))
  }
}
