import { useEffect, useState } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import { useIntl }                                       from 'react-intl'
import { useParams }                                     from 'react-router-dom'


import { Loader, showActionModal }                            from '@acx-ui/components'
import { SpaceWrapper }                                       from '@acx-ui/rc/components'
import { useGetBetaStatusQuery, useToggleBetaStatusMutation } from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

import BetaFeaturesDrawer         from './BetaFeaturesDrawer'
import R1BetaTermsConditionDrawer from './R1BetaTermsConditionDrawer'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

/* eslint-disable-next-line */
export interface EnableR1BetaProps {
  className?: string;
}

export function EnableR1Beta (props: EnableR1BetaProps) {
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const { data: betaStatus } = useGetBetaStatusQuery({ params })
  const { className } = props
  const [showBetaTermsConditionDrawer, setBetaTermsConditionDrawer] = useState(false)
  const [showShowBetaFeaturesDrawer, setShowBetaFeaturesDrawer] = useState(false)
  const [toggleBetaStatus, { isLoading: isUpdating }] = useToggleBetaStatusMutation()
  const isDisabled = isUpdating
  // const betaToggle = Form.useWatch('betaToggle', form)

  const openR1BetaTermsConditionDrawer = () => {
    setBetaTermsConditionDrawer(true)
  }

  const handleEnableR1BetaChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked

    if (!isChecked) {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'Disable Beta Features?' }),
        content:
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Please note that if you decide to disable beta features, your current configurations will be retained. However, you won\'t be able to modify them until you re-enable beta features' }),
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
        }
      })
    } else openR1BetaTermsConditionDrawer()
  }

  const openBetaFeaturesDrawer = () => {
    setShowBetaFeaturesDrawer(true)
  }
  let isBetaEnabled = betaStatus?.enabled === 'true'?? false
  useEffect(() => {
    if (betaStatus) {
      isBetaEnabled = Boolean(betaStatus?.enabled)?? false
    }

    form.setFieldsValue({
      ...betaStatus,
      betaToggle: isBetaEnabled
    })

  }, [betaStatus, isBetaEnabled])

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
                checked={isBetaEnabled}
                value={isBetaEnabled}
                disabled={isDisabled}
              >
                {$t({ defaultMessage: 'Enable R1 Beta features' })}
              </Checkbox>
            </Tooltip>

            <Typography.Link onClick={openBetaFeaturesDrawer}>
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
