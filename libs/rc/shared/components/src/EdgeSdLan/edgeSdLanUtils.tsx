import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Switch, Typography } from 'antd'
import { transform }                                                from 'lodash'

import { Modal }                                                                                                                                                                           from '@acx-ui/components'
import { Features }                                                                                                                                                                        from '@acx-ui/feature-toggle'
import { EdgeMvSdLanExtended, EdgeMvSdLanFormModel, EdgeMvSdLanNetworks, EdgeMvSdLanViewData, EdgeSdLanViewDataP2, ServiceOperation, ServiceType, getServiceDetailsLink, useHelpPageLink } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                                                                      from '@acx-ui/react-router-dom'
import { getIntl }                                                                                                                                                                         from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { useEdgeMvSdLanActions } from './useEdgeSdLanActions'

export const useGetNetworkTunnelInfo = () => {
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)

  return (networkId: string, sdLanInfo?: EdgeSdLanViewDataP2) => {
    const { $t } = getIntl()
    const isTunneled = !!sdLanInfo
    if (!isTunneled) return $t({ defaultMessage: 'Local Breakout' })

    let clusterName
    if(!isEdgeSdLanHaReady) {
      clusterName = <TenantLink to={`/devices/edge/${sdLanInfo.edgeId}/details/overview`}>
        {sdLanInfo.edgeName}
      </TenantLink>
    } else {
      const isDmzEnabled = sdLanInfo.isGuestTunnelEnabled
      const isTunnelDmz = isDmzEnabled && sdLanInfo.guestNetworkIds?.includes(networkId)
      const targetClusterId = isTunnelDmz
        ? sdLanInfo.guestEdgeClusterId
        : sdLanInfo.edgeClusterId

      const linkToDetail = `devices/edge/cluster/${targetClusterId}/edit/cluster-details`

      clusterName = <TenantLink to={linkToDetail}>
        {isTunnelDmz ? sdLanInfo.guestEdgeClusterName : sdLanInfo.edgeClusterName}
      </TenantLink>
    }

    return $t({ defaultMessage: 'Tunneled ({clusterName})' },
      { clusterName })
  }
}

export interface NetworkMvTunnelModalProps {
  visible: boolean
  onClose: () => void
  networkId?: string
  networkVenueName?: string
  sdLanInfo?: EdgeMvSdLanViewData
}

export const NetworkMvTunnelModal = (props: NetworkMvTunnelModalProps) => {
  const { visible, onClose, networkId, networkVenueName, sdLanInfo } = props
  const { $t } = getIntl()
  const isTunneledInitSate = !!sdLanInfo
  const isGuestTunnelEnabledInitSate = !!sdLanInfo?.isGuestTunnelEnabled
  && Boolean(sdLanInfo?.tunneledGuestWlans?.find(wlan => wlan.networkId === networkId))

  const [tunneled, setTunneled] = useState<boolean>(false)
  const [tunnelGuest, setTunnelGuest] = useState<boolean>(false)
  const { toggleNetwork } = useEdgeMvSdLanActions()
  const helpUrl = useHelpPageLink()

  const clusterName = tunnelGuest ? sdLanInfo?.guestEdgeClusterName : sdLanInfo?.edgeClusterName

  const handleRadioChange = (e: RadioChangeEvent) => {
    setTunneled(e.target.value)
  }
  const handleApply = async () => {
    // send API request
    // console.log('[Apply] tunnelGuest?', tunnelGuest, ', local breakout?', !tunneled)
    const venueId = sdLanInfo?.tunneledWlans?.find(wlan => wlan.networkId === networkId)?.venueId

    if (!venueId) return

    if (tunneled !== isTunneledInitSate) {
      // activate/deactivate network
      await toggleNetwork(
          sdLanInfo.id!,
          venueId,
          tunneled ? tunnelGuest : false,
          networkId!,
          tunneled
      )
    } else {
      // check if tunnel guest changed
      if (isTunneledInitSate && isGuestTunnelEnabledInitSate !== tunnelGuest) {
        await toggleNetwork(
          sdLanInfo.id!,
          venueId,
          tunnelGuest,
          networkId!,
          isTunneledInitSate
        )
      }
    }

    onClose()
  }

  const onGuestEnabledChange = (checked: boolean) => {
    setTunnelGuest(checked)
  }

  const linkToSdLanDetail = sdLanInfo?.id ? getServiceDetailsLink({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.DETAIL,
    serviceId: sdLanInfo?.id
  }) : undefined

  const sdlanName = (isTunneledInitSate && linkToSdLanDetail)
    ? <TenantLink to={linkToSdLanDetail}>{sdLanInfo?.name}</TenantLink>
    : ''

  useEffect(() => {
    const isGuestTunnelEnabledInitSate = !!sdLanInfo?.isGuestTunnelEnabled
    && Boolean(sdLanInfo?.tunneledGuestWlans?.find(wlan => wlan.networkId === networkId))
    setTunneled(!!sdLanInfo)
    setTunnelGuest(isGuestTunnelEnabledInitSate)
  }, [networkId, sdLanInfo])

  return <Modal
    visible={visible}
    title={$t({ defaultMessage: 'Tunnel' })}
    okText={$t({ defaultMessage: 'Apply' })}
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
            { $t({ defaultMessage: 'All network traffic will local breakout on this venue' }) }
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
                  isTunneledInitSate
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
                {tunneled && isGuestTunnelEnabledInitSate &&
               <>
                 <Switch
                   checked={tunnelGuest}
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
          <Radio value={true} disabled={!isTunneledInitSate}>
            {$t({ defaultMessage: 'SD-LAN Tunneling{info}' }, {
              info: (sdlanName ? $t({ defaultMessage: '({sdlanName})' }, { sdlanName }) : sdlanName)
            })}
          </Radio>
        </Form.Item>
      </Space>
    </Radio.Group>
  </Modal>
}

export const edgeSdLanFormRequestPreProcess = (formData: EdgeMvSdLanFormModel) => {
  const payload = {
    name: formData.name,
    venueId: formData.venueId,
    edgeClusterId: formData.edgeClusterId,
    networks: transform(formData.activatedNetworks, (result, value, key) => {
      result[key] = value.map(v => v.id)
    }, {} as EdgeMvSdLanNetworks),
    tunnelProfileId: formData.tunnelProfileId,
    isGuestTunnelEnabled: formData.isGuestTunnelEnabled
  } as EdgeMvSdLanExtended

  if (formData.isGuestTunnelEnabled) {
    payload.guestEdgeClusterId = formData.guestEdgeClusterId
    payload.guestEdgeClusterVenueId = formData.guestEdgeClusterVenueId
    payload.guestTunnelProfileId = formData.guestTunnelProfileId
    payload.guestNetworks = transform(formData.activatedGuestNetworks, (result, value, key) => {
      result[key] = value.map(v => v.id)
    }, {} as EdgeMvSdLanNetworks)
  }

  return payload
}