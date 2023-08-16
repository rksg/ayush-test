import { useEffect, useRef } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import moment                                            from 'moment-timezone'
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
      await triggerAction({ params }).unwrap()
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

  const isSupportUser = Boolean(userProfileData?.support)
  const isDisabled = isSupportUser || isUpdating

  const supportInfo = isMspDelegatedEC ? ecTenantDelegationData : tenantDelegationData
  const { createdDate, expiryDate, expiryDateString, isAccessSupported } = supportInfo
  const isSupportAccessEnabled = Boolean(isAccessSupported)

  useEffect(() => {
    if (expiryDate && !isUpdating && !isRevokeExpired.current) {
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
  }, [expiryDate, isUpdating])

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

        <SpaceWrapper full className='descriptionsWrapper' justifycontent='flex-start'>
          <Typography.Paragraph className='description greyText'>
            {$t(MessageMapping.enable_access_support_description, { br: <br/> })}
          </Typography.Paragraph>
        </SpaceWrapper>
      </Col>
    </Row>
  )
})`${UI.styles}`

export { AccessSupportFormItem }
