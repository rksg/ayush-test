import { useEffect } from 'react'

import { Form, Row, Space, Switch, Typography } from 'antd'
import { isNil }                                from 'lodash'
import { useIntl }                              from 'react-intl'

import { cssStr }    from '@acx-ui/components'
import {
  EdgeMvSdLanViewData,
  NetworkTypeEnum,
  ServiceOperation,
  ServiceType,
  VLANPoolViewModelType,
  getServiceDetailsLink,
  getServiceRoutePath,
  useHelpPageLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { isGuestTunnelUtilized } from '../EdgeSdLan/edgeSdLanUtils'

import * as UI                   from './styledComponents'
import { NetworkTunnelTypeEnum } from './types'

interface SdLanSelectOptionProps {
  tunnelTypeInitVal: NetworkTunnelTypeEnum
  currentTunnelType: NetworkTunnelTypeEnum
  networkId: string
  networkVenueId: string
  networkType: NetworkTypeEnum
  venueSdLan: EdgeMvSdLanViewData | undefined
  networkVlanPool?: VLANPoolViewModelType
  disabledInfo?: {
    noChangePermission: boolean
    isDisabled: boolean
    tooltip: string | undefined
  }
}

export const EdgeSdLanSelectOption = (props: SdLanSelectOptionProps) => {
  const { $t } = useIntl()
  const addSdLanPageLink = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.CREATE
  })
  const helpUrl = useHelpPageLink(addSdLanPageLink)
  const form = Form.useFormInstance()

  const {
    networkId, networkVenueId, networkType,
    tunnelTypeInitVal, currentTunnelType,
    venueSdLan, networkVlanPool,
    disabledInfo
  } = props

  const sdLanTunneled = currentTunnelType === NetworkTunnelTypeEnum.SdLan
  const isVenueSdLanExist = !!venueSdLan
  const isGuestTunnelEnabled = venueSdLan?.isGuestTunnelEnabled

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
  const hasVlanPool = !isNil(networkVlanPool)

  useEffect(() => {
    // eslint-disable-next-line max-len
    const isGuestTunnelUtilizedInitState = isGuestTunnelUtilized(venueSdLan, networkId, networkVenueId)

    form.setFieldValue(['sdLan', 'isGuestTunnelEnabled'], isGuestTunnelUtilizedInitState)
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
    {(disabledInfo?.isDisabled || disabledInfo?.noChangePermission) && <div></div>}
    {!disabledInfo?.isDisabled && !disabledInfo?.noChangePermission && <>
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
  </>
}