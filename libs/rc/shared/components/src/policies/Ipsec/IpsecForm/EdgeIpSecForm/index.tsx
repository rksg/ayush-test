import { Checkbox, Col, Form, Input, Row, Tooltip } from 'antd'
import { useIntl }                                  from 'react-intl'

import { Select, Subtitle }                                         from '@acx-ui/components'
import { getIpSecEspAlgorithmOptions, getIpSecIkeAlgorithmOptions } from '@acx-ui/edge/components'
import { QuestionMarkCircleOutlined }                               from '@acx-ui/icons'
import {
  Ipsec,
  useConfigTemplate
} from '@acx-ui/rc/utils'

import { AuthenticationFormItem } from '../AuthenticationFormItem'
import { messageMapping }         from '../messageMapping'

import { DeadPeerDetectionDelayFormItem } from './DeadPeerDetectionDelayFormItem'
import { RekeyTimeUnitFormItem }          from './RekeyTimeUnitFormItem'


interface VxLanSettingFormProps {
  policyId?: string
  editMode?: boolean
  readMode?: boolean
  initIpSecData?: Ipsec
}

export const VxLanSettingForm = (props: VxLanSettingFormProps) => {
  const { $t } = useIntl()
  // const { readMode } = props
  // const form = Form.useFormInstance()
  const { isTemplate } = useConfigTemplate()
  const ikeAlgorithmOptions = getIpSecIkeAlgorithmOptions()
  const espAlgorithmOptions = getIpSecEspAlgorithmOptions()

  return (<><Row>
    <Col span={12}>
      <AuthenticationFormItem />
    </Col>
  </Row>
  <Row>
    <Col span={24}>
      <Subtitle level={5}>
        { $t({ defaultMessage: 'Security Association' }) }
      </Subtitle>
      <Form.Item
        label={$t({ defaultMessage: 'IKE Algorithm Combination' })}
        children={
          <Select
            children={
              ikeAlgorithmOptions.map((option) =>
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>)
            }
          />
        }
      />
      <Form.Item label={$t({ defaultMessage: 'IKE Re-key Time' })} />
      <RekeyTimeUnitFormItem
        timeFieldName='ikeRekeyTime'
        timeUnitFieldName='ikeRekeyTimeUnit'
      />

      <Form.Item
        label={$t({ defaultMessage: 'ESP Algorithm Combination' })}
        children={
          <Select
            children={
              espAlgorithmOptions.map((option) =>
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>)
            }
          />
        }
      />
      <Form.Item label={$t({ defaultMessage: 'ESP Re-key Time' })} />
      <RekeyTimeUnitFormItem
        timeFieldName='espRekeyTime'
        timeUnitFieldName='espRekeyTimeUnit'
      />

      <DeadPeerDetectionDelayFormItem />
    </Col>
  </Row>
  </>
  )
}