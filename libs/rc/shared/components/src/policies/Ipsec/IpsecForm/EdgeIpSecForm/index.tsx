import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Select, Subtitle }                                  from '@acx-ui/components'
import {
  getIpSecEspAlgorithmOptions, getIpSecIkeAlgorithmOptions
} from '@acx-ui/edge/components'
import {
  toIpSecEspProposalData,
  toIpSecIkeProposalData,
  Ipsec
} from '@acx-ui/rc/utils'

import { AuthenticationFormItem } from '../AuthenticationFormItem'

import { DeadPeerDetectionDelayFormItem } from './DeadPeerDetectionDelayFormItem'
import { RekeyTimeUnitFormItem }          from './RekeyTimeUnitFormItem'

export const VxLanSettingForm = (props: { editData?: Ipsec }) => {
  const { $t } = useIntl()
  const { editData } = props
  const form = Form.useFormInstance()

  const ikeAlgorithmOptions = getIpSecIkeAlgorithmOptions()
  const espAlgorithmOptions = getIpSecEspAlgorithmOptions()

  const handleEspAlgorithmChange = (value: string) => {
    const espProposalData = toIpSecEspProposalData(value)
    // when the value is valid, update into corresponding fields
    if (espProposalData) {
      form.setFieldValue(['espSecurityAssociation'], espProposalData)
    }
  }

  const handleIkeAlgorithmChange = (value: string) => {
    const ikeProposalData = toIpSecIkeProposalData(value)
    // when the value is valid, update into corresponding fields
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
        name={['ikeAlgorithmCombination']}
        label={$t({ defaultMessage: 'IKE Algorithm Combination' })}
        // eslint-disable-next-line max-len
        rules={[{ required: true, message: $t({ defaultMessage: 'Please select IKE Algorithm Combination' }) }]}
        children={
          <Select
            onChange={handleIkeAlgorithmChange}
            options={ikeAlgorithmOptions}
          />
        }
      />
      <Form.Item
        name={['ikeSecurityAssociation']}
        noStyle
        children={<></>}
      />
      <RekeyTimeUnitFormItem
        title={$t({ defaultMessage: 'IKE Re-key Time' })}
        timeFieldName='ikeRekeyTime'
        timeUnitFieldName='ikeRekeyTimeUnit'
      />

      <Form.Item
        name='espAlgorithmCombination'
        label={$t({ defaultMessage: 'ESP Algorithm Combination' })}
        // eslint-disable-next-line max-len
        rules={[{ required: true, message: $t({ defaultMessage: 'Please select ESP Algorithm Combination' }) }]}
        children={
          <Select
            onChange={handleEspAlgorithmChange}
            options={espAlgorithmOptions}
          />
        }
      />
      <Form.Item
        name={['espSecurityAssociation']}
        noStyle
        children={<></>}
      />
      <RekeyTimeUnitFormItem
        title={$t({ defaultMessage: 'ESP Re-key Time' })}
        timeFieldName='espRekeyTime'
        timeUnitFieldName='espRekeyTimeUnit'
      />
    </Col>
  </Row>
  <Row>
    <Col span={24}>
      <DeadPeerDetectionDelayFormItem editData={editData} />
    </Col>
  </Row>
  </>
  )
}