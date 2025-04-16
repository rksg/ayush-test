import { ReactNode, useEffect } from 'react'

import { Form, Radio, RadioProps, Row, Space, Switch, Tooltip, Typography } from 'antd'
import { isNil }                                                            from 'lodash'
import { useIntl }                                                          from 'react-intl'

import { cssStr }   from '@acx-ui/components'
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

interface SdLanRadioOptionProps {
  tunnelTypeInitVal: NetworkTunnelTypeEnum
  currentTunnelType: NetworkTunnelTypeEnum
  networkId: string
  networkVenueId: string
  networkType: NetworkTypeEnum
  venueSdLan: EdgeMvSdLanViewData | undefined
  networkVlanPool?: VLANPoolViewModelType
  disabledInfo?: {
    isDisabled: boolean
    tooltip: string | undefined
  }
}

export const EdgeSdLanRadioOption = (props: SdLanRadioOptionProps) => {
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

  return <Row>
    <Form.Item
      help={<UI.RadioSubTitle>
        <Form.Item noStyle dependencies={['sdLan', 'isGuestTunnelEnabled']}>
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
      <Tooltip title={disabledInfo?.tooltip}>
        <EdgeSdLanRadioButton
          // eslint-disable-next-line max-len
          disabled={disabledInfo?.isDisabled || !isVenueSdLanExist}
          sdlanName={sdlanName}
        />
      </Tooltip>
    </Form.Item>
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
}

const EdgeSdLanRadioButton = (props: RadioProps & {
  disabled: boolean,
  sdlanName?: ReactNode | string
}) => {
  const { $t } = useIntl()
  const { disabled, sdlanName, ...otherProps } = props

  return <Radio
    value={NetworkTunnelTypeEnum.SdLan}
    disabled={disabled}
    {...otherProps}
  >
    {$t({ defaultMessage: 'SD-LAN Tunneling{info}' }, {
      info: (sdlanName ? $t({ defaultMessage: '({sdlanName})' }, { sdlanName }) : sdlanName)
    })}
  </Radio>
}