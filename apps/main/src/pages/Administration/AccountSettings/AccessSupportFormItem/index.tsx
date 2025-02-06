import { useEffect, useRef } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import moment                                            from 'moment-timezone'
import { useIntl }                                       from 'react-intl'
import { useParams }                                     from 'react-router-dom'
import styled                                            from 'styled-components/macro'

import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { SpaceWrapper }              from '@acx-ui/rc/components'
import {
  useEnableAccessSupportMutation,
  useDisableAccessSupportMutation,
  useGetEcTenantDelegationQuery,
  useGetTenantDelegationQuery
}                                    from '@acx-ui/rc/services'
import { AdminRbacUrlsInfo }                                              from '@acx-ui/rc/utils'
import { hasCrossVenuesPermission, hasPermission, useUserProfileContext } from '@acx-ui/user'
import { getOpsApi }                                                      from '@acx-ui/utils'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

interface AccessSupportFormItemProps {
  className?: string;
  hasMSPEcLabel: boolean;
  canMSPDelegation: boolean;
}

const getDisplayDateString = (data: string | undefined) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  if (data) {
    const newCreatedDate = formatter(
      DateFormatEnum.DateTimeFormatWithTimezone)(data, timezone)
    return newCreatedDate.replace(/\+\d\d:\d\d/, '').replace('UTC UTC', 'UTC')
  }

  return data
}

const AccessSupportFormItem = styled((props: AccessSupportFormItemProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: userProfileData } = useUserProfileContext()
  const { className, hasMSPEcLabel, canMSPDelegation } = props
  const isPtenantRbacApiEnabled = useIsSplitOn(Features.PTENANT_RBAC_API)
  const isRevokeExpired = useRef<boolean>(false)
  const isMspDelegatedEC = hasMSPEcLabel && userProfileData?.varTenantId
                              && canMSPDelegation === false


  const [ enableAccessSupport,
    { isLoading: isEnableAccessSupportUpdating }]
    = useEnableAccessSupportMutation()
  const [disableAccessSupport,
    { isLoading: isDisableAccessSupportUpdating }]
    = useDisableAccessSupportMutation()

  const {
    data: ecTenantDelegationData,
    isLoading: isLoadingEcTenantDelegation,
    isFetching: isFetchingEcTenantDelegation
  } = useGetEcTenantDelegationQuery({ params }, {
    skip: !isMspDelegatedEC,
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        ...data,
        createdDate: getDisplayDateString(data?.createdDate),
        expiryDateString: formatter(DateFormatEnum.DateFormat)(data?.expiryDate)
      },
      ...rest
    })
  })
  const {
    data: tenantDelegationData,
    isLoading: isLoadingTenantDelegation,
    isFetching: isFetchingTenantDelegation
  } = useGetTenantDelegationQuery({ params }, {
    skip: !!isMspDelegatedEC,
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        ...data,
        createdDate: getDisplayDateString(data?.createdDate),
        expiryDateString: formatter(DateFormatEnum.DateFormat)(data?.expiryDate)
      },
      ...rest
    })
  })

  const handleAccessSupportChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    const triggerAction = isChecked ? enableAccessSupport : disableAccessSupport

    try {
      await triggerAction({ params, enableRbac: isPtenantRbacApiEnabled }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isUpdating = isLoadingEcTenantDelegation
  || isLoadingTenantDelegation
  || isFetchingEcTenantDelegation
  || isFetchingTenantDelegation
  || isEnableAccessSupportUpdating
  || isDisableAccessSupportUpdating

  const isRksSupportAllowed = hasPermission({
    rbacOpsIds: [getOpsApi(AdminRbacUrlsInfo.enableAccessSupport)]
  })
  const isSupportUser = Boolean(userProfileData?.support)
  // eslint-disable-next-line max-len
  const isDisabled = !hasCrossVenuesPermission() || isSupportUser || !isRksSupportAllowed || isUpdating

  const supportInfo = isMspDelegatedEC ? ecTenantDelegationData : tenantDelegationData
  const { createdDate, expiryDate, expiryDateString, isAccessSupported } = supportInfo
  const isSupportAccessEnabled = Boolean(isAccessSupported)

  useEffect(() => {
    if (isRksSupportAllowed && expiryDate && !isUpdating && !isRevokeExpired.current) {
      const remainingDuration = moment.duration(
        moment(expiryDate).diff(moment.now()))
      const remainingSecs = remainingDuration.asSeconds()

      if (remainingSecs < 60) {
        // revoke will only be triggered once.
        isRevokeExpired.current = true

        disableAccessSupport({ params })
          .unwrap()
          .catch(err => {
            console.log(err) // eslint-disable-line no-console
          })
      }
    }
  }, [expiryDate, isUpdating, isRksSupportAllowed])

  return (
    <Row gutter={24} className={className}>
      <Col span={24}>
        <Form.Item>
          <SpaceWrapper full justifycontent='flex-start'>
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
                  $t({ defaultMessage: '- Administrator-level access was granted on {createdDate}. Expires on {expiryDateString}.' },
                    { createdDate, expiryDateString })
                }
              </Typography.Paragraph>
            )}
          </SpaceWrapper>
        </Form.Item>

        <SpaceWrapper full className='indent' justifycontent='flex-start'>
          <Typography.Paragraph className='greyText'>
            {$t(MessageMapping.enable_access_support_description, { br: <br/> })}
          </Typography.Paragraph>
        </SpaceWrapper>
      </Col>
    </Row>
  )
})`${UI.styles}`

export { AccessSupportFormItem }
