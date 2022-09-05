
import { Form, Input, Col, Radio, Row, Space } from 'antd'
import { useIntl }                             from 'react-intl'

import { StepsForm }          from '@acx-ui/components'
import { DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'

import { dhcpTypes, dhcpTypesDesc } from './contentsMap'
import { DHCPDiagram }              from './DHCPDiagram/DHCPDiagram'
import { PoolDetail }               from './DHCPPool/PoolDetail'
import { RadioDescription }         from './styledComponents'


const { useWatch } = Form
export function SettingForm () {
  const intl = useIntl()


  const type = useWatch<DHCPConfigTypeEnum>('dhcpConfig')

  const params = useParams()
  const types = [
    { type: DHCPConfigTypeEnum.SIMPLE },
    { type: DHCPConfigTypeEnum.MULTIPLE },
    { type: DHCPConfigTypeEnum.HIERARCHICAL }
  ]

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={intl.$t({ defaultMessage: 'Service Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 }
            // { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='tags'
          label={intl.$t({ defaultMessage: 'Tags' })}
          children={<Input />}
        />
        <Form.Item>

          {params?.type === 'wifi' &&
          <Form.Item
            name='dhcpConfig'
            initialValue={DHCPConfigTypeEnum.SIMPLE}
            label={intl.$t({ defaultMessage: 'DHCP Configuration' })}
            rules={[{ required: true,
              message: intl.$t({ defaultMessage: 'Please select DHCP Configuration' }) }]}
          >
            <Radio.Group>
              <Space direction='vertical'>
                {types.map(({ type }) => (
                  <Radio key={type} value={type}>
                    {intl.$t(dhcpTypes[type])}
                    <RadioDescription>
                      {intl.$t(dhcpTypesDesc[type])}
                    </RadioDescription>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>}

        </Form.Item>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Set DHCP Pools' })}
        />
        <PoolDetail/>
      </Col>
      {params?.type === 'wifi' &&
      <Col span={14}>
        <DHCPDiagram type={type}/>
      </Col>
      }
    </Row>
  )
}
