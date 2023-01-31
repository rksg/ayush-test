import { useState, useCallback, useEffect } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import { useIntl }                                       from 'react-intl'
import { useParams }                                     from 'react-router-dom'
import styled                                            from 'styled-components/macro'

import { showToast }            from '@acx-ui/components'
import { SpaceWrapper }         from '@acx-ui/rc/components'
import {
  useEnableAccessSupportMutation,
  useDisableAccessSupportMutation,
  useGetEcTenantDelegationQuery,
  useGetTenantDelegationQuery
} from '@acx-ui/rc/services'
import { UserProfile } from '@acx-ui/rc/utils'
import { formatter }   from '@acx-ui/utils'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'


 interface AccessSupportFormItemProps {
  className?: string;
  userProfileData: UserProfile | undefined;
  isMspEc: boolean;
}

const AccessSupportFormItem = styled((props: AccessSupportFormItemProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { className, userProfileData, isMspEc } = props
  const [isSupportAccessEnabled, setIsSupportAccessEnabled] = useState(false)
  const [createdDate, setCreatedDate] = useState('')

  const [ enableAccessSupport,
    { isLoading: isEnableAccessSupportUpdating }]
    = useEnableAccessSupportMutation()
  const [disableAccessSupport,
    { isLoading: isDisableAccessSupportUpdating }]
    = useDisableAccessSupportMutation()

  const showMfa = userProfileData?.tenantId === userProfileData?.varTenantId

  let isMspDelegateEC = false
  if (userProfileData?.varTenantId && !showMfa) {
    isMspDelegateEC = isMspEc
  }

  const {
    data: ecTenantDelegationData,
    isLoading: isLoadingEcTenantDelegation,
    isFetching: isFetchingEcTenantDelegation
  } = useGetEcTenantDelegationQuery({ params }, { skip: !isMspDelegateEC })
  const {
    data: tenantDelegationData,
    isLoading: isLoadingTenantDelegation,
    isFetching: isFetchingTenantDelegation
  }= useGetTenantDelegationQuery({ params }, { skip: isMspDelegateEC })

  const updateCreatedDate = useCallback((responseCreatedDate: string | undefined) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (responseCreatedDate) {
      const newCreatedDate = formatter('dateTimeFormatWithTimezone')(responseCreatedDate, timezone)
      setCreatedDate(newCreatedDate.replace(/\+\d\d:\d\d/, '').replace('UTC UTC', 'UTC'))
    }
  }, [])

  const handleAccessSupportChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    const triggerAction = isChecked ? enableAccessSupport : disableAccessSupport

    try {
      await triggerAction({ params }).unwrap()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  useEffect(() => {
    updateCreatedDate(ecTenantDelegationData?.createdDate || tenantDelegationData?.createdDate)
    setIsSupportAccessEnabled(
      Boolean(ecTenantDelegationData?.isAccessSupported || tenantDelegationData?.isAccessSupported)
    )
  }, [ecTenantDelegationData, tenantDelegationData, updateCreatedDate])

  const isSupportUser = Boolean(userProfileData?.support)
  const isUpdating = isLoadingEcTenantDelegation
  || isLoadingTenantDelegation
  || isFetchingEcTenantDelegation
  || isFetchingTenantDelegation
  || isEnableAccessSupportUpdating
  || isDisableAccessSupportUpdating
  const isDisabled = isSupportUser || isUpdating

  return (
    <Row gutter={24} className={className}>
      <Col span={10}>
        <Form.Item>
          <SpaceWrapper justifycontent='flex-start'>
            <Tooltip
              title={isUpdating ?
                $t({ defaultMessage: 'Updating, please wait' }) :
                isDisabled ? $t({ defaultMessage: 'You are not allowed to change this' }) : ''}
            >
              <Checkbox
                onChange={handleAccessSupportChange}
                checked={isSupportAccessEnabled}
                value={isSupportAccessEnabled}
                disabled={isDisabled}
              >
                {$t({ defaultMessage: 'Enable access to Ruckus support' })}
              </Checkbox>
            </Tooltip>

            { isSupportAccessEnabled && (
              <Typography.Paragraph className='darkGreyText grantedOnText'>
                {
                // eslint-disable-next-line max-len
                  $t({ defaultMessage: '- Administrator-level access is granted on {createdDate}' }, { createdDate })
                }
              </Typography.Paragraph>
            )}
          </SpaceWrapper>
        </Form.Item>

        <SpaceWrapper className='descriptionsWrapper'>
          <Typography.Paragraph className='description greyText'>
            {$t(MessageMapping.enable_access_support_description)}
          </Typography.Paragraph>
        </SpaceWrapper>
      </Col>
    </Row>
  )
})`${UI.styles}`

export { AccessSupportFormItem }