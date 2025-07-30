import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Select, Subtitle }                                         from '@acx-ui/components'
import { getIpSecEspAlgorithmOptions, getIpSecIkeAlgorithmOptions } from '@acx-ui/edge/components'

import { AuthenticationFormItem } from '../AuthenticationFormItem'

import { DeadPeerDetectionDelayFormItem } from './DeadPeerDetectionDelayFormItem'
import { RekeyTimeUnitFormItem }          from './RekeyTimeUnitFormItem'

export const VxLanSettingForm = () => {
  const { $t } = useIntl()

  const ikeAlgorithmOptions = getIpSecIkeAlgorithmOptions()
  const espAlgorithmOptions = getIpSecEspAlgorithmOptions()

  return (<><Row>
    <Col span={12}>
      <AuthenticationFormItem />
    </Col>
  </Row>
  <Row>
    <Col span={12}>
      <Subtitle level={5}>
        { $t({ defaultMessage: 'Security Association' }) }
      </Subtitle>
      <Form.Item
        label={$t({ defaultMessage: 'IKE Algorithm Combination' })}
        rules={[{ required: true }]}
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
      <RekeyTimeUnitFormItem
        title={$t({ defaultMessage: 'IKE Re-key Time' })}
        timeFieldName='ikeRekeyTime'
        timeUnitFieldName='ikeRekeyTimeUnit'
      />

      <Form.Item
        label={$t({ defaultMessage: 'ESP Algorithm Combination' })}
        rules={[{ required: true }]}
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
      <RekeyTimeUnitFormItem
        title={$t({ defaultMessage: 'ESP Re-key Time' })}
        timeFieldName='espRekeyTime'
        timeUnitFieldName='espRekeyTimeUnit'
      />

      <DeadPeerDetectionDelayFormItem />
    </Col>
  </Row>
  </>
  )
}