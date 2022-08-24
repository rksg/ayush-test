import { EnvironmentOutlined }     from '@ant-design/icons'
import { Col, Divider, Form, Row } from 'antd'
import { useIntl }                 from 'react-intl'

import { StepsForm, Subtitle }                        from '@acx-ui/components'
import { CreateDPSKFormFields, transformDisplayText } from '@acx-ui/rc/utils'


export function SummaryForm (props: {
  summaryData: CreateDPSKFormFields
}) {
  const { $t } = useIntl()
  const { summaryData } = props
  const getNetworks = function () {
    const networks = summaryData.network
    const rows = []
    if (networks && networks.length > 0) {
      for (const network of networks) {
        rows.push(
          <li key={network.networkId} style={{ margin: '10px 0px' }}>
            {network.name}
          </li>
        )
      }
      return rows
    } else {
      return transformDisplayText()
    }
  }

  return (
    <>
      <StepsForm.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsForm.Title>
      <Row gutter={20}>
        <Col flex={1}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Settings' }) }
          </Subtitle>
          <Form.Item label={$t({ defaultMessage: 'Service Name:' })} children={summaryData.name} />
          <Form.Item
            label={$t({ defaultMessage: 'Tags:' })}
            children={transformDisplayText(summaryData.tags)}
          />
          <Form.Item label={$t({ defaultMessage: 'Security Protocol:' })}
            children={'WPA2'} />
          <Form.Item label={$t({ defaultMessage: 'Passphrase Format:' })}
            children={summaryData.passphraseFormat} />
          <Form.Item label={$t({ defaultMessage: 'Passphrase Length:' })}
            children={summaryData.passphraseLength} />
          <Form.Item label={$t({ defaultMessage: 'Passphrase Expiration:' })}
            children={summaryData.expiration} />
        </Col>
        <Divider type='vertical' style={{ height: '300px' }}/>
        <Col flex={1}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Wireless Networks ({count})' },
              { count: summaryData.network?.length || 0 }) }
          </Subtitle>
          <Form.Item children={getNetworks()} />
        </Col>
      </Row>
    </>
  )
}
