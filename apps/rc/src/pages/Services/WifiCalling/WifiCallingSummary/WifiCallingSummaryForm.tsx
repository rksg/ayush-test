import { useContext } from 'react'

import { Form, Col, Row, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { StepsForm } from '@acx-ui/components'


import WifiCallingFormContext from '../WifiCallingFormContext'

const WifiCallingSummaryForm = () => {
  const { Paragraph } = Typography

  const { $t } = useIntl()

  const {
    state
  } = useContext(WifiCallingFormContext)

  return (
    <Row gutter={20}>
      <Col span={18}>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
        <Row>
          <Col span={6}>
            <Form.Item
              name='serviceName'
              label={$t({ defaultMessage: 'Service Name' })}
            >
              <Paragraph>{state.serviceName.toString()}</Paragraph>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name='tags'
              label={$t({ defaultMessage: 'Tags' })}
            >
              <Paragraph>{state.tags?.join(', ')}</Paragraph>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name='description'
              label={$t({ defaultMessage: 'Description' })}
            >
              <Paragraph>{state.description}</Paragraph>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name='qosPriority'
          label={$t({ defaultMessage: 'QoS Priority' })}
        >
          <Paragraph>{state.qosPriority}</Paragraph>
        </Form.Item>

        <Form.Item
          name='dataGateway'
          label={$t({ defaultMessage: 'Evolved Packet Data Gateway (ePDG)' })}
        >
          <>
            {state.ePDG.map(ePDG => {
              return <div key={`${ePDG.domain}`}>{ePDG.domain} ({ePDG.ip})</div>
            })}
          </>

        </Form.Item>

        <Form.Item
          name='wirelessNetworks'
          label={$t({ defaultMessage: 'Wireless Networks' }) + `(${state.networkIds.length})`}
        >
          <>
            {state.networkIds.map(network => {
              return <div key={network}>{network}</div>
            })}
          </>
        </Form.Item>

      </Col>

      <Col span={14}>
      </Col>
    </Row>
  )
}

export default WifiCallingSummaryForm
