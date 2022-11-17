
import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm, Subtitle }                                 from '@acx-ui/components'
import { DpskNetworkType, DPSKSaveData, transformDpskNetwork } from '@acx-ui/rc/utils'


export default function DPSKSummary (props: {
  summaryData: DPSKSaveData
}) {
  const intl = useIntl()
  const $t = intl.$t
  const { summaryData } = props

  return (
    <>
      <StepsForm.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsForm.Title>
      <Row>
        <Col span={24}>
          <Subtitle level={4}>{ $t({ defaultMessage: 'Settings' }) }</Subtitle>
        </Col>
        <Col span={4}>
          <Form.Item label={$t({ defaultMessage: 'Service Name:' })} children={summaryData.name} />
        </Col>
        <Col span={4}>
          <Form.Item label={$t({ defaultMessage: 'Passphrase Format:' })}
            children={transformDpskNetwork(
              intl,
              DpskNetworkType.FORMAT,
              summaryData.passphraseFormat
            )} />
        </Col>
        <Col span={4}>
          <Form.Item label={$t({ defaultMessage: 'Passphrase Length:' })}
            children={transformDpskNetwork(
              intl,
              DpskNetworkType.LENGTH,
              summaryData.passphraseLength
            )} />
        </Col>
        <Col span={24}>
          <Form.Item label={$t({ defaultMessage: 'List Expiration:' })}
            children={transformDpskNetwork(
              intl,
              DpskNetworkType.EXPIRATION,
              summaryData.expiration
            )} />
        </Col>
      </Row>
    </>
  )
}
