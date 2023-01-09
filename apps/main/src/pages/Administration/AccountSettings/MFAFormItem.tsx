import { Col, List, Form, Row, Typography, Checkbox } from 'antd'
import TextArea                                       from 'antd/lib/input/TextArea'
import { useIntl }                                    from 'react-intl'
// import styled                                                  from 'styled-components/macro'

import { Card, cssStr }          from '@acx-ui/components'
import { SpaceWrapper }          from '@acx-ui/rc/components'
import { MFAStatus, MFASession } from '@acx-ui/rc/utils'

import { MessageMapping } from './MessageMapping'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

interface MFAFormItemProps {
  mfaTenantDetailsData?: MFASession
}

const MFAFormItem = (props: MFAFormItemProps) => {
  const { $t } = useIntl()
  const { mfaTenantDetailsData } = props
  // const params = useParams()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEnableMFAChange = (e: CheckboxChangeEvent) => {
    // const isChecked = e.target.checked
  }

  const handleClickCopyCodes = () => {

  }

  const isMfaEnabled = mfaTenantDetailsData?.tenantStatus === MFAStatus.ENABLED
  const recoveryCodes = mfaTenantDetailsData?.recoveryCodes

  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          initialValue={false}
          valuePropName='checked'
        >
          <Checkbox
            onChange={handleEnableMFAChange}
            checked={false}
            value={false}
            style={{ paddingRight: '5px' }}
          >
            {$t({ defaultMessage: 'Enable Multi-Factor Authentication (MFA)' })}
          </Checkbox>
        </Form.Item>
        <SpaceWrapper
          style={{
            marginLeft: 24,
            flexWrap: 'wrap',
            alignContent: 'flex-start' }}>

          <List
            split={false}
            size='small'
            dataSource={[
              $t(MessageMapping.enable_mfa_description_1),
              $t(MessageMapping.enable_mfa_description_2),
              $t(MessageMapping.enable_mfa_description_3),
              $t(MessageMapping.enable_mfa_description_4)
            ]}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text style={{ color: cssStr('--acx-neutrals-50') }}>
                  {item}
                </Typography.Text>
              </List.Item>
            )}
          />

          {isMfaEnabled && (
            <Card
              title={$t({ defaultMessage: 'Recovery Codes' })}
              type='no-border'
            >
              <Typography.Text style={{ color: cssStr('--acx-neutrals-50') }}>
                {$t(MessageMapping.enable_mfa_copy_codes_help_1)}
              </Typography.Text>
              <Typography.Text style={{ color: cssStr('--acx-neutrals-50') }}>
                {$t(MessageMapping.enable_mfa_copy_codes_help_2)}
              </Typography.Text>
              <TextArea
                rows={5}
                maxLength={64}
                value={recoveryCodes?.join('\n') || ''}
              />
              <SpaceWrapper justifycontent='flex-end'>
                <Typography.Link onClick={handleClickCopyCodes}>
                  {$t({ defaultMessage: 'Copy Codes' })}
                </Typography.Link>
              </SpaceWrapper>
            </Card>)
          }
        </SpaceWrapper>
      </Col>
    </Row>
  )
}

export { MFAFormItem }