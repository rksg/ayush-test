import { useEffect, useState } from 'react'

import { Form, Radio, Space, Typography, Tooltip } from 'antd'

import { Modal }                  from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeMvSdLanViewData,
  NetworkTunnelSdLanAction,
  NetworkTypeEnum,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  hasPolicyPermission,
  hasServicePermission } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import { getIntl }    from '@acx-ui/utils'

import { SpaceWrapper }          from '../SpaceWrapper'
import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { EdgeSdLanRadioOption }                           from './EdgeSdLanRadioOption'
import * as UI                                            from './styledComponents'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum } from './types'
import { SoftGreNetworkTunnel }                           from './useSoftGreTunnelActions'
import { useTunnelInfos }                                 from './utils'
import WifiSoftGreRadioOption                             from './WifiSoftGreRadioOption'

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
      tunnelTypeInitVal: NetworkTunnelTypeEnum,
      network: NetworkTunnelActionModalProps['network'],
      venueSdLan?: EdgeMvSdLanViewData
    }
  ) => Promise<void>
  cachedActs?: NetworkTunnelSdLanAction[]
  cachedSoftGre?: SoftGreNetworkTunnel[]
  disableAll?: boolean
  radioOptTooltip?: string
}

export const NetworkTunnelActionModal = (props: NetworkTunnelActionModalProps) => {
  const { $t } = getIntl()
  const { visible, network, onClose, onFinish, cachedActs, cachedSoftGre=[] } = props
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isEdgePinHaEnabled = useIsSplitOn(Features.EDGE_PIN_HA_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const hasChangePermission = usePermissionResult()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isValidData, setIsValidData] = useState<boolean>(true)

  const [form] = Form.useForm()
  const tunnelType = Form.useWatch(['tunnelType'], form)
  const softGreProfileId = Form.useWatch(['softGre', 'newProfileId'], form)

  const networkId = network?.id
  const networkType = network?.type
  const networkVenueId = network?.venueId
  const networkVenueName = network?.venueName
  const hiddenSoftGre = NetworkTypeEnum.CAPTIVEPORTAL === networkType
  const hiddenPin = NetworkTypeEnum.DPSK !== networkType

  const {
    tunnelType: tunnelTypeInitVal,
    venueSdLanInfo,
    networkVlanPool,
    venuePinInfo
  } = useTunnelInfos({ network, cachedActs, cachedSoftGre })

  const handleApply = async () => {
    if (!networkVenueId)  return
    const formValues = form.getFieldsValue(true) as NetworkTunnelActionForm

    setIsSubmitting(true)
    await onFinish(formValues, { tunnelTypeInitVal, network, venueSdLan: venueSdLanInfo })
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (visible) {
      form.setFieldValue('tunnelType', tunnelTypeInitVal)
    }
  }, [visible, tunnelTypeInitVal])

  useEffect(() => {
    if (visible) {
      switch(tunnelType) {
        case NetworkTunnelTypeEnum.SdLan:
          setIsValidData(isEdgeSdLanMvEnabled && !!venueSdLanInfo)
          return
        case NetworkTunnelTypeEnum.SoftGre:
          setIsValidData(!!softGreProfileId)
          return
        case NetworkTunnelTypeEnum.Pin:
          setIsValidData(false)
          return
        default:
          // change into local breakout
          setIsValidData(!isEdgePinHaEnabled)
      }
    }

  // eslint-disable-next-line max-len
  }, [visible, tunnelType, isSoftGreEnabled, isEdgeSdLanMvEnabled, isEdgePinHaEnabled, venueSdLanInfo, softGreProfileId])

  const isDisabledAll = getIsDisabledAll(venueSdLanInfo, networkId)
  const noChangePermission = !hasChangePermission

  const localBreakoutRadio = (<Radio
    value={NetworkTunnelTypeEnum.None}
    disabled={isDisabledAll || noChangePermission}>
    {$t({ defaultMessage: 'Local Breakout' })}
  </Radio>)

  return <Modal
    visible={visible}
    title={$t({ defaultMessage: 'Tunnel' })}
    okText={$t({ defaultMessage: 'Apply' })}
    okButtonProps={{ disabled: noChangePermission || isSubmitting || !isValidData }}
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
            {!isEdgePinHaEnabled &&
            <Form.Item
              extra={<UI.RadioSubTitle>
                {
                // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'All network traffic will local breakout on this <venueSingular></venueSingular>' })
                }
              </UI.RadioSubTitle>}
            >
              <Tooltip title={isDisabledAll
                // eslint-disable-next-line max-len
                ? $t({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' })
                : undefined}>
                {localBreakoutRadio}
              </Tooltip>
            </Form.Item>
            }

            {isSoftGreEnabled && !hiddenSoftGre && visible &&
              <WifiSoftGreRadioOption
                currentTunnelType={tunnelType}
                venueId={networkVenueId!}
                networkId={networkId!}
                cachedSoftGre={cachedSoftGre}
                disabledInfo={(isDisabledAll || noChangePermission)
                  ? {
                    isDisabled: isDisabledAll,
                    noChangePermission,
                    // eslint-disable-next-line max-len
                    tooltip: isDisabledAll ? $t({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' }) : undefined
                  }
                  : undefined}
              />
            }

            {network && visible && isEdgeSdLanMvEnabled && !venuePinInfo &&
              <EdgeSdLanRadioOption
                tunnelTypeInitVal={tunnelTypeInitVal}
                currentTunnelType={tunnelType}
                networkId={networkId!}
                networkVenueId={networkVenueId!}
                networkType={networkType!}
                venueSdLan={venueSdLanInfo}
                networkVlanPool={networkVlanPool}
                disabledInfo={(isDisabledAll || noChangePermission)
                  ? {
                    isDisabled: isDisabledAll,
                    noChangePermission,
                    // eslint-disable-next-line max-len
                    tooltip: isDisabledAll ? $t({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' }) : undefined
                  }
                  : undefined}
              />
            }
          </Space>
        </Radio.Group>
      </Form.Item>
      {isEdgePinHaEnabled && !hiddenPin && venuePinInfo &&
        <SpaceWrapper fullWidth>
          <Typography>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: '<b>Note</b>: If you\'d like to choose Personal Identity Network as tunnel type for this network, please go to the PIN wizard({pinEditLink})' }, {
                b: (chr) => (<b>{chr}</b>),
                pinEditLink: <TenantLink to={getServiceDetailsLink({
                  type: ServiceType.PIN,
                  oper: ServiceOperation.EDIT,
                  serviceId: venuePinInfo.id!
                })}>
                  {venuePinInfo.name}
                </TenantLink>
              })
            }
          </Typography>
        </SpaceWrapper>
      }
    </Form>
  </Modal>
}

// eslint-disable-next-line max-len
const getIsDisabledAll = (sdlanInfo: EdgeMvSdLanViewData | undefined, currentNetworkId: string | undefined): boolean => {
  const dcNetworkCount = sdlanInfo?.tunneledWlans?.length ?? 0
  if(dcNetworkCount === 0 || !currentNetworkId) return false

  const isSdLanLastNetwork = sdlanInfo!.tunneledWlans!.length <= 1
  if (!isSdLanLastNetwork) return false

  return sdlanInfo!.tunneledWlans![0].networkId === currentNetworkId
}

const usePermissionResult = () => {
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isEdgePinHaEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)

  // eslint-disable-next-line max-len
  const hasEdgeSdLanPermission = isEdgeSdLanMvEnabled ? hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.EDIT }) : true
  // eslint-disable-next-line max-len
  const hasEdgePinPermission = isEdgePinHaEnabled ? hasServicePermission({ type: ServiceType.PIN, oper: ServiceOperation.EDIT }) : true

  // eslint-disable-next-line max-len
  const hasSoftGrePermission = isSoftGreEnabled ? hasPolicyPermission({ type: PolicyType.SOFTGRE, oper: PolicyOperation.EDIT }) : true
  return hasEdgeSdLanPermission && hasEdgePinPermission && hasSoftGrePermission
}