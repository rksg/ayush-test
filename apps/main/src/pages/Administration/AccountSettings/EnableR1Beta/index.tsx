import { useState } from 'react'

import { Col, Form, Row, Typography, Checkbox, Tooltip } from 'antd'
import { useIntl }                                       from 'react-intl'
// import { useParams }                                     from 'react-router-dom'

import { Loader }       from '@acx-ui/components'
import { SpaceWrapper } from '@acx-ui/rc/components'

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
  // const params = useParams()
  const { className } = props
  const isUpdating = false
  const isDisabled = isUpdating
  const [showBetaTermsConditionDrawer, setBetaTermsConditionDrawer] = useState(false)
  const [showShowBetaFeaturesDrawer, setShowBetaFeaturesDrawer] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  const openR1BetaTermsConditionDrawer = () => {
    setBetaTermsConditionDrawer(true)
  }

  const handleEnableR1BetaChange = async (e: CheckboxChangeEvent) => {
    // console.log('isChecked::::111', isChecked, e.target.checked)

    setIsChecked(e.target.checked)
    openR1BetaTermsConditionDrawer()
    // console.log('isChecked::::', isChecked, e.target.checked)

    // const triggerAction = isChecked ? enableBetaR1Support : disableBetaR1Support
    //
    // try {
    //   await triggerAction({ params }).unwrap()
    // } catch (error) {
    //   console.log(error) // eslint-disable-line no-console
    // }
  }

  const openBetaFeaturesDrawer = () => {
    // console.log('opened beta features')
    setShowBetaFeaturesDrawer(true)
  }

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
                checked={isChecked}
                value={isChecked}
                // disabled={isDisabled}
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
