/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable max-len */
import { useState, useEffect } from 'react'

import { Col, Row, Modal } from 'antd'
import { useIntl }         from 'react-intl'
import styled              from 'styled-components/macro'

import { Button, cssStr, Alert }               from '@acx-ui/components'
import { Android, Apple }                      from '@acx-ui/icons'
import { AFCStatus, AFCInfo }                  from '@acx-ui/rc/utils'
import { useNavigate, useLocation, useParams } from '@acx-ui/react-router-dom'

import { usePathBasedOnConfigTemplate } from '../configTemplates'

const StyledAlert = styled(Alert)`
  line-height: 20px;
`


export function LowPowerBannerAndModal (props: {
    afcInfo?: AFCInfo
    from: string
}) {

  const { afcInfo, from } = props

  const { $t } = useIntl()
  const { venueId } = useParams()

  const [displayLowPowerModeModal, setDisplayLowPowerModeModal] = useState(false)
  const [bannerText, setBannerText] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const detailsPath = usePathBasedOnConfigTemplate(`/venues/${venueId}/edit/wifi/radio/Normal6GHz`)

  useEffect(()=> {

    let modalMessage = ''

    if (from === 'venue') {
      modalMessage = $t({ defaultMessage: 'AFC in the 6 GHz band requires a <venueSingular></venueSingular> height to be set for standard power operation.' })
    }
    else {
      // when from 'AP'
      const messageList: string[] = []

      messageList.push($t({ defaultMessage: '6 GHz radio operating in Low Power Indoor Mode.' }))

      if (afcInfo?.afcStatus === AFCStatus.WAIT_FOR_LOCATION) {
        messageList.push($t({ defaultMessage: '(Geo Location not set)' }))
      }
      if (afcInfo?.afcStatus === AFCStatus.REJECTED) {
        messageList.push($t({ defaultMessage: '(No channels available)' }))
      }
      if (afcInfo?.afcStatus === AFCStatus.WAIT_FOR_RESPONSE) {
        messageList.push($t({ defaultMessage: '(Pending response from the AFC server)' }))
      }
      if (afcInfo?.afcStatus === AFCStatus.PASSED) {
        messageList.push($t({ defaultMessage: '(AP is working on LPI channel)' }))
      }
      if (afcInfo?.afcStatus === AFCStatus.AFC_SERVER_FAILURE) {
        messageList.push($t({ defaultMessage: '(AFC Server failure)' }))
      }

      modalMessage = messageList.join(' ')

    }

    setBannerText(modalMessage)
  }, [])

  return (<>
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
      <Col span={24}>
        <StyledAlert showIcon={true}
          style={{ verticalAlign: 'middle' }}
          message={<>
            {bannerText}
            { from === 'ap' ?
              <Button type='link'
                data-testid='how-to-fix-this-button'
                onClick={() => {
                  setDisplayLowPowerModeModal(true)
                }}>
                <span style={{
                  marginLeft: '50px',
                  fontSize: '12px'
                }}>
                  {$t({ defaultMessage: 'More information' })}
                </span>
              </Button>
              :
              <Button type='link'
                data-testid='set-it-up-button'
                onClick={() => {
                  navigate(detailsPath, {
                    state: {
                      from: location
                    }
                  })
                }}>
                <span style={{
                  marginLeft: '50px',
                  fontSize: '12px'
                }}>
                  {$t({ defaultMessage: 'Set it up now' })}
                </span>
              </Button>}
          </>} />
      </Col>
    </Row>
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
