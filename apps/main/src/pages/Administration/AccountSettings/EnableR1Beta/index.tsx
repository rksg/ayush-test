import { useEffect, useState } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import { useIntl }                                       from 'react-intl'
import { useParams }                                     from 'react-router-dom'

import { Loader, showActionModal }                                        from '@acx-ui/components'
import { SpaceWrapper }                                                   from '@acx-ui/rc/components'
import { BetaStatus, useGetBetaStatusQuery, useToggleBetaStatusMutation } from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

import BetaFeaturesDrawer         from './BetaFeaturesDrawer'
import R1BetaTermsConditionDrawer from './R1BetaTermsConditionDrawer'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

/* eslint-disable-next-line */
export interface EnableR1BetaProps {
  className?: string;
  betaStatusData?: BetaStatus;
  isPrimeAdminUser: boolean;
}

export function EnableR1Beta (props: EnableR1BetaProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { data: betaStatus } = useGetBetaStatusQuery({ params })
  const { className, betaStatusData } = props
  const [showBetaTermsConditionDrawer, setBetaTermsConditionDrawer] = useState(false)
  const [showShowBetaFeaturesDrawer, setShowBetaFeaturesDrawer] = useState(false)
  const [checked, setChecked] = useState(betaStatus?.enabled === 'true'?? false)
  const [toggleBetaStatus, { isLoading: isUpdating }] = useToggleBetaStatusMutation()
  const isDisabled = isUpdating

  const openR1BetaTermsConditionDrawer = () => {
    setBetaTermsConditionDrawer(true)
  }

  const handleEnableR1BetaChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    const modalMsg = $t(MessageMapping.enable_r1_beta_disable_description)

    if (!isChecked) {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'Disable Beta Features?' }),
        content: modalMsg,
        okText: $t({ defaultMessage: 'Disable Beta Features' }),
        cancelText: $t({ defaultMessage: 'Keep Beta Features' }),
        onOk: async () => {
          try {
            await toggleBetaStatus({
              params: {
                enable: isChecked + ''
              }
            }).unwrap()
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
          window.location.reload()
        }
      })
    } else openR1BetaTermsConditionDrawer()
  }

  const openBetaFeaturesDrawer = () => {
    setShowBetaFeaturesDrawer(true)
  }
  const isBetaEnabled = betaStatusData?.enabled === 'true'?? false

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
                {$t({ defaultMessage: 'Enable RUCKUS One Beta features' })}
              </Checkbox>
            </Tooltip>

            <Typography.Link role='link' onClick={openBetaFeaturesDrawer}>
              {$t({ defaultMessage: 'Current beta features' })}
            </Typography.Link>
          </SpaceWrapper>
        </Form.Item>

        <SpaceWrapper full className='descriptionsWrapper' justifycontent='flex-start'>
          <Typography.Paragraph className='description greyText'>
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

    {
      <BetaFeaturesDrawer
        visible={showShowBetaFeaturesDrawer}
        setVisible={() => setShowBetaFeaturesDrawer(false)}
        onClose={() => setShowBetaFeaturesDrawer(false)}
      />
    }
  </Loader>
}

export default EnableR1Beta
