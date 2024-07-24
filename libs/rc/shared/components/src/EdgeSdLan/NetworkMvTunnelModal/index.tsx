import { useContext, useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Switch, Typography } from 'antd'

import { Modal }                                                                                  from '@acx-ui/components'
import { NetworkTypeEnum, ServiceOperation, ServiceType, getServiceDetailsLink, useHelpPageLink } from '@acx-ui/rc/utils'
import { TenantLink }                                                                             from '@acx-ui/react-router-dom'
import { getIntl }                                                                                from '@acx-ui/utils'

import { useEdgeMvSdLanActions } from '../useEdgeSdLanActions'

import { EdgeMvSdLanContext } from './EdgeMvSdLanContextProvider'

export interface NetworkMvTunnelModalProps {
  visible: boolean
  onClose: () => void
  network?: {
    id: string,
    type: NetworkTypeEnum,
    venueId: string,
    venueName?: string,
  }
}

export const NetworkMvTunnelModal = (props: NetworkMvTunnelModalProps) => {
  const {
    visible, onClose,
    network
  } = props
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [tunneled, setTunneled] = useState<boolean>(false)
  const [tunnelGuest, setTunnelGuest] = useState<boolean>(false)
  const { toggleNetwork } = useEdgeMvSdLanActions()
  const helpUrl = useHelpPageLink()
  const { getVenueSdLan } = useContext(EdgeMvSdLanContext)
  const { $t } = getIntl()

  const networkId = network?.id
  const networkType = network?.type
  const networkVenueId = network?.venueId
  const networkVenueName = network?.venueName

  const venueSdLanInfo = networkVenueId ? getVenueSdLan(networkVenueId) : undefined
  const isVenueSdLanExist = !!venueSdLanInfo

  const isTunneledInitState = Boolean(venueSdLanInfo?.tunneledWlans?.find(wlan =>
    wlan.networkId === networkId && wlan.venueId === networkVenueId))

  const otherGuestTunnel = venueSdLanInfo?.tunneledGuestWlans?.find(wlan =>
    wlan.networkId === networkId)
  // eslint-disable-next-line max-len
  const isOtherGuestTunnelEnabled = venueSdLanInfo?.isGuestTunnelEnabled && Boolean(otherGuestTunnel)

  const isGuestTunnelEnabledInitState = !!venueSdLanInfo?.isGuestTunnelEnabled
    && Boolean(venueSdLanInfo?.tunneledGuestWlans?.find(wlan =>
      wlan.networkId === networkId && wlan.venueId === networkVenueId))

  const clusterName = tunnelGuest
    ? venueSdLanInfo?.guestEdgeClusterName
    : venueSdLanInfo?.edgeClusterName

  const handleRadioChange = (e: RadioChangeEvent) => {
    setTunneled(e.target.value)
  }

  const handleApply = async () => {
    // send API request
    const venueId = networkVenueId

    if (!venueId || !isVenueSdLanExist)  return

    if (tunneled !== isTunneledInitState) {
      setIsSubmitting(true)

      // activate/deactivate network
      await toggleNetwork(
        venueSdLanInfo.id!,
        venueId,
        tunneled ? tunnelGuest : false,
          networkId!,
          tunneled
      )
    } else {
      // check if tunnel guest changed
      if (isTunneledInitState && isGuestTunnelEnabledInitState !== tunnelGuest) {
        setIsSubmitting(true)

        await toggleNetwork(
          venueSdLanInfo.id!,
          venueId,
          tunnelGuest,
          networkId!,
          isTunneledInitState
        )
      }
    }

    setIsSubmitting(false)
    onClose()
  }

  const onGuestEnabledChange = (checked: boolean) => {
    setTunnelGuest(checked)
  }

  const linkToSdLanDetail = venueSdLanInfo?.id ? getServiceDetailsLink({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.DETAIL,
    serviceId: venueSdLanInfo?.id
  }) : undefined

  const sdlanName = (isVenueSdLanExist && linkToSdLanDetail)
    ? <TenantLink to={linkToSdLanDetail}>{venueSdLanInfo?.name}</TenantLink>
    : ''
  const showFwdGuestSwitch = networkType === NetworkTypeEnum.CAPTIVEPORTAL && tunneled
  // eslint-disable-next-line max-len
  const fwdGuestSwitchDisabled = isOtherGuestTunnelEnabled && otherGuestTunnel?.venueId !== networkVenueId

  useEffect(() => {
    if (visible) {
      setTunneled(isTunneledInitState)
      setTunnelGuest(isGuestTunnelEnabledInitState)
    }
  }, [visible, isTunneledInitState, isGuestTunnelEnabledInitState])


  useEffect(() => {
    if (visible && tunneled && tunneled !== isTunneledInitState) {
      // only set when tunneled has changed into true
      setTunnelGuest(Boolean(venueSdLanInfo?.isGuestTunnelEnabled))
    }
  }, [visible, tunneled, isTunneledInitState, venueSdLanInfo])

  return <Modal
    visible={visible}
    title={$t({ defaultMessage: 'Tunnel' })}
    okText={$t({ defaultMessage: 'Apply' })}
    okButtonProps={{ disabled: isSubmitting }}
    maskClosable={false}
    destroyOnClose
    keyboard={false}
    width={600}
    onOk={handleApply}
    onCancel={onClose}
  >
    <Typography style={{ marginBottom: '20px' }}>
      {
        // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Define how this network traffic will be tunnelled at <venueSingular></venueSingular> "{venueName}":' }, {
          venueName: networkVenueName
        })
      }
    </Typography>
    <Radio.Group value={tunneled} onChange={handleRadioChange}>
      <Space direction='vertical'>
        <Form.Item
          help={<div style={{ marginLeft: '20px' }}>
            {
            // eslint-disable-next-line max-len
              $t({ defaultMessage: 'All network traffic will local breakout on this <venueSingular></venueSingular>' })
            }
          </div>}
        >
          <Radio value={false}>
            {$t({ defaultMessage: 'Local Breakout' })}
          </Radio>
        </Form.Item>
        <Form.Item
          help={<div style={{ marginLeft: '20px' }}>
            <Space size={25} direction='vertical'>
              <Typography.Text style={{ color: 'inherit' }}>
                {
                  isVenueSdLanExist
                  // eslint-disable-next-line max-len
                    ? $t({ defaultMessage: 'Tunnel the traffic to a central location, the destination cluster: {clusterName}' },
                      { clusterName: <b>{clusterName}</b> })
                  // eslint-disable-next-line max-len
                    : $t({ defaultMessage: 'Tunnel the traffic to a central location. {infoLink}' }, {
                      infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
                        {$t({ defaultMessage: 'See more information' })}
                      </a>
                    })
                }
              </Typography.Text>
              <Space size={10} style={{ minHeight: '30px' }}>
                {showFwdGuestSwitch &&
               <>
                 <Switch
                   checked={tunnelGuest}
                   disabled={fwdGuestSwitchDisabled}
                   onChange={onGuestEnabledChange}
                 />
                 <Typography.Text style={{ fontSize: 14 }}>
                   {$t({ defaultMessage: 'Forward guest traffic to DMZ' })}
                 </Typography.Text>
               </>
                }
              </Space>
            </Space>
          </div>}
        >
          <Radio value={true} disabled={!isVenueSdLanExist}>
            {$t({ defaultMessage: 'SD-LAN Tunneling{info}' }, {
              info: (sdlanName ? $t({ defaultMessage: '({sdlanName})' }, { sdlanName }) : sdlanName)
            })}
          </Radio>
        </Form.Item>
      </Space>
    </Radio.Group>
  </Modal>
}