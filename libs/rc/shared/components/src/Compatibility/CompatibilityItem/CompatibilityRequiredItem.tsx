import { Form }    from 'antd'
import { isNil }   from 'lodash'
import { useIntl } from 'react-intl'

import { ApCompatibility, ApIncompatibleFeature } from '@acx-ui/rc/utils'

import { CompatibilityType } from '../../ApCompatibility/constants'
import { StyledWrapper }     from '../../ApCompatibility/styledComponents'

import * as UI from './styledComponents'

interface CompatibilityRequiredItemProps {
  isMultiple?: boolean
  type: CompatibilityType
  data: ApIncompatibleFeature
  incompatible: ApCompatibility['incompatible']
  total: ApCompatibility['total']
}

export const CompatibilityRequiredItem = (props: CompatibilityRequiredItemProps) => {
  const { $t } = useIntl()
  const { isMultiple = false, type, data, incompatible, total } = props

  return <StyledWrapper>
    {isMultiple &&
      <Form.Item>
        <UI.StyledFeatureName>
          {data.featureName}
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
    {isNil(incompatible) && isNil(total) && type !== CompatibilityType.VENUE &&
      <Form.Item
        label={type === CompatibilityType.AP
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
  </StyledWrapper>
}