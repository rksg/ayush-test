import { useEffect, useState } from 'react'

import { Form, Radio, Space, Typography } from 'antd'

import { Modal }                                from '@acx-ui/components'
import { Features }                             from '@acx-ui/feature-toggle'
import { EdgeMvSdLanViewData, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { getIntl }                              from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'
import { useEdgeMvSdLanActions } from '../useEdgeSdLanActions'

import { EdgeSdLanRadioOption } from './EdgeSdLanRadioOption'
import * as UI                  from './styledComponents'
import { useEdgeMvSdlanData }   from './useEdgeMvSdlanData'

export enum NetworkTunnelTypeEnum {
  None = 'None',
  SdLan = 'SdLan',
  SoftGre = 'SoftGre'
}

const getTunnelType = (
  network: NetworkTunnelActionModalProps['network'],
  venueSdLanInfo?: EdgeMvSdLanViewData) => {
  const isSdLanTunneled = Boolean(venueSdLanInfo?.tunneledWlans?.find(wlan =>
    wlan.networkId === network?.id && wlan.venueId === network?.venueId))

  return isSdLanTunneled ? NetworkTunnelTypeEnum.SdLan : NetworkTunnelTypeEnum.None
}

export interface NetworkTunnelActionModalProps {
  visible: boolean
  onClose: () => void
  network?: {
    id: string,
    type: NetworkTypeEnum,
    venueId: string,
    venueName?: string,
  }
}

export const NetworkTunnelActionModal = (props: NetworkTunnelActionModalProps) => {
  const { $t } = getIntl()
  const { visible, onClose, network } = props
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [form] = Form.useForm()
  const tunnelType = Form.useWatch(['tunnelType'], form)

  const { toggleNetwork } = useEdgeMvSdLanActions()
  // eslint-disable-next-line max-len
  const { getVenueSdLan } = useEdgeMvSdlanData({ 'tunneledWlans.venueId': [network?.venueId!] }, !network)

  const networkId = network?.id
  const networkType = network?.type
  const networkVenueId = network?.venueId
  const networkVenueName = network?.venueName

  const venueSdLanInfo = networkVenueId ? getVenueSdLan(networkVenueId) : undefined
  const tunnelTypeInitVal = getTunnelType(network, venueSdLanInfo)

  const handleApply = async () => {
    const formValues = form.getFieldsValue(true)

    const venueId = networkVenueId
    if (!venueId)  return

    const formTunnelType = formValues.tunnelType
    const sdLanTunneled = formTunnelType === NetworkTunnelTypeEnum.SdLan
    const sdLanTunnelGuest = formValues.sdLan?.isGuestTunnelEnabled

    // activate/deactivate SDLAN tunneling
    if (tunnelType !== tunnelTypeInitVal) {
      setIsSubmitting(true)

      // activate/deactivate network
      await toggleNetwork(
        venueSdLanInfo?.id!,
        venueId,
        sdLanTunneled ? sdLanTunnelGuest : false,
        networkId!,
        sdLanTunneled
      )
    } else {
      // tunnelType still SDLAN
      if (tunnelTypeInitVal === NetworkTunnelTypeEnum.SdLan) {
        const isGuestTunnelEnabledInitState = !!venueSdLanInfo?.isGuestTunnelEnabled
        && Boolean(venueSdLanInfo?.tunneledGuestWlans?.find(wlan =>
          wlan.networkId === networkId && wlan.venueId === networkVenueId))

        // check if tunnel guest changed
        if(isGuestTunnelEnabledInitState !== sdLanTunnelGuest) {
          setIsSubmitting(true)

          await toggleNetwork(
              venueSdLanInfo?.id!,
              venueId,
              sdLanTunnelGuest,
              networkId!,
              sdLanTunneled
          )
        }
      }
    }

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
      const isGuestTunnelEnabledInitState = !!venueSdLanInfo?.isGuestTunnelEnabled
        && Boolean(venueSdLanInfo?.tunneledGuestWlans?.find(wlan =>
          wlan.networkId === networkId && wlan.venueId === networkVenueId))

      form.setFieldValue('sdLan', {
        isGuestTunnelEnabled: isGuestTunnelEnabledInitState
      })
    }
  }, [visible, venueSdLanInfo, networkId, networkVenueId])

  useEffect(() => {
    // only set when tunneled has changed into true
    if (tunnelType === NetworkTunnelTypeEnum.SdLan && tunnelType !== tunnelTypeInitVal
        && networkType === NetworkTypeEnum.CAPTIVEPORTAL) {
      form.setFieldValue('sdLan', {
        isGuestTunnelEnabled: Boolean(venueSdLanInfo?.isGuestTunnelEnabled)
      })
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