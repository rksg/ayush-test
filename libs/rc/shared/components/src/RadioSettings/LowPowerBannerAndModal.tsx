/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable max-len */
import { useState, useEffect } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'
import styled       from 'styled-components/macro'

import { Button, Alert }                       from '@acx-ui/components'
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

      switch(afcInfo?.afcStatus) {
        case AFCStatus.WAIT_FOR_LOCATION:
          messageList.push($t({ defaultMessage: '(AFC Geo-Location not set)' }))
          break
        case AFCStatus.REJECTED:
          messageList.push($t({ defaultMessage: '(Rejected by FCC DB due to no available channels)' }))
          break
        case AFCStatus.WAIT_FOR_RESPONSE:
          messageList.push($t({ defaultMessage: '(Wait for AFC server response)' }))
          break
        case AFCStatus.PASSED:
          messageList.push($t({ defaultMessage: '(AP is working on LPI channel)' }))
          break
        case AFCStatus.AFC_SERVER_FAILURE:
          messageList.push($t({ defaultMessage: '(AFC Server failure)' }))
          break
        default:
          messageList.push($t({ defaultMessage: '(6 GHz radio has been turned off.)' }))
          break
      }

      modalMessage = messageList.join(' ')

    }

    setBannerText(modalMessage)
  }, [afcInfo])

  return <Row
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
              data-testid='how-to-fix-this-button'>
              <span style={{
                marginLeft: '50px',
                fontSize: '12px'
              }}>
                <a href='https://docs.cloud.ruckuswireless.com/ruckusone/userguide/GUID-C1324048-5F2A-436C-A8BE-9B94BCB5CF14.html'
                  target='_blank'
                  rel='noreferrer'>
                  {$t({ defaultMessage: 'More information' })}
                </a>
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
}
