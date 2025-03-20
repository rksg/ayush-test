import { Radio, Space, Form } from 'antd'
import { useIntl }            from 'react-intl'

import { StepsForm }         from '@acx-ui/components'
import {
  ClusterHighAvailabilityModeEnum,
  IncompatibilityFeatures
} from '@acx-ui/rc/utils'

import { ApCompatibilityToolTip } from '../../ApCompatibility/ApCompatibilityToolTip'

import { messageMapping }   from './messageMapping'
import { RadioDescription } from './styledComponents'

export const HaModeRadioGroupFormItem = (props: {
  setEdgeCompatibilityModalFeature: (data: IncompatibilityFeatures) => void,
  initialValue?: ClusterHighAvailabilityModeEnum,
  editMode?: boolean,
  disabled?: boolean,
}) => {
  const { $t } = useIntl()
  const {
    setEdgeCompatibilityModalFeature,
    initialValue,
    editMode = false,
    disabled = false
  } = props

  return <Form.Item
    name='highAvailabilityMode'
    label={$t({ defaultMessage: 'High-Availability Mode' })}
    initialValue={initialValue}
  >
    {editMode
      ? <EditModeContent />
      : <Radio.Group disabled={disabled}>
        <Space direction='vertical'>
          <Radio
            key={ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE}
            value={ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE}
            id={ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE}
          >
            {$t({ defaultMessage: 'Active-Active' })}
            <ApCompatibilityToolTip
              title=''
              showDetailButton
              onClick={() => setEdgeCompatibilityModalFeature(IncompatibilityFeatures.HA_AA)}
            />
            <RadioDescription>{$t(messageMapping.activeActiveMessage)}</RadioDescription>
          </Radio>
          <Radio
            key={ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY}
            value={ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY}
            id={ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY}
          >
            {$t({ defaultMessage: 'Active-Standby' })}
            <RadioDescription>{$t(messageMapping.activeStandbyMessage)}</RadioDescription>
          </Radio>
        </Space>
      </Radio.Group>
    }
  </Form.Item>
}

const EditModeContent = (props: { value?: ClusterHighAvailabilityModeEnum }) => {
  const { $t } = useIntl()

  return props.value === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE
    ? <div style={{ marginTop: 4 }}>
      <StepsForm.FieldLabel width='100%'>
        {$t({ defaultMessage: 'Active-Active' })}
      </StepsForm.FieldLabel>
      <RadioDescription>{$t(messageMapping.activeActiveMessage)}</RadioDescription>
    </div>
    : <div style={{ marginTop: 4 }}>
      <StepsForm.FieldLabel width='100%'>
        {$t({ defaultMessage: 'Active-Standby' })}
      </StepsForm.FieldLabel>
      <RadioDescription>{$t(messageMapping.activeStandbyMessage)}</RadioDescription>
    </div>
}