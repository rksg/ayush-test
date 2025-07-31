import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Select, Subtitle }                                  from '@acx-ui/components'
import {
  getIpSecEspAlgorithmOptions, getIpSecIkeAlgorithmOptions
} from '@acx-ui/edge/components'
import {
  toIpSecEspAlgorithmOptionValue, toIpSecEspProposalData,
  toIpSecIkeAlgorithmOptionValue, toIpSecIkeProposalData
} from '@acx-ui/rc/utils'

import { AuthenticationFormItem } from '../AuthenticationFormItem'

import { DeadPeerDetectionDelayFormItem } from './DeadPeerDetectionDelayFormItem'
import { RekeyTimeUnitFormItem }          from './RekeyTimeUnitFormItem'

export const VxLanSettingForm = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const ikeAlgorithmOptions = getIpSecIkeAlgorithmOptions()
  const espAlgorithmOptions = getIpSecEspAlgorithmOptions()

  const handleEspAlgorithmChange = (value: string) => {
    const espProposalData = toIpSecEspProposalData(value)
    if (espProposalData) {
      form.setFieldValue(['espSecurityAssociation'], espProposalData)
    }
  }

  const handleIkeAlgorithmChange = (value: string) => {
    const ikeProposalData = toIpSecIkeProposalData(value)
    if (ikeProposalData) {
      form.setFieldValue(['ikeSecurityAssociation'], ikeProposalData)
    }
  }

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
        name={['ikeSecurityAssociation']}
        noStyle
        children={<></>}
      />
      <Form.Item
        dependencies={['ikeSecurityAssociation', 'ikeProposals']}
        noStyle
      >
        {({ getFieldsValue }) => {
          const ipsecData = getFieldsValue(true)
          const value = toIpSecIkeAlgorithmOptionValue(ipsecData)

          return <Form.Item
            label={$t({ defaultMessage: 'IKE Algorithm Combination' })}
            rules={[{ required: true }]}
            children={
              <Select
                value={value}
                onChange={handleIkeAlgorithmChange}
                children={
                  ikeAlgorithmOptions.map((option) =>
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>)
                }
              />
            }
          />
        }}
      </Form.Item>
      <RekeyTimeUnitFormItem
        title={$t({ defaultMessage: 'IKE Re-key Time' })}
        timeFieldName='ikeRekeyTime'
        timeUnitFieldName='ikeRekeyTimeUnit'
      />

      <Form.Item
        name={['espSecurityAssociation']}
        noStyle
        children={<></>}
      />
      <Form.Item
        dependencies={['espSecurityAssociation', 'espProposals']}
        noStyle
      >
        {({ getFieldsValue }) => {
          const ipsecData = getFieldsValue(true)
          const value = toIpSecEspAlgorithmOptionValue(ipsecData)

          return <Form.Item
            label={$t({ defaultMessage: 'ESP Algorithm Combination' })}
            rules={[{ required: true }]}
            children={
              <Select
                value={value}
                onChange={handleEspAlgorithmChange}
                children={
                  espAlgorithmOptions.map((option) =>
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>)
                }
              />
            }
          />
        }}
      </Form.Item>
      <RekeyTimeUnitFormItem
        title={$t({ defaultMessage: 'ESP Re-key Time' })}
        timeFieldName='espRekeyTime'
        timeUnitFieldName='espRekeyTimeUnit'
      />
    </Col>
  </Row>
  <Row>
    <Col span={24}>
      <DeadPeerDetectionDelayFormItem />
    </Col>
  </Row>
  </>
  )
}