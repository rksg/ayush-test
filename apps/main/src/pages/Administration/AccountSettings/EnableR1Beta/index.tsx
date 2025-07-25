import { useEffect, useState } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import { useIntl }                                       from 'react-intl'

import { Loader, showActionModal, SpaceWrapper } from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import {
  useUserProfileContext,
  useToggleBetaStatusMutation,
  hasCrossVenuesPermission
} from '@acx-ui/user'
import { userLogout } from '@acx-ui/utils'

import { MessageMapping } from '../MessageMapping'

import { BetaFeaturesDrawer }         from './BetaFeaturesDrawer'
import { R1BetaTermsConditionDrawer } from './R1BetaTermsConditionDrawer'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

/* eslint-disable-next-line */
export interface EnableR1BetaProps {
  className?: string;
  betaStatus?: boolean;
  isPrimeAdminUser: boolean;
}

function EnableR1Beta (props: EnableR1BetaProps) {
  const { $t } = useIntl()
  const { betaEnabled } = useUserProfileContext()
  const { className, betaStatus } = props
  const [showBetaTermsConditionDrawer, setBetaTermsConditionDrawer] = useState(false)
  const [showShowBetaFeaturesDrawer, setShowBetaFeaturesDrawer] = useState(false)
  const [checked, setChecked] = useState(betaEnabled)
  const [toggleBetaStatus, { isLoading: isUpdating }] = useToggleBetaStatusMutation()
  const isDisabled = !hasCrossVenuesPermission() || isUpdating
  const isPtenantRbacApiEnabled = useIsSplitOn(Features.PTENANT_RBAC_API)

  const openR1BetaTermsConditionDrawer = () => {
    setBetaTermsConditionDrawer(true)
  }

  const handleEnableR1BetaChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked

    if (!isChecked) {
      showActionModal({
        type: 'confirm',
        width: 460,
        title: $t({ defaultMessage: 'Disable Early Access Features?' }),
        content: $t(MessageMapping.enable_r1_beta_disable_description, { br1: <br/>, br2: <br/> }),
        okText: $t({ defaultMessage: 'Disable Early Access Features' }),
        cancelText: $t({ defaultMessage: 'Keep Early Access Features' }),
        onOk: async () => {
          try {
            await toggleBetaStatus({ params: { enable: isChecked + '' },
              payload: { enabled: isChecked }, enableRbac: isPtenantRbacApiEnabled
            }).unwrap()
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
          userLogout()
        }
      })
    } else openR1BetaTermsConditionDrawer()
  }

  const openBetaFeaturesDrawer = () => {
    setShowBetaFeaturesDrawer(true)
  }
  const isBetaEnabled = betaStatus

  useEffect(() => {
    setChecked(isBetaEnabled)
  }, [isBetaEnabled])


  return <Loader>
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
                onChange={handleEnableR1BetaChange}
                checked={checked}
                disabled={isDisabled}
              >
                {$t({ defaultMessage: 'Enable RUCKUS One Early Access features' })}
              </Checkbox>
            </Tooltip>

            <Typography.Link role='link' onClick={openBetaFeaturesDrawer}>
              {$t({ defaultMessage: 'Current Early Access features' })}
            </Typography.Link>
          </SpaceWrapper>
        </Form.Item>

        <SpaceWrapper full className='indent' justifycontent='flex-start'>
          <Typography.Paragraph className='greyText'>
            {$t(MessageMapping.enable_r1_beta_access_description, { br: <br/> })}
          </Typography.Paragraph>
        </SpaceWrapper>
      </Col>
    </Row>
    {
      <R1BetaTermsConditionDrawer
        visible={showBetaTermsConditionDrawer}
        setVisible={() => setBetaTermsConditionDrawer(false)}
        onClose={() => setBetaTermsConditionDrawer(false)}
        onSubmit={() => setBetaTermsConditionDrawer(false)}
      />
    }

    { showShowBetaFeaturesDrawer &&
      <BetaFeaturesDrawer
        visible={showShowBetaFeaturesDrawer}
        setVisible={() => setShowBetaFeaturesDrawer(false)}
        onClose={() => setShowBetaFeaturesDrawer(false)}
        width={500}
      />
    }
  </Loader>
}

export { EnableR1Beta }
