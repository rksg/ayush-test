/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable max-len */
import { useState, useEffect } from 'react'

import { Col, Row, Modal } from 'antd'
import { useIntl }         from 'react-intl'

import { Button, cssStr }     from '@acx-ui/components'
import { Android, Apple }     from '@acx-ui/icons'
import { LowPowerAPQuantity } from '@acx-ui/rc/utils'

interface LowerPowerBannerSetting {
  bannerColSpan: number,
  colStyle: {
    backgroundColor: string,
    padding: string,
    color: string,
    lineHeight?: string
    paddingTop: string,
    paddingBottom: string
  },
  buttonStyle: {
    color?: string
  }
}

type settings = {
  [key: string] : LowerPowerBannerSetting
}

export function LowPowerBannerAndModal (props: {
    context?: string,
    parent: string,
    lowPowerAPs?: LowPowerAPQuantity
}) {

  const { lowPowerAPs, parent, context } = props


  const { $t } = useIntl()

  const lowPowerBannerSettings : settings = {
    venue: {
      bannerColSpan: 16,
      colStyle: {
        backgroundColor: cssStr('--acx-accents-orange-30'),
        padding: '5px',
        color: 'white',
        paddingTop: '10px',
        paddingBottom: '10px'
      },
      buttonStyle: { color: cssStr('--acx-accents-blue-20') }
    },
    ap: {
      bannerColSpan: 22,
      colStyle: {
        backgroundColor: '#FEF4DE',
        padding: '5px',
        color: 'black',
        lineHeight: '16px',
        paddingTop: '10px',
        paddingBottom: '10px'
      },
      buttonStyle: {}
    }
  }

  const [displayLowPowerModeModal, setDisplayLowPowerModeModal] = useState(false)
  const [bannerSettings, setBannerSettings] = useState(lowPowerBannerSettings['venue'])
  const [bannerText, setBannerText] = useState('')


  useEffect(()=> {
    setBannerSettings(lowPowerBannerSettings[parent])
    const VenueWarningMessage = `${lowPowerAPs?.lowPowerAPCount} ${$t({ defaultMessage: 'out of' })} ${lowPowerAPs?.allAPCount} \
    ${$t({ defaultMessage: 'Access points that support 6 GHz are currently operating in low power mode' })}`

    const APWarningMessage = $t({ defaultMessage: 'Degraded - AP in low power mode' })

    if(parent === 'venue') {
      setBannerText(VenueWarningMessage)
    } else {
      setBannerText(APWarningMessage)
    }
  }, [])

  const isRenderNeed = ![
    // This banner shouldn't appear in AP's single radio setting.
    (context === 'ap'),
    // No show when no low-power AP information or 0 low-power AP and under venue single radio setting
    ((!lowPowerAPs || lowPowerAPs?.lowPowerAPCount === 0) && parent === 'venue')
  ].some(Boolean)

  return (<>
    {isRenderNeed && <>
      <LowerPowerInstructionModal
        modelVisibility={displayLowPowerModeModal}
        modalOff={() => {setDisplayLowPowerModeModal(false)}}
      />
      <Row
        data-testid='low-power-banner'
        style={{
          marginTop: '10px',
          marginBottom: '10px'
        }}>
        <Col span={bannerSettings.bannerColSpan}
          style={bannerSettings.colStyle}>
          {bannerText}
        </Col>
        <Col span={2}
          style={bannerSettings.colStyle}>
          <Button type='link'
            data-testid='how-to-fix-this-button'
            onClick={() => {
              setDisplayLowPowerModeModal(true)
            }}>
            <span style={bannerSettings.buttonStyle}>
              {$t({ defaultMessage: 'How to fix this' })}
            </span>
          </Button>
        </Col>
      </Row>
    </>}
  </>)
}

function LowerPowerInstructionModal (props: {
  modelVisibility: boolean,
  modalOff: () => void
}) {

  const { modelVisibility, modalOff } = props

  const { $t } = useIntl()

  return (
    <Modal
      visible={modelVisibility}
      closable={false}
      data-testid='instruction-modal'
      footer={[
        <Button key='ok'
          type='primary'
          data-testid='ok-got-it-button'
          onClick={() => {
            modalOff()
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
        {
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
  )
}