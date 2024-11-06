import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { ApIncompatibleFeature, CompatibilityDeviceEnum, IncompatibilityFeatures, getCompatibilityFeatureDisplayName, FeatureSet, ApRequirement } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

export interface FeatureItemProps {
  isMultiple?: boolean
  deviceType: CompatibilityDeviceEnum
  data: ApIncompatibleFeature
  incompatible: number
  total: number
}

export const FeatureItem = (props: FeatureItemProps) => {
  const { $t } = useIntl()
  const { isMultiple = false, deviceType, data, incompatible, total } = props
  const Wrapper = 'requirements' in data ? UI.StyledRequirementWrapper : React.Fragment

  return <Wrapper>
    {isMultiple &&
      <Form.Item noStyle>
        <UI.StyledFeatureName>
          {getCompatibilityFeatureDisplayName(data.featureName as IncompatibilityFeatures)}
        </UI.StyledFeatureName>
      </Form.Item>
    }
    {'requirements' in data &&
    (data as FeatureSet).requirements?.map((requirement: ApRequirement, reqIndex) => (
      <React.Fragment key={`requirements_${reqIndex}`}>
        <Form.Item
          label={$t({ defaultMessage: 'Minimum required version' })}
          style={UI.detailStyle}
          className='ApCompatibilityDrawerFormItem'
        >
          {requirement?.firmware}
        </Form.Item>
        { requirement.models && deviceType === CompatibilityDeviceEnum.SWITCH &&
          <Form.Item
            label={$t({ defaultMessage: 'Supported ICX Models' })}
            style={UI.detailStyle}
            className='ApCompatibilityDrawerFormItem'
          >
            {requirement.models.join(', ')}
          </Form.Item>
        }
      </React.Fragment>
    ))}
    {data.requiredFw &&
      <Form.Item
        label={$t({ defaultMessage: 'Minimum required version' })}
        style={UI.detailStyle}
        className='ApCompatibilityDrawerFormItem'
      >
        {data.requiredFw}
      </Form.Item>
    }
    {data.supportedModelFamilies &&
      <Form.Item
        label={$t({ defaultMessage: 'Supported AP Model Family' })}
        style={UI.detailStyle}
        className='ApCompatibilityDrawerFormItem'
      >
        {data.supportedModelFamilies?.join(', ')}
      </Form.Item>
    }
    {(Boolean(incompatible) && Boolean(total)) &&
      <Form.Item
        label={deviceType === CompatibilityDeviceEnum.AP
          ? $t({
            defaultMessage: 'Incompatible Access Points (Currently)'
          })
          : $t({
            defaultMessage: 'Incompatible RUCKUS Edges (Currently)'
          })}
        style={UI.detailStyle}
        className='ApCompatibilityDrawerFormItem'
      >
        {`${incompatible} / ${total}`}
      </Form.Item>
    }
  </Wrapper>
}
