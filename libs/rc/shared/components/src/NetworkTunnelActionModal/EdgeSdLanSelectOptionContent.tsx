import { useEffect } from 'react'

import { Form, Row, Space, Switch, Typography } from 'antd'
import { useIntl }                              from 'react-intl'

import { cssStr }                                                                                                                           from '@acx-ui/components'
import { EdgeMvSdLanViewData, getServiceDetailsLink, getServiceRoutePath, NetworkTypeEnum, ServiceOperation, ServiceType, useHelpPageLink } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                       from '@acx-ui/react-router-dom'

import { isDmzTunnelUtilized } from '../EdgeSdLan/edgeSdLanUtils'

import * as UI                   from './styledComponents'
import { NetworkTunnelTypeEnum } from './types'

interface EdgeSdLanContentProps {
  venueSdLan: EdgeMvSdLanViewData | undefined
  networkType: NetworkTypeEnum
  currentTunnelType: NetworkTunnelTypeEnum
  networkId: string
  networkVenueId: string
  hasVlanPool: boolean
  tunnelTypeInitVal: NetworkTunnelTypeEnum
}

export const EdgeSdLanSelectOptionContent: React.FC<EdgeSdLanContentProps> = (props) => {
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const {
    networkId,
    networkVenueId,
    venueSdLan,
    networkType,
    currentTunnelType,
    hasVlanPool,
    tunnelTypeInitVal
  } = props

  const sdLanTunneled = currentTunnelType === NetworkTunnelTypeEnum.SdLan
  const isGuestTunnelEnabled = venueSdLan?.isGuestTunnelEnabled
  // eslint-disable-next-line max-len
  const showFwdGuestSwitch = isGuestTunnelEnabled && networkType === NetworkTypeEnum.CAPTIVEPORTAL && sdLanTunneled
  const isVenueSdLanExist = !!venueSdLan

  const addSdLanPageLink = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.CREATE
  })
  const helpUrl = useHelpPageLink(addSdLanPageLink)

  const linkToSdLanDetail = venueSdLan?.id ? getServiceDetailsLink({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.DETAIL,
    serviceId: venueSdLan?.id
  }) : undefined

  const sdlanName = (isVenueSdLanExist && linkToSdLanDetail)
    ? <TenantLink to={linkToSdLanDetail}>{venueSdLan?.name}</TenantLink>
    : ''

  useEffect(() => {
    // eslint-disable-next-line max-len
    const isDmzTunnelUtilizedInitState = isDmzTunnelUtilized(venueSdLan, networkId, networkVenueId)

    form.setFieldValue(['sdLan', 'isGuestTunnelEnabled'], isDmzTunnelUtilizedInitState)
  }, [venueSdLan, networkId, networkVenueId])

  useEffect(() => {
    // only update when tunnelType has changed
    if (currentTunnelType === NetworkTunnelTypeEnum.SdLan && currentTunnelType !== tunnelTypeInitVal
          && networkType === NetworkTypeEnum.CAPTIVEPORTAL && !hasVlanPool) {

      // eslint-disable-next-line max-len
      form.setFieldValue(['sdLan', 'isGuestTunnelEnabled'], Boolean(venueSdLan?.isGuestTunnelEnabled))
    }
  }, [currentTunnelType, venueSdLan, tunnelTypeInitVal, networkType])

  return <>
    <Row>
      <Form.Item noStyle dependencies={['sdLan', 'isGuestTunnelEnabled']}>
        {({ getFieldValue }) => {
          const isFormGuestTunnelEnabled = getFieldValue(['sdLan', 'isGuestTunnelEnabled'])

          return <Typography.Text style={{ color: 'inherit' }}>
            {
              isVenueSdLanExist
              // eslint-disable-next-line max-len
                ? <div className={'ant-form-item-label'}><label>{$t({ defaultMessage: 'Tunnel the traffic to a central location' })}</label><br /><br />
                  <label>{$t({ defaultMessage: 'Associated SD-LAN service: {sdLan}' }, {
                    sdLan: <b>{sdlanName}</b>
                  })}</label><br />
                  <label>{$t({ defaultMessage: 'Destination cluster: {clusterName}' }, {
                    clusterName: <b>
                      {isFormGuestTunnelEnabled
                        ? venueSdLan?.guestEdgeClusterName
                        : venueSdLan?.edgeClusterName}
                    </b>
                  })}</label>
                </div>
              // eslint-disable-next-line max-len
                : <div className={'ant-form-item-label'}><label>{$t({ defaultMessage: 'Tunnel the traffic to a central location. {infoLink}' }, {
                  infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
                    {$t({ defaultMessage: 'See more information' })}
                  </a>
                })}</label></div>
            }
          </Typography.Text>
        }}
      </Form.Item>
    </Row>
    <Row>
      <UI.SwitchContainer>
        <Space size={10} style={{ marginTop: cssStr('--acx-content-vertical-space') }}>
          {showFwdGuestSwitch &&
        <>
          <Form.Item name={['sdLan', 'isGuestTunnelEnabled']} valuePropName='checked' noStyle>
            <Switch disabled={hasVlanPool} />
          </Form.Item>
          <Typography.Text style={{ fontSize: 14 }}>
            {$t({ defaultMessage: 'Forward guest traffic to DMZ' })}
          </Typography.Text>
        </>
          }
        </Space>
      </UI.SwitchContainer>
    </Row>
  </>
}