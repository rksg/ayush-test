/* eslint-disable react/jsx-no-useless-fragment */
import { useState } from 'react'

import { Col, Row, Modal } from 'antd'
import { useIntl }         from 'react-intl'

import { Button, cssStr }     from '@acx-ui/components'
import { Android, Apple }     from '@acx-ui/icons'
import { LowPowerAPQuantity } from '@acx-ui/rc/utils'

export function LowerPowerBannerAndModal (props: {
    lowPowerAPs?: LowPowerAPQuantity
}) {

  const { lowPowerAPs } = props

  const { $t } = useIntl()

  const [displayLowPowerModeModal, setDisplayLowPowerModeModal] = useState(false)

  if(!lowPowerAPs) {
    return <></>
  }

  //   if(lowPowerAPs.lowPowerAPCount === 0) {
  //     return <></>
  //   }

  return (
    <>
      <Modal
        visible={displayLowPowerModeModal}
        closable={false}
        footer={[
          <Button key='ok'
            onClick={() => {
              setDisplayLowPowerModeModal(false)
            }}>
            {$t({ defaultMessage: 'OK, Got It' })}
          </Button>
        ]}
      >
        <Row style={{
          fontSize: cssStr('--acx-headline-3-font-size'),
          fontWeight: cssStr('--acx-headline-3-font-weight'),
          marginTop: '10px',
          marginBottom: '10px'
        }}>
          {$t({ defaultMessage: 'AP is running in Low Power Mode - How to fix this?' })}
        </Row>
        <Row>
          {$t({ defaultMessage: 'Open the RUCKUS mobile app' })}
        </Row>
        <Row style={{
          backgroundColor: 'lightgrey',
          fontSize: '12px',
          padding: '10px 10px 10px 10px'
        }}>
          <Col span={24}>
            {$t({ defaultMessage: 'If you don’t have the app, you can download it here:' })}
          </Col>
          <Col span={24}>
            <Apple/><Android/>
          </Col>
        </Row>
        <Row style={{
          marginTop: '20px'
        }}>
          { /* eslint-disable max-len */
            $t({ defaultMessage: 'Follow the instructions on screen and provide the geo location details as directed' })
          }
        </Row>
        <Row style={{
          marginTop: '20px'
        }}>
          {
            $t({ defaultMessage: 'Once the AP’s location has been established, it will start to operate in Full Power Mode and support the 6GHz radio band' })
          }
        </Row>
      </Modal>
      <Row style={{
        marginTop: '10px',
        marginBottom: '10px'
      }}>
        <Col span={16}
          style={{
            backgroundColor: cssStr('--acx-accents-orange-30'),
            padding: '5px',
            color: 'white' }}>
          {` ${lowPowerAPs?.lowPowerAPCount} `}
          {$t({ defaultMessage: 'out of' })}
          {` ${lowPowerAPs?.allAPCount} `}
          {$t({ defaultMessage: 'Access points that support 6 GHz are currently operating in low power mode' })}
        </Col>
        <Col span={2}
          style={{
            backgroundColor: cssStr('--acx-accents-orange-30'),
            padding: '5px',
            color: 'white' }}>
          <Button type='link'
            onClick={() => {
              setDisplayLowPowerModeModal(true)
            }}>
            <span style={{
              color: cssStr('--acx-accents-blue-20')
            }}>
              {$t({ defaultMessage: 'How to fix this' })}
            </span>
          </Button>
        </Col>
      </Row>
    </>
  )
}