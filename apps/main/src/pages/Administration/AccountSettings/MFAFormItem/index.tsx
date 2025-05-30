import { Col, List, Form, Row, Typography, Checkbox } from 'antd'
import TextArea                                       from 'antd/lib/input/TextArea'
import { useIntl }                                    from 'react-intl'
import styled                                         from 'styled-components/macro'

import { Card, showActionModal }                       from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { SpaceWrapper }                                from '@acx-ui/rc/components'
import { administrationApi, useGetTenantDetailsQuery } from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink }       from '@acx-ui/react-router-dom'
import { store }                                       from '@acx-ui/store'
import {
  MFAStatus,
  MfaDetailStatus,
  getUserProfile,
  getUserUrls,
  hasAllowedOperations,
  hasCrossVenuesPermission,
  useToggleMFAMutation
} from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

interface MFAFormItemProps {
  className?: string;
  mfaTenantDetailsData?: MfaDetailStatus;
  isPrimeAdminUser: boolean;
  isMspEc: boolean;
}

const MFAFormItem = styled((props: MFAFormItemProps) => {
  const { $t } = useIntl()
  const mfaNewApiToggle = useIsSplitOn(Features.MFA_NEW_API_TOGGLE)
  const { className, mfaTenantDetailsData, isPrimeAdminUser, isMspEc } = props
  const params = useParams()
  const [toggleMFA, { isLoading: isUpdating }] = useToggleMFAMutation()
  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const navigate = useNavigate()
  const linkToUserProfile = useTenantLink('/userprofile/security')
  const { rbacOpsApiEnabled } = getUserProfile()

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
      onOk: async () => {
        try {
          await toggleMFA({
            params: {
              tenantId: params.tenantId,
              enable: isChecked + ''
            }, enableRbac: mfaNewApiToggle
          }).unwrap()
          if (isMspEc) {
            store.dispatch(
              administrationApi.util.invalidateTags([
                { type: 'Administration', id: 'DETAIL' }
              ]))
          }
          if (isChecked)
            navigate(linkToUserProfile)
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    })
  }

  const handleClickCopyCodes = () => {
    const codes = mfaTenantDetailsData?.recoveryCodes ?? []
    navigator.clipboard.writeText(codes?.join('\n'))
  }

  const isMfaEnabled = isMspEc
    ? tenantDetailsData?.data?.tenantMFA?.mfaStatus === MFAStatus.ENABLED
    : mfaTenantDetailsData?.tenantStatus === MFAStatus.ENABLED
  const recoveryCodes = mfaTenantDetailsData?.recoveryCodes

  const hasPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([
      getOpsApi(getUserUrls(mfaNewApiToggle).toggleMFA)
    ]) : (hasCrossVenuesPermission() || isPrimeAdminUser)

  const isDisabled = !hasPermission ||
    isUpdating || (isMspEc && isMfaEnabled)

  return (
    <Row gutter={24} className={className}>
      <Col span={10}>
        <Form.Item>
          <Checkbox
            onChange={handleEnableMFAChange}
            checked={isMfaEnabled}
            value={isMfaEnabled}
            disabled={isDisabled}
          >
            {$t({ defaultMessage: 'Enable Multi-Factor Authentication (MFA)' })}
          </Checkbox>
        </Form.Item>

        <SpaceWrapper full className='indent'>
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
                <Typography.Text className='greyText'>
                  {item}
                </Typography.Text>
              </List.Item>
            )}
          />
          {!isMspEc && <Card
            title={$t({ defaultMessage: 'Recovery Codes' })}
            type='no-border'
          >
            <Typography.Text className='darkGreyText'>
              {$t(MessageMapping.enable_mfa_copy_codes_help_1)}
            </Typography.Text>
            <Typography.Text className='darkGreyText'>
              {$t(MessageMapping.enable_mfa_copy_codes_help_2)}
            </Typography.Text>
            <TextArea
              rows={5}
              maxLength={64}
              value={recoveryCodes?.join('\n')}
            />
            <SpaceWrapper full justifycontent='flex-end'>
              <Typography.Link onClick={handleClickCopyCodes}>
                {$t({ defaultMessage: 'Copy Codes' })}
              </Typography.Link>
            </SpaceWrapper>
          </Card>}
        </SpaceWrapper>
      </Col>
    </Row>
  )
})`${UI.styles}`

export { MFAFormItem }
