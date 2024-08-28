import { useEffect, useState } from 'react'

import { Form, Radio, Space, Typography } from 'antd'

import { Modal }                                                           from '@acx-ui/components'
import { Features }                                                        from '@acx-ui/feature-toggle'
import {  EdgeMvSdLanViewData, NetworkTunnelSdLanAction, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { getIntl }                                                         from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { EdgeSdLanRadioOption }                                                   from './EdgeSdLanRadioOption'
import { NetworkTunnelInfoButton }                                                from './NetworkTunnelInfoButton'
import * as UI                                                                    from './styledComponents'
import { NetworkTunnelTypeEnum, NetworkTunnelActionForm }                         from './types'
import { useEdgeMvSdLanData }                                                     from './useEdgeMvSdLanData'
import { getNetworkTunnelType, mergeSdLanCacheAct, useUpdateNetworkTunnelAction } from './utils'
import WifiSoftGreRadioOption                                                     from './WifiSoftGreRadioOption'

export interface NetworkTunnelActionModalProps {
  visible: boolean
  network?: {
    id: string,
    type: NetworkTypeEnum,
    venueId: string,
    venueName?: string,
  }
  onClose: () => void
  onFinish: (
    values: NetworkTunnelActionForm,
    otherData: {
      network: NetworkTunnelActionModalProps['network'],
      venueSdLan?: EdgeMvSdLanViewData
    }
  ) => Promise<void>
  cachedActs?: NetworkTunnelSdLanAction[]
}

const NetworkTunnelActionModal = (props: NetworkTunnelActionModalProps) => {
  const { $t } = getIntl()
  const { visible, network, onClose, onFinish, cachedActs } = props
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [form] = Form.useForm()
  const tunnelType = Form.useWatch(['tunnelType'], form)

  const networkId = network?.id
  const networkType = network?.type
  const networkVenueId = network?.venueId
  const networkVenueName = network?.venueName
  const { getVenueSdLan, networkVlanPool } = useEdgeMvSdLanData({
    sdLanQueryOptions: {
      filters: { 'tunneledWlans.venueId': [networkVenueId!] },
      skip: !network
    },
    networkId: networkId
  })

  let venueSdLanInfo = networkVenueId ? getVenueSdLan(networkVenueId) : undefined
  if (venueSdLanInfo && cachedActs)
    venueSdLanInfo = mergeSdLanCacheAct(venueSdLanInfo, cachedActs)

  const tunnelTypeInitVal = getNetworkTunnelType(network, venueSdLanInfo)

  const handleApply = async () => {
    if (!networkVenueId)  return
    const formValues = form.getFieldsValue(true) as NetworkTunnelActionForm

    setIsSubmitting(true)
    await onFinish(formValues, { network, venueSdLan: venueSdLanInfo })
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (visible) {
      form.setFieldValue('tunnelType', tunnelTypeInitVal)
    }
  }, [visible, tunnelTypeInitVal])

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
            venueName: <b>{networkVenueName}</b>
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
                tunnelTypeInitVal={tunnelTypeInitVal}
                currentTunnelType={tunnelType}
                networkId={networkId!}
                networkVenueId={networkVenueId!}
                networkType={networkType!}
                venueSdLan={venueSdLanInfo}
                networkVlanPool={networkVlanPool}
              />
            }
            <WifiSoftGreRadioOption
              currentTunnelType={tunnelType}
              venueId={networkVenueId!}
              networkId={networkId}
            />
          </Space>
        </Radio.Group>
      </Form.Item>
    </Form>
  </Modal>
}

export {
  NetworkTunnelTypeEnum,
  type NetworkTunnelActionForm,
  NetworkTunnelInfoButton,
  NetworkTunnelActionModal,
  useUpdateNetworkTunnelAction
}