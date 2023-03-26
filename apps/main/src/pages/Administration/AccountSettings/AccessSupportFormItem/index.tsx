import { useState, useCallback, useEffect } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import { useIntl }                                       from 'react-intl'
import { useParams }                                     from 'react-router-dom'
import styled                                            from 'styled-components/macro'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { SpaceWrapper }              from '@acx-ui/rc/components'
import {
  useEnableAccessSupportMutation,
  useDisableAccessSupportMutation,
  useGetEcTenantDelegationQuery,
  useGetTenantDelegationQuery
}                                    from '@acx-ui/rc/services'
import { useUserProfileContext } from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

interface AccessSupportFormItemProps {
  className?: string;
  hasMSPEcLabel: boolean;
  canMSPDelegation: boolean;
}

const AccessSupportFormItem = styled((props: AccessSupportFormItemProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: userProfileData } = useUserProfileContext()
  const {
    className,
    hasMSPEcLabel,
    canMSPDelegation
  } = props
  const [isSupportAccessEnabled, setIsSupportAccessEnabled] = useState(false)
  const [createdDate, setCreatedDate] = useState('')

  const [ enableAccessSupport,
    { isLoading: isEnableAccessSupportUpdating }]
    = useEnableAccessSupportMutation()
  const [disableAccessSupport,
    { isLoading: isDisableAccessSupportUpdating }]
    = useDisableAccessSupportMutation()

  const isMspDelegatedEC = hasMSPEcLabel && userProfileData?.varTenantId
                              && canMSPDelegation === false

  const {
    data: ecTenantDelegationData,
    isLoading: isLoadingEcTenantDelegation,
    isFetching: isFetchingEcTenantDelegation
  } = useGetEcTenantDelegationQuery({ params }, { skip: !isMspDelegatedEC })
  const {
    data: tenantDelegationData,
    isLoading: isLoadingTenantDelegation,
    isFetching: isFetchingTenantDelegation
  }= useGetTenantDelegationQuery({ params }, { skip: !!isMspDelegatedEC })

  const updateCreatedDate = useCallback((responseCreatedDate: string | undefined) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (responseCreatedDate) {
      const newCreatedDate = formatter(
        DateFormatEnum.DateTimeFormatWithTimezone)(responseCreatedDate, timezone)
      setCreatedDate(newCreatedDate.replace(/\+\d\d:\d\d/, '').replace('UTC UTC', 'UTC'))
    }
  }, [])

  const handleAccessSupportChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    const triggerAction = isChecked ? enableAccessSupport : disableAccessSupport

    try {
      await triggerAction({ params }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
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
                {$t({ defaultMessage: 'Enable access to Ruckus Support' })}
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
