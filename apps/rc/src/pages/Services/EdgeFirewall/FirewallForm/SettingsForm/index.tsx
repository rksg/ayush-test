import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsFormNew, Subtitle } from '@acx-ui/components'
import { SpaceWrapper }           from '@acx-ui/rc/components'

import { DDoSRateFormItem }    from './DDoSRateFormItem'
import { StatefulACLFormItem } from './StatefulACLFormItem'
import { Wrapper }             from './styledComponents'

export const SettingsForm = () => {
  const { $t } = useIntl()

  return (
    <Wrapper>
      <Row>
        <Col span={8}>
          <StepsFormNew.Title>
            {$t({ defaultMessage: 'Settings' })}
          </StepsFormNew.Title>

          <Form.Item
            name='serviceName'
            label={$t({ defaultMessage: 'Service Name' })}
            rules={[
              { required: true },
              { min: 2, max: 32 }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
          {/*
          <Form.Item
            name='tags'
            label={$t({ defaultMessage: 'Tags' })}
            children={<Select mode='tags' />}
          />
          */}
        </Col>
      </Row>
      <Row>
        <SpaceWrapper full direction='vertical' size='middle'>
          <Subtitle level={5}>
            { $t({ defaultMessage: 'Set Firewall Settings' }) }
          </Subtitle>

          <DDoSRateFormItem />
          <StatefulACLFormItem />
        </SpaceWrapper>
      </Row>
    </Wrapper>
  )
}
