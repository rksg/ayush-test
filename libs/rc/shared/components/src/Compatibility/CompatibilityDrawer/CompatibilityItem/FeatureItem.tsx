import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { ApIncompatibleFeature, CompatibilityDeviceEnum, IncompatibilityFeatures, getCompatibilityFeatureDisplayName } from '@acx-ui/rc/utils'

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

  return <UI.StyledWrapper>
    {isMultiple &&
      <Form.Item noStyle>
        <UI.StyledFeatureName>
          {getCompatibilityFeatureDisplayName(data.featureName as IncompatibilityFeatures)}
        </UI.StyledFeatureName>
      </Form.Item>
    }
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
            defaultMessage: 'Incompatible SmartEdges (Currently)'
          })}
        style={UI.detailStyle}
        className='ApCompatibilityDrawerFormItem'
      >
        {`${incompatible} / ${total}`}
      </Form.Item>
    }
  </UI.StyledWrapper>
}