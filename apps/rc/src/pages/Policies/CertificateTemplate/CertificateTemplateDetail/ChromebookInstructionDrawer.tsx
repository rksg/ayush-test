import React from 'react'

import { Col, Divider, Row, Typography } from 'antd'
import { FormattedMessage, useIntl }     from 'react-intl'

import { Button, Drawer }      from '@acx-ui/components'
import { CertificateTemplate } from '@acx-ui/rc/utils'


interface ChromebookInstructionDrawerProps {
  data?: CertificateTemplate
  onClose: () => void
}

export default function ChromebookInstructionDrawer (props: ChromebookInstructionDrawerProps) {
  const { $t } = useIntl()
  const { data, onClose } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'Chromebook Setup Instructions' })}
      width={670}
      visible={true}
      onClose={onClose}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            cancel: ''
          }}
          onCancel={onClose}
          extra={<Button onClick={onClose}>Close</Button>}
        />
      }
    >
      <Typography>
        <Row gutter={[16, 16]} align='top'>
          <Col span={24}>
            {$t({ defaultMessage: 'Managed Chromebook Setup' })}
          </Col>
          <Col span={4}>
            <Typography.Title level={4}>
              {$t({ defaultMessage: 'Step 1' })}
            </Typography.Title>
          </Col>
          <Col span={20}>
            <Typography.Paragraph>
              <FormattedMessage
                defaultMessage={'In the Chrome management console, navigate to {navigation}. ' +
                  'Add the certificates in the CA certificate chain for your Radius server.'}
                values={{
                  navigation:
                    <Typography.Text strong>
                      {$t({ defaultMessage: 'Devices -> Networks -> Certificates' })}
                    </Typography.Text>
                }}
              />
            </Typography.Paragraph>
          </Col>
        </Row>


        <Row gutter={[16, 16]} align='top'>
          <Col span={4}>
            <Typography.Title level={4}>
              {$t({ defaultMessage: 'Step 2' })}
            </Typography.Title>
          </Col>
          <Col span={20}>
            <Typography.Paragraph>
              {$t({ defaultMessage: 'Navigate to {to} and click {click}.' },
                {
                  // eslint-disable-next-line max-len
                  to: <Typography.Text strong>{'Devices -> Networks -> Wi - Fi'}</Typography.Text>,
                  click: <Typography.Text strong>{'Add Wi-Fi'}</Typography.Text>
                })}
              {/* eslint-disable max-len */}
              {$t({ defaultMessage: 'Create a wireless network with your SSID.' })}
              {$t({ defaultMessage: 'Check {field}.' }, { field: <Typography.Text strong>Automatically Connect</Typography.Text> })}
              {$t({ defaultMessage: 'Set {field} to \'WPA/WPA2-Enterprise\'.' }, { field: <Typography.Text strong>Security Type</Typography.Text> })}
              {$t({ defaultMessage: 'Set {field} to \'EAP-TLS\'.' }, { field: <Typography.Text strong>Extensible Authentication Protocol</Typography.Text> })}
              {$t({ defaultMessage: 'Set {field} to \'@byod.commscope.com\' or the desired value.' }, { field: <Typography.Text strong>Username</Typography.Text> })}
              {$t({ defaultMessage: 'Set {field} to the Certificate Authority configured in step 1.' }, { field: <Typography.Text strong>Server Certificate Authority</Typography.Text> })}
              {$t({ defaultMessage: 'Set {field} to {caName}' }, { field: <Typography.Text strong>Issuer Common Name</Typography.Text>, caName: '?????' })}
              {$t({ defaultMessage: 'Set {field} to \'CommScope\'' }, { field: <Typography.Text strong>Issuer Organization</Typography.Text> })}
              {$t({ defaultMessage: 'Set {field} to \'<<Blank>>\'.' }, { field: <Typography.Text strong>Issuer Organizational Unit</Typography.Text> })}
              {/* eslint-enable max-len */}
            </Typography.Paragraph>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]} align='top'>
          <Col span={4}>
            <Typography.Title level={4}>
              {$t({ defaultMessage: 'Step 3' })}
            </Typography.Title>
          </Col>
          <Col span={20}>
            <Typography.Paragraph>
              Navigate to <Typography.Text strong>Devices -&gt; Chrome Devices -&gt; Apps & Extensions</Typography.Text>.
              <br />
              Add the 'Cloudpath Certificate Generator' extension from the Chrome Web Store.
            </Typography.Paragraph>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]} align='top'>
          <Col span={4}>
            <Typography.Title level={4}>
              {$t({ defaultMessage: 'Step 4' })}
            </Typography.Title>
          </Col>
          <Col span={20}>
            <Typography.Paragraph>
              Select the Cloudpath extension installed in the previous step. In the configuration pane, allow
              Verified Access by enabling <Typography.Text strong>Allow enterprise challenge</Typography.Text>. Enter the JSON below
              into the Policy for extensions section.
            </Typography.Paragraph>
            <Typography.Paragraph copyable={true} code={true}>
              {`
{
  "doAutoEnrollment": { "Value": true },
  "noninteractiveEnrollment": { "Value": true },
  "renewalUrl": { "Value": "https://example.com" }
}
              `}
            </Typography.Paragraph>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]} align='top'>
          <Col span={4}>
            <Typography.Title level={4}>
              {$t({ defaultMessage: 'Step 5' })}
            </Typography.Title>
          </Col>
          <Col span={20}>
            <Typography.Paragraph>

            </Typography.Paragraph>
          </Col>
        </Row>
      </Typography>
    </Drawer>
  )
}
