import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  ApIncompatibleFeature,
  CompatibilityDeviceEnum,
  IncompatibilityFeatures,
  getCompatibilityFeatureDisplayName
} from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import { SupportedFirmwareInfo } from './SupportedFirmwareInfo'

export interface FeatureItemProps {
  isMultiple?: boolean
  deviceType: CompatibilityDeviceEnum
  data: ApIncompatibleFeature
  incompatible: number
  total: number
  hasBackgroundColor?: boolean
}

export const FeatureItem = (props: FeatureItemProps) => {
  const { $t } = useIntl()
  const { isMultiple = false, deviceType, data, incompatible, total, hasBackgroundColor } = props
  const isApCompatibilitiesByModel = 'requirements' in data

  const incompatibleInfo = (Boolean(incompatible) && Boolean(total)) &&
    <UI.StyledFormItem
      label={deviceType === CompatibilityDeviceEnum.AP
        ? $t({
          defaultMessage: 'Incompatible Access Points (Currently)'
        })
        : $t({
          defaultMessage: 'Incompatible RUCKUS Edges (Currently)'
        })}
    >
      { isApCompatibilitiesByModel ? incompatible : `${incompatible} / ${total}`}
    </UI.StyledFormItem>

  // eslint-disable-next-line max-len
  return <UI.StyledRequirementWrapper $hasBackground={isApCompatibilitiesByModel && hasBackgroundColor}>
    {isMultiple &&
      <Form.Item noStyle>
        <UI.StyledFeatureName>
          {getCompatibilityFeatureDisplayName(data.featureName as IncompatibilityFeatures)}
        </UI.StyledFeatureName>
      </Form.Item>
    }

    { isApCompatibilitiesByModel && incompatibleInfo}
    <SupportedFirmwareInfo
      deviceType={deviceType}
      data={data}
      hasBackgroundColor={hasBackgroundColor}
    />
    { !isApCompatibilitiesByModel && incompatibleInfo}
  </UI.StyledRequirementWrapper>
}