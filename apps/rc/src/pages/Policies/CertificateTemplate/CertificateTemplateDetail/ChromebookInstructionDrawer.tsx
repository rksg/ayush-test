import React from 'react'

import { Col, Row, Typography }      from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Drawer }                                from '@acx-ui/components'
import { CertificateTemplate, ChromebookEnrollmentType } from '@acx-ui/rc/utils'
import { handleBlobDownloadFile }                        from '@acx-ui/utils'


interface ChromebookInstructionDrawerProps {
  data: CertificateTemplate
  onClose: () => void
}

export default function ChromebookInstructionDrawer (props: ChromebookInstructionDrawerProps) {
  const { $t } = useIntl()
  const { data, onClose } = props

  const renewalTokenType = data.chromebook?.enrollmentType === ChromebookEnrollmentType.DEVICE
    ? 'system' : 'user'
  const copyableJson = `{
    "doAutoEnrollment": { "Value": true },
    "nonInteractiveEnrollment": { "Value": true },
    "renewalUrl": { "Value": "${data.chromebook?.enrollmentUrl}" },
    "forceInitialEnrollment": { "Value": true },
    "startupDelay": { "Value": 1000 },
    "renewalTokenType": { "Value": "${renewalTokenType}" },
    "renewalIssuerName": { "Value": "${data.onboard?.certificateAuthorityName}" }
}`

  const downloadJsonConfig = () => {
    handleBlobDownloadFile(
      new Blob([copyableJson], { type: 'application/json' }),
      'chromebook-policy-config.txt')
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Chromebook Setup Instructions' })}
      width={650}
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
      <Row gutter={[16, 16]} align='top' key={0}>
        <Col span={24}>
          <Typography.Paragraph>
            {$t({ defaultMessage: 'Managed Chromebook Setup' })}
          </Typography.Paragraph>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align='top' key={1}>
        <Col span={4}>
          {$t({ defaultMessage: 'Step 1' })}
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

      <Row gutter={[16, 16]} align='top' key={2}>
        <Col span={4}>
          {$t({ defaultMessage: 'Step 2' })}
        </Col>
        <Col span={20}>
          <Typography.Paragraph>
            {/* eslint-disable max-len */}
            {$t({ defaultMessage: 'Navigate to {to} and click {click}.' },{ to: <Typography.Text key={'to'} strong>{'Devices -> Networks -> Wi - Fi'}</Typography.Text>, click: <Typography.Text key={'click'} strong>{'Add Wi-Fi'}</Typography.Text> })} <br/>
            {$t({ defaultMessage: 'Create a wireless network with your SSID.' })} <br/>
            {$t({ defaultMessage: 'Check {field}.' }, { field: <Typography.Text key={'field1'} strong>Automatically Connect</Typography.Text> })} <br/>
            {$t({ defaultMessage: 'Set {field} to \'WPA/WPA2-Enterprise\'.' }, { field: <Typography.Text key={'field2'} strong>Security Type</Typography.Text> })} <br/>
            {$t({ defaultMessage: 'Set {field} to \'EAP-TLS\'.' }, { field: <Typography.Text key={'field3'} strong>Extensible Authentication Protocol</Typography.Text> })} <br/>
            {$t({ defaultMessage: 'Set {field} to \'@byod.commscope.com\' or the desired value.' }, { field: <Typography.Text key={'field4'} strong>Username</Typography.Text> })} <br/>
            {$t({ defaultMessage: 'Set {field} to the Certificate Authority configured in step 1.' }, { field: <Typography.Text key={'field5'} strong>Server Certificate Authority</Typography.Text> })} <br/>
            {$t({ defaultMessage: 'Set {field} to {caName}.' }, { field: <Typography.Text key={'field6'} strong>Issuer Common Name</Typography.Text>, caName: `'${data?.onboard?.certificateAuthorityName}'` })} <br/>
            {$t({ defaultMessage: 'Set {field} to \'CommScope\'.' }, { field: <Typography.Text key={'field7'} strong>Issuer Organization</Typography.Text> })} <br/>
            {$t({ defaultMessage: 'Set {field} to {placeholder}.' }, { field: <Typography.Text key={'field8'} strong>Issuer Organizational Unit</Typography.Text>, placeholder: '\'<Blank>\'' })}
            {/* eslint-enable max-len */}
          </Typography.Paragraph>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align='top' key={3}>
        <Col span={4}>
          {$t({ defaultMessage: 'Step 3' })}
        </Col>
        <Col span={20}>
          <Typography.Paragraph>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Navigate to {to}.' }, { to: <Typography.Text strong>{$t({ defaultMessage: 'Devices -> Chrome Devices -> Apps & Extensions' })}</Typography.Text> })} <br/>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Add the \'RUCKUS One Certificate Generator\' extension from the Chrome Web Store.' })}
          </Typography.Paragraph>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align='top' key={4}>
        <Col span={4}>
          {$t({ defaultMessage: 'Step 4' })}
        </Col>
        <Col span={20}>
          <Typography.Paragraph>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Select the RUCKUS One extension installed in the previous step. In the configuration pane, allow Verified Access by enabling {i}.' }, { i: <Typography.Text strong>Allow enterprise challenge</Typography.Text> })}
          </Typography.Paragraph>
          <Typography.Paragraph>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Enter the JSON below into the {section} section.' }, { section: <Typography.Text strong>{$t({ defaultMessage: 'Policy for extensions' })}</Typography.Text> })}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <pre>
              {copyableJson}
            </pre>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <Typography.Link
              onClick={downloadJsonConfig}
              copyable={{ text: copyableJson }}
            >
              {$t({ defaultMessage: 'Download JSON as File' })}
            </Typography.Link>
          </Typography.Paragraph>
          <Typography.Paragraph>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Set the extensions {policy} to \'Force Install\'. Save the configuration changes to the extension.' }, { policy: <Typography.Text strong>Installation policy</Typography.Text> })}
          </Typography.Paragraph>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align='top' key={5}>
        <Col span={4}>
          {$t({ defaultMessage: 'Step 5' })}
        </Col>
        <Col span={20}>
          <Typography.Paragraph>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'At this point, the extension will be deployed to the managed Chromebooks along with the wireless network. Once authorized. the extension will install the certificate and the SSID will then be joinable. When the user clicks on the wireless network, the operating system will look for a certificate with the issuer characteristics above.' })}
          </Typography.Paragraph>
        </Col>
      </Row>
    </Drawer>
  )
}
