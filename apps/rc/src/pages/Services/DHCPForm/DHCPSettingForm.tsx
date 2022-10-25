import { Form, Input, Col, Radio, Row, Space } from 'antd'
import { useIntl }                             from 'react-intl'

import { StepsForm }          from '@acx-ui/components'
import { DHCPConfigTypeEnum } from '@acx-ui/rc/utils'

import { dhcpTypes, dhcpTypesDesc } from './contentsMap'
import { DHCPDiagram }              from './DHCPDiagram/DHCPDiagram'
import DHCPPoolTable                from './DHCPPool'
import { RadioDescription }         from './styledComponents'


const { useWatch } = Form
export function SettingForm () {
  const intl = useIntl()

  const type = useWatch<DHCPConfigTypeEnum>('dhcpConfig')
  // const createType = useWatch<ServiceTechnology>('createType')

  const types = Object.values(DHCPConfigTypeEnum)

  return (<>
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
          style={{ display: 'none' }}
          label={intl.$t({ defaultMessage: 'Tags' })}
          children={<Input />}
        />

        <Form.Item
          name='dhcpConfig'
          initialValue={DHCPConfigTypeEnum.SIMPLE}
          label={intl.$t({ defaultMessage: 'DHCP Configuration' })}
          rules={[{ required: true,
            message: intl.$t({ defaultMessage: 'Please select DHCP Configuration' }) }]}
        >
          <Radio.Group>
            <Space direction='vertical'>
              {types.map(type => (
                <Radio key={type} value={type}>
                  {intl.$t(dhcpTypes[type])}
                  <RadioDescription>
                    {intl.$t(dhcpTypesDesc[type])}
                  </RadioDescription>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

      </Col>
      <Col span={10}>
        <DHCPDiagram type={type}/>
      </Col>
    </Row>
    <Row gutter={20}>
      <Col span={20}>
        <Form.Item
          name='dhcpPools'
          label={intl.$t({ defaultMessage: 'Set DHCP Pools' })}
          children={<DHCPPoolTable />}
        />
      </Col>
    </Row>
  </>)
}
