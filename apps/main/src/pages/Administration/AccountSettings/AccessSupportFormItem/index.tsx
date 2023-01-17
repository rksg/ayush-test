import { useState, useCallback, useEffect } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
// import moment                                            from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

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
  // const [expiryDate, setExpiryDate] = useState('')
  const [createdDate, setCreatedDate] = useState('')
  // const [countDown, setCountDown] = useState('')

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

  // const updateExpirationDate = useCallback((responseExpiryDate: string | undefined) => {
  //   if (responseExpiryDate) {
  //     const newExpiryDate = formatter('dateTimeFormat')(responseExpiryDate)
  //     setExpiryDate(newExpiryDate)

  //     const endDate = moment(responseExpiryDate)
  //     const firstDay = moment()
  //     const dayDifference = Math.round(endDate.diff(firstDay, 'days', true))
  //     const hourDifference = Math.round(endDate.diff(firstDay, 'hours', true))
  //     const minutesDifference = Math.round(endDate.diff(firstDay, 'minutes', true))

  //     if (dayDifference > 1 || hourDifference >= 24) {
  //       setCountDown(dayDifference + (dayDifference === 1 ? ' day' : ' days'))
  //     } else if (hourDifference > 1 || minutesDifference >= 60) {
  //       // less than a day
  //       setCountDown(hourDifference + (hourDifference === 1 ? ' hour' : ' hours'))
  //     } else if (minutesDifference > 0) {
  //       // less than an hour
  //       setCountDown('less than 1 hour')
  //     } else {
  //       try {
  //         disableAccessSupport({ params: { tenantId: params.tenantId } })
  //       } catch {
  //         showToast({
  //           type: 'error',
  //           content: $t({ defaultMessage: 'An error occurred' })
  //         })
  //       }
  //     }
  //   }
  // }, [$t, disableAccessSupport, params])

  const updateCreatedDate = useCallback((responseCreatedDate: string | undefined) => {
    if (responseCreatedDate) {
      const newCreatedDate = formatter('dateTimeFormat')(responseCreatedDate)
      setCreatedDate(newCreatedDate)
    }
  }, [])

  const handleAccessSupportChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    try {
      isChecked ?
        await enableAccessSupport({ params: { tenantId: params.tenantId } }) :
        await disableAccessSupport({ params: { tenantId: params.tenantId } })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  useEffect(() => {
    // updateExpirationDate(ecTenantDelegationData?.expiryDate || tenantDelegationData?.expiryDate)
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
              <Typography.Paragraph className='grantedOnText'>
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
})`
  input[type=checkbox] {
    padding-right: 5px;
  }

  .grantedOnText {
    color: var(--acx-neutrals-70);
    font-weight: bold;
    font-size: var(--acx-body-4-font-size);
    margin: 0;
  }
`

export { AccessSupportFormItem }