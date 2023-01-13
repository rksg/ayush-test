import { Col, List, Form, Row, Typography, Checkbox } from 'antd'
import TextArea                                       from 'antd/lib/input/TextArea'
import { useIntl }                                    from 'react-intl'
// import styled                                                  from 'styled-components/macro'

import { Card, showActionModal, cssStr } from '@acx-ui/components'
import { SpaceWrapper }                  from '@acx-ui/rc/components'
import { useUpdateMFAAccountMutation }   from '@acx-ui/rc/services'
import { MFAStatus, MFASession }         from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'

import { MessageMapping } from '../MessageMapping'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

interface MFAFormItemProps {
  mfaTenantDetailsData?: MFASession
}

const MFAFormItem = (props: MFAFormItemProps) => {
  const { $t } = useIntl()
  const { mfaTenantDetailsData } = props
  const params = useParams()
  const [updateMFAAccount, { isLoading: isUpdating }] = useUpdateMFAAccountMutation()

  const handleEnableMFAChange = (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked

    showActionModal({
      type: 'confirm',
      width: 450,
      title: isChecked
        ? $t({ defaultMessage: 'Enable Multi-Factor Authentication?' })
        : $t({ defaultMessage: 'Disable Multi-Factor Authentication?' }),
      content: isChecked
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'By enabling this option, you will require all users of this account to set and use MFA.' })
        // eslint-disable-next-line max-len
        : $t({ defaultMessage: 'Disabling this option will allow all users of this account to log-in using only their email and password, no extra authentication will be required.' }),
      okText: isChecked
        ? $t({ defaultMessage: 'Enable MFA' })
        : $t({ defaultMessage: 'Disable MFA' }),
      onOk: () => {
        updateMFAAccount({
          params: {
            tenantId: params.tenantId,
            enable: isChecked + ''
          }
        })
      }
    })
  }

  const handleClickCopyCodes = () => {
    const codes = mfaTenantDetailsData?.recoveryCodes ?? []
    navigator.clipboard.writeText(codes?.join('\n'))
  }

  const isMfaEnabled = mfaTenantDetailsData?.tenantStatus === MFAStatus.ENABLED
  const recoveryCodes = mfaTenantDetailsData?.recoveryCodes

  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item>
          <Checkbox
            onChange={handleEnableMFAChange}
            checked={isMfaEnabled}
            value={isMfaEnabled}
            style={{ paddingRight: '5px' }}
            disabled={isUpdating}
          >
            {$t({ defaultMessage: 'Enable Multi-Factor Authentication (MFA)' })}
          </Checkbox>
        </Form.Item>

        <SpaceWrapper
          style={{
            marginLeft: 24,
            flexWrap: 'wrap',
            alignContent: 'flex-start' }}
        >
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
                value={recoveryCodes?.join('\n')}
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