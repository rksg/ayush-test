import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm, Subtitle, useStepFormContext } from '@acx-ui/components'

import { InterfaceSettingsFormType } from '../types'

import { LagTable }         from './LagTable'
import { PortGeneralTable } from './PortGeneralTable'
import { VipCard }          from './VipCard'

export const Summary = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const lagSettings = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
  // eslint-disable-next-line max-len
  const portSettings = form.getFieldValue('portSettings') as InterfaceSettingsFormType['portSettings']
  const vipConfig = form.getFieldValue('vipConfig') as InterfaceSettingsFormType['vipConfig']
  const timeout = form.getFieldValue('timeout')

  return (<>
    <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'LAG' }) }
    </Subtitle>
    <Form.Item>
      <LagTable
        data={lagSettings}
        portSettings={portSettings}
      />
    </Form.Item>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Port General' }) }
    </Subtitle>
    <Form.Item>
      <PortGeneralTable data={portSettings} />
    </Form.Item>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Cluster Virtual IP' }) }
    </Subtitle>
    <Form.Item>
      {
        <Row>
          <Col span={12}>
            {
              vipConfig?.map((item, index) => (
                <VipCard key={item.vip} index={index + 1} data={item} />
              ))
            }
          </Col>
        </Row>
      }
    </Form.Item>
    <Form.Item
      label={$t({ defaultMessage: 'HA Timeout' })}
    >
      {`${timeout} seconds`}
    </Form.Item>
  </>)
}