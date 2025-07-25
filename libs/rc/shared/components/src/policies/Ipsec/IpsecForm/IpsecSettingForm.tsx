
import { Col, Form, Input, Radio, Row, Space } from 'antd'
import { useIntl }                             from 'react-intl'

import { Loader }           from '@acx-ui/components'
import {
  checkObjectNotExists,
  Ipsec,
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'

import { VxLanSettingForm }   from './EdgeIpSecForm'
import { SoftGreSettingForm } from './SoftGreSettingForm'


interface IpsecSettingFormProps {
  initIpSecData?: Ipsec
}

export const IpsecSettingForm = (props: IpsecSettingFormProps) => {
  const { $t } = useIntl()
  const { initIpSecData } = props
  const policyId = initIpSecData?.id

  const nameValidator = async (value: string) => {
    const payload = { ...defaultPayload, searchString: value }
    // eslint-disable-next-line max-len
    const list = (await getIpsecViewDataList({ params, payload }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'IPsec' }))
  }

  return (
    <Loader states={[{ isLoading }]}>
      <Row>
        <Col span={12}>
          <Form.Item
            {...(readMode? undefined : { name: 'name' })}
            hidden={readMode}
            label={$t({ defaultMessage: 'Profile Name' })}
            rules={readMode ? undefined : [
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => servicePolicyNameRegExp(value) },
              { validator: (_, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            initialValue={''}
            validateTrigger={'onBlur'}
            children={readMode ? ipsecData?.name : <Input/>}
          />

          <Form.Item
            name='tunnelUsageType'
            label={$t({ defaultMessage: 'Tunnel Usage Type' })}
          >
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={'VxLan'}>
                  {$t({ defaultMessage: 'For RUCKUS Devices(VxLAN GPE)' })}
                </Radio>
                <Radio value={'SoftGre'}>
                  {$t({ defaultMessage: 'For 3rd Party Devices(SoftGRE)' })}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <Form.Item dependencies={['tunnelUsageType']}>
            {({ getFieldValue }) => {
              const tunnelUsageType = getFieldValue('tunnelUsageType')

              return tunnelUsageType === 'VxLan'
                ? <VxLanSettingForm initIpSecData={initIpSecData} />
                : <SoftGreSettingForm />
            }}
          </Form.Item>
        </Col>
      </Row>
    </Loader>
  )
}