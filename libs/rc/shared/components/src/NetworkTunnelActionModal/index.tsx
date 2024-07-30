import { useEffect, useState } from 'react'

import { Form, Radio, Space, Typography } from 'antd'
import { cloneDeep, findIndex }           from 'lodash'

import { Modal }                                                                                  from '@acx-ui/components'
import { Features }                                                                               from '@acx-ui/feature-toggle'
import {  EdgeMvSdLanViewData, EdgeSdLanTunneledWlan, NetworkTypeEnum, NetworkTunnelSdLanAction } from '@acx-ui/rc/utils'
import { getIntl }                                                                                from '@acx-ui/utils'

import { isGuestTunnelUtilized } from '../EdgeSdLan/edgeSdLanUtils'
import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { EdgeSdLanRadioOption }                                                          from './EdgeSdLanRadioOption'
import { NetworkTunnelInfoButton }                                                       from './NetworkTunnelInfoButton'
import * as UI                                                                           from './styledComponents'
import { NetworkTunnelTypeEnum, NetworkTunnelActionModalProps, NetworkTunnelActionForm } from './types'
import { useEdgeMvSdlanData }                                                            from './useEdgeMvSdlanData'
import { getNetworkTunnelType }                                                          from './utils'

// eslint-disable-next-line max-len
export const mergeSdLanCacheAct = (venueSdLanInfo: EdgeMvSdLanViewData, cachedActs: NetworkTunnelSdLanAction[]): EdgeMvSdLanViewData => {
  const updatedSdLan = cloneDeep(venueSdLanInfo)

  try {
    cachedActs.forEach((actInfo) => {
      // eslint-disable-next-line max-len
      const idx = findIndex(updatedSdLan.tunneledWlans, { venueId: actInfo.venueId, networkId: actInfo.networkId })
      // eslint-disable-next-line max-len
      const guestIdx = findIndex(updatedSdLan.tunneledGuestWlans, { venueId: actInfo.venueId, networkId: actInfo.networkId })

      if (actInfo.enabled) {
        if (idx === -1) {
          updatedSdLan.tunneledWlans!.push({
            venueId: actInfo.venueId,
            networkId: actInfo.networkId
          } as EdgeSdLanTunneledWlan)
        }

        if (actInfo.guestEnabled) {
          if (guestIdx === -1) {
            updatedSdLan.tunneledGuestWlans!.push({
              venueId: actInfo.venueId,
              networkId: actInfo.networkId
            } as EdgeSdLanTunneledWlan)
          }
        } else {
          if (guestIdx !== -1) {
            updatedSdLan.tunneledGuestWlans!.splice(guestIdx, 1)
          }
        }
      } else {
        updatedSdLan.tunneledWlans!.splice(idx, 1)
        updatedSdLan.tunneledGuestWlans!.splice(guestIdx, 1)
      }
    })

  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
  return updatedSdLan
}

const NetworkTunnelActionModal = (props: NetworkTunnelActionModalProps) => {
  const { $t } = getIntl()
  const { visible, network, onClose, onFinish, cachedActs } = props
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [form] = Form.useForm()
  const tunnelType = Form.useWatch(['tunnelType'], form)

  // eslint-disable-next-line max-len
  const { getVenueSdLan } = useEdgeMvSdlanData({ 'tunneledWlans.venueId': [network?.venueId!] }, !network)

  const networkId = network?.id
  const networkType = network?.type
  const networkVenueId = network?.venueId
  const networkVenueName = network?.venueName

  let venueSdLanInfo = networkVenueId ? getVenueSdLan(networkVenueId) : undefined
  if (venueSdLanInfo && cachedActs)
    venueSdLanInfo = mergeSdLanCacheAct(venueSdLanInfo, cachedActs)

  const tunnelTypeInitVal = getNetworkTunnelType(network, venueSdLanInfo)

  const handleApply = async () => {
    if (!networkVenueId)  return
    const formValues = form.getFieldsValue(true) as NetworkTunnelActionForm

    setIsSubmitting(true)
    await onFinish(formValues, { venueSdLan: venueSdLanInfo })
    setIsSubmitting(false)
    onClose()
  }

  useEffect(() => {
    if (visible) {
      form.setFieldValue('tunnelType', tunnelTypeInitVal)
    }
  }, [visible, tunnelTypeInitVal])
  //

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line max-len
      const isGuestTunnelUtilizedInitState = isGuestTunnelUtilized(venueSdLanInfo, networkId, networkVenueId)

      form.setFieldValue(['sdLan', 'isGuestTunnelEnabled'], isGuestTunnelUtilizedInitState)
    }
  }, [visible, venueSdLanInfo, networkId, networkVenueId])

  useEffect(() => {
    // only update when tunnelType has changed
    if (tunnelType === NetworkTunnelTypeEnum.SdLan && tunnelType !== tunnelTypeInitVal
        && networkType === NetworkTypeEnum.CAPTIVEPORTAL) {

      // eslint-disable-next-line max-len
      form.setFieldValue(['sdLan', 'isGuestTunnelEnabled'], Boolean(venueSdLanInfo?.isGuestTunnelEnabled))
    }
  }, [tunnelType, venueSdLanInfo, tunnelTypeInitVal, networkType])

  return <Modal
    visible={visible}
    title={$t({ defaultMessage: 'Tunnel' })}
    okText={$t({ defaultMessage: 'Apply' })}
    okButtonProps={{ disabled: isSubmitting || !venueSdLanInfo }}
    maskClosable={false}
    keyboard={false}
    width={600}
    onOk={() => form.submit()}
    onCancel={onClose}
  >
    <Form form={form} onFinish={handleApply}>
      <Typography style={{ marginBottom: '20px' }}>
        {
        // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Define how this network traffic will be tunnelled at <venueSingular></venueSingular> "{venueName}":' }, {
            venueName: <b> {networkVenueName} </b>
          })
        }
      </Typography>
      <Form.Item name='tunnelType'>
        <Radio.Group>
          <Space direction='vertical'>
            {/* default option - local breakout */}
            <Form.Item
              help={<UI.RadioSubTitle>
                {
                // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'All network traffic will local breakout on this <venueSingular></venueSingular>' })
                }
              </UI.RadioSubTitle>}
            >
              <Radio value={NetworkTunnelTypeEnum.None}>
                {$t({ defaultMessage: 'Local Breakout' })}
              </Radio>
            </Form.Item>

            {network && visible && isEdgeSdLanMvEnabled &&
              <EdgeSdLanRadioOption
                currentTunnelType={tunnelType}
                networkId={networkId!}
                networkVenueId={networkVenueId!}
                networkType={networkType!}
                venueSdLan={venueSdLanInfo}
              />
            }
          </Space>
        </Radio.Group>
      </Form.Item>
    </Form>
  </Modal>
}

export {
  NetworkTunnelTypeEnum,
  type NetworkTunnelActionModalProps,
  NetworkTunnelInfoButton,
  NetworkTunnelActionModal
}