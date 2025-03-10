import { useEffect, useState } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import { useIntl }                                       from 'react-intl'

import { BetaIndicator, Loader, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { SpaceWrapper }                           from '@acx-ui/rc/components'
import {
  useUserProfileContext,
  useToggleBetaStatusMutation,
  hasCrossVenuesPermission,
  getUserProfile,
  hasAllowedOperations,
  UserRbacUrlsInfo
} from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { MessageMapping } from '../MessageMapping'

import { R1FeatureListDrawer } from './R1FeatureListDrawer'
import * as UI                 from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

/* eslint-disable-next-line */
export interface EnableR1BetaFeaturesProps {
  className?: string;
  betaStatus?: boolean;
  isPrimeAdminUser: boolean;
}

function EnableR1BetaFeatures (props: EnableR1BetaFeaturesProps) {
  const { $t } = useIntl()
  const { betaEnabled } = useUserProfileContext()
  const { rbacOpsApiEnabled } = getUserProfile()
  const { className, betaStatus } = props
  const [showFeatureListDrawer, setFeatureListDrawer] = useState(false)
  const [checked, setChecked] = useState(betaEnabled)
  const [toggleBetaStatus, { isLoading: isUpdating }] = useToggleBetaStatusMutation()
  const hasPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([getOpsApi(UserRbacUrlsInfo.toggleBetaStatus)])
    : hasCrossVenuesPermission()
  const isDisabled = !hasPermission || isUpdating
  const isPtenantRbacApiEnabled = useIsSplitOn(Features.PTENANT_RBAC_API)

  const openR1FeatureListDrawer = () => {
    setFeatureListDrawer(true)
  }

  const handleEnableR1BetaFeaturesChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked

    if (!isChecked) {
      showActionModal({
        type: 'confirm',
        width: 460,
        title: $t({ defaultMessage: 'Disable Early Access Features?' }),
        content: $t(MessageMapping.enable_r1_early_access_disable_description,
          { br1: <br/>, br2: <br/> }),
        okText: $t({ defaultMessage: 'Yes, Disable' }),
        cancelText: $t({ defaultMessage: 'No, Keep' }),
        onOk: async () => {
          try {
            await toggleBetaStatus({ params: { enable: isChecked + '' },
              payload: { enabled: isChecked }, enableRbac: isPtenantRbacApiEnabled
            }).unwrap()
            setChecked(isChecked)
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
          setFeatureListDrawer(false)
        }
      })
    }
    else openR1FeatureListDrawer()
  }

  const isBetaEnabled = betaStatus

  useEffect(() => {
    setChecked(isBetaEnabled)
  }, [isBetaEnabled])


  return <Loader>
    <Row gutter={24} className={className}>
      <Col span={24}>
        <Form.Item>
          <UI.IconCheckboxWrapper full justifycontent='flex-start'>
            <Tooltip
              title={isUpdating ?
                $t({ defaultMessage: 'Updating, please wait' }) :
                isDisabled ? $t({ defaultMessage: 'You are not allowed to change this' }) : ''}
            >
              <Checkbox
                onChange={handleEnableR1BetaFeaturesChange}
                checked={checked}
                disabled={isDisabled}
              >
                <Row>
                  <BetaIndicator size='sm' />
                  {$t({ defaultMessage: 'Enable RUCKUS One Early Access features' })}
                </Row>
              </Checkbox>
            </Tooltip>

            {checked && <Typography.Link role='link'
              onClick={openR1FeatureListDrawer}
              disabled={!hasAllowedOperations([getOpsApi(UserRbacUrlsInfo.toggleBetaStatus)])}>
              {$t({ defaultMessage: 'Manage' })}
            </Typography.Link>}
          </UI.IconCheckboxWrapper>
        </Form.Item>

        <SpaceWrapper full className='indent' justifycontent='flex-start'>
          <Typography.Paragraph className='greyText'>
            {$t(MessageMapping.enable_r1_early_access_description, { br: <br/> })}
          </Typography.Paragraph>
        </SpaceWrapper>
      </Col>
    </Row>
    {
      <R1FeatureListDrawer
        visible={showFeatureListDrawer}
        setVisible={() => setFeatureListDrawer(false)}
        editMode={checked}
      />
    }
  </Loader>
}

export { EnableR1BetaFeatures }
