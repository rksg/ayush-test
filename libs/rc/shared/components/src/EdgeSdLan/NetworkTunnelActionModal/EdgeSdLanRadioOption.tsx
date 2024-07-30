import { Form, Radio, Row, Space, Switch, Typography } from 'antd'
import { useIntl }                                     from 'react-intl'

import { EdgeMvSdLanViewData, NetworkTypeEnum, ServiceOperation, ServiceType, getServiceDetailsLink, useHelpPageLink } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                  from '@acx-ui/react-router-dom'

import * as UI                   from './styledComponents'
import { NetworkTunnelTypeEnum } from './types'

interface SdLanRadioOptionProps {
  currentTunnelType: NetworkTunnelTypeEnum
  networkId: string
  networkVenueId: string
  networkType: NetworkTypeEnum
  venueSdLan: EdgeMvSdLanViewData | undefined
}

export const EdgeSdLanRadioOption = (props: SdLanRadioOptionProps) => {
  const { currentTunnelType, networkType, venueSdLan } = props
  const { $t } = useIntl()
  const helpUrl = useHelpPageLink()

  const sdLanTunneled = currentTunnelType === NetworkTunnelTypeEnum.SdLan
  const isVenueSdLanExist = !!venueSdLan
  const isGuestTunnelEnabled = venueSdLan?.isGuestTunnelEnabled

  // TODO: popup confirm dialog: ACX-58399
  // const otherGuestTunnel = venueSdLan?.tunneledGuestWlans?.find(wlan =>
  //   wlan.networkId === networkId)
  // eslint-disable-next-line max-len
  // const isOtherGuestTunnelEnabled = venueSdLan?.isGuestTunnelEnabled && Boolean(otherGuestTunnel)

  const linkToSdLanDetail = venueSdLan?.id ? getServiceDetailsLink({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.DETAIL,
    serviceId: venueSdLan?.id
  }) : undefined

  const sdlanName = (isVenueSdLanExist && linkToSdLanDetail)
    ? <TenantLink to={linkToSdLanDetail}>{venueSdLan?.name}</TenantLink>
    : ''
  // eslint-disable-next-line max-len
  const showFwdGuestSwitch = isGuestTunnelEnabled && networkType === NetworkTypeEnum.CAPTIVEPORTAL && sdLanTunneled

  return <Row>
    <Form.Item
      help={<UI.RadioSubTitle>
        <Form.Item dependencies={['sdLan', 'isGuestTunnelEnabled']}>
          {({ getFieldValue }) => {
            const isFormGuestTunnelEnabled = getFieldValue(['sdLan', 'isGuestTunnelEnabled'])

            return <Typography.Text style={{ color: 'inherit' }}>
              {
                isVenueSdLanExist
                  // eslint-disable-next-line max-len
                  ? $t({ defaultMessage: 'Tunnel the traffic to a central location, the destination cluster: {clusterName}' },
                    { clusterName: <b>
                      {isFormGuestTunnelEnabled
                        ? venueSdLan?.guestEdgeClusterName
                        : venueSdLan?.edgeClusterName}
                    </b>
                    })
                  // eslint-disable-next-line max-len
                  : $t({ defaultMessage: 'Tunnel the traffic to a central location. {infoLink}' }, {
                    infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
                      {$t({ defaultMessage: 'See more information' })}
                    </a>
                  })
              }
            </Typography.Text>
          }}
        </Form.Item>
      </UI.RadioSubTitle>}
    >
      <Radio value={NetworkTunnelTypeEnum.SdLan} disabled={!isVenueSdLanExist}>
        {$t({ defaultMessage: 'SD-LAN Tunneling{info}' }, {
          info: (sdlanName ? $t({ defaultMessage: '({sdlanName})' }, { sdlanName }) : sdlanName)
        })}
      </Radio>
    </Form.Item>
    <UI.SwitchContainer>
      <Space size={10}>
        {showFwdGuestSwitch &&
        <>
          <Form.Item name={['sdLan', 'isGuestTunnelEnabled']} valuePropName='checked' noStyle>
            <Switch />
          </Form.Item>
          <Typography.Text style={{ fontSize: 14 }}>
            {$t({ defaultMessage: 'Forward guest traffic to DMZ' })}
          </Typography.Text>
        </>
        }
      </Space>
    </UI.SwitchContainer>
  </Row>
}