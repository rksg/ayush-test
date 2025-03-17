import { useEffect } from 'react'

import { Form, Select, Tooltip, Typography } from 'antd'

import { Drawer, Loader }         from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import {
  EdgeMvSdLanViewData,
  EdgePinUrls,
  EdgeSdLanUrls,
  hasPolicyPermission,
  hasServicePermission,
  NetworkTypeEnum,
  PolicyOperation,
  PolicyType,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType } from '@acx-ui/rc/utils'
import { TenantLink }         from '@acx-ui/react-router-dom'
import { hasPermission }      from '@acx-ui/user'
import { getIntl, getOpsApi } from '@acx-ui/utils'

import { SpaceWrapper }          from '../SpaceWrapper'
import { useIsEdgeFeatureReady } from '../useEdgeActions'


import { EdgeSdLanSelectOption }                          from './EdgeSdLanSelectOption'
import { messageMappings }                                from './messageMappings'
import { NetworkTunnelActionModalProps }                  from './NetworkTunnelActionModal'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum } from './types'
import { useTunnelInfos }                                 from './utils'
import WifiSoftGreSelectOption                            from './WifiSoftGreSelectOption'

export const NetworkTunnelActionDrawer = (props: NetworkTunnelActionModalProps) => {
  const { $t } = getIntl()
  const {
    visible,
    network,
    onClose, onFinish,
    cachedActs, cachedSoftGre
  } = props
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isEdgePinHaEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const hasChangePermission = usePermissionResult()
  const isPinNetwork = isEdgePinHaEnabled && props.isPinNetwork

  const [form] = Form.useForm()
  const tunnelType = Form.useWatch(['tunnelType'], form)

  const networkId = network?.id
  const networkType = network?.type
  const networkVenueId = network?.venueId
  const networkVenueName = network?.venueName
  const hiddenSoftGre = NetworkTypeEnum.CAPTIVEPORTAL === networkType
  const hiddenPin = NetworkTypeEnum.DPSK !== networkType
  const hasPinAllowOps = hasPermission({
    rbacOpsIds: [
      getOpsApi(EdgePinUrls.updateEdgePin)
    ] })

  const {
    tunnelType: tunnelTypeInitVal,
    venueSdLanInfo,
    networkVlanPool,
    venuePinInfo,
    isLoading
  } = useTunnelInfos({ network, cachedActs, cachedSoftGre })

  const handleApply = async () => {
    try {
      await form.validateFields()

      if (!networkVenueId)  return
      const formValues = form.getFieldsValue(true) as NetworkTunnelActionForm

      await onFinish(formValues, { tunnelTypeInitVal, network, venueSdLan: venueSdLanInfo })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  useEffect(() => {
    if (visible) {
      form.setFieldValue('tunnelType',
        tunnelTypeInitVal === NetworkTunnelTypeEnum.None ? '' : tunnelTypeInitVal)
    }
  }, [visible, tunnelTypeInitVal])

  const isDisabledAll = getIsDisabledAll(venueSdLanInfo, networkId)
  const noChangePermission = !hasChangePermission

  return (<Drawer
    title={$t({ defaultMessage: 'Tunnel: {name}' }, { name: networkVenueName })
    }
    visible={visible}
    width={450}
    children={visible &&
      <Form form={form} layout='vertical' onFinish={handleApply}>
        <Typography style={{ marginBottom: '20px' }}>
          {$t(messageMappings.drawer_description) }
        </Typography>
        <Form.Item
          name='tunnelType'
          label={$t({ defaultMessage: 'Network Topology' })}
          initialValue={tunnelTypeInitVal === NetworkTunnelTypeEnum.None ? '' : tunnelTypeInitVal}
          rules={[
            {
              required: true,
              message: $t({ defaultMessage: 'Please select tunnel type' })
            }
          ]}
          children={
            <Select
              style={{ width: '220px' }}
              placeholder={$t({ defaultMessage: 'Select...' })}
            >
              <Select.Option value={''}>{$t({ defaultMessage: 'Select...' })}</Select.Option>
              <Select.Option
                data-testid='softgre-option'
                value={NetworkTunnelTypeEnum.SoftGre}
                disabled={isDisabledAll || noChangePermission}>
                <Tooltip
                  title={isDisabledAll
                    ? $t(messageMappings.disable_deactivate_last_network)
                    : undefined}>
                  {$t({ defaultMessage: 'SoftGRE' })}
                </Tooltip>
              </Select.Option>
              <Select.Option
                data-testid='sd-lan-option'
                value={NetworkTunnelTypeEnum.SdLan}
                disabled={isDisabledAll || noChangePermission
                  || isPinNetwork || !!!venueSdLanInfo}>
                <Tooltip
                  title={isPinNetwork
                    ? $t(messageMappings.disable_pin_network)
                    : (isDisabledAll
                      ? $t(messageMappings.disable_deactivate_last_network)
                      : undefined)}>
                  {$t({ defaultMessage: 'SD-LAN' })}
                </Tooltip>
              </Select.Option>
            </Select>
          }
        />
        {isSoftGreEnabled && !hiddenSoftGre && visible
          && tunnelType===NetworkTunnelTypeEnum.SoftGre &&
          <WifiSoftGreSelectOption currentTunnelType={tunnelType}
            venueId={networkVenueId!}
            networkId={networkId!}
            cachedSoftGre={cachedSoftGre}
            disabledInfo={(isDisabledAll || noChangePermission)
              ? {
                isDisabled: isDisabledAll,
                noChangePermission,
                tooltip: isDisabledAll
                  ? $t(messageMappings.disable_deactivate_last_network)
                  : undefined
              }
              : undefined} />
        }
        <Loader states={[{ isLoading }]} style={{ backgroundColor: 'transparent' }}>
          {network && visible && isEdgeSdLanMvEnabled && !venuePinInfo &&
          tunnelType===NetworkTunnelTypeEnum.SdLan &&
          <EdgeSdLanSelectOption
            tunnelTypeInitVal={tunnelTypeInitVal}
            currentTunnelType={tunnelType}
            networkId={networkId!}
            networkVenueId={networkVenueId!}
            networkType={networkType!}
            venueSdLan={venueSdLanInfo}
            networkVlanPool={networkVlanPool}
            disabledInfo={(isDisabledAll || noChangePermission || isPinNetwork)
              ? {
                isDisabled: isDisabledAll || !!isPinNetwork,
                noChangePermission,
                tooltip: isPinNetwork
                  ? $t(messageMappings.disable_pin_network)
                  : (isDisabledAll
                    ? $t(messageMappings.disable_deactivate_last_network)
                    : undefined)
              }
              : undefined}
          />
          }
        </Loader>
        {isEdgePinHaEnabled && !hiddenPin && venuePinInfo && hasPinAllowOps &&
        <SpaceWrapper fullWidth>
          <Typography>
            {
              $t(messageMappings.pin_venue_msg, {
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
    }
    onClose={onClose}
    destroyOnClose={true}
    footer={
      <Drawer.FormFooter
        buttonLabel={{
          save: $t({ defaultMessage: 'Add' })
        }}
        onCancel={onClose}
        showSaveButton={!noChangePermission}
        onSave={() => {
          return handleApply()
        }}
      />
    }
  />)
}

// eslint-disable-next-line max-len
const getIsDisabledAll = (sdlanInfo: EdgeMvSdLanViewData | undefined, currentNetworkId: string | undefined): boolean => {
  const dcNetworkCount = sdlanInfo?.tunneledWlans?.length ?? 0
  if(dcNetworkCount === 0 || !currentNetworkId) return false

  const isSdLanLastNetwork = sdlanInfo!.tunneledWlans!.length <= 1
  if (!isSdLanLastNetwork) return false

  return sdlanInfo!.tunneledWlans![0].networkId === currentNetworkId
}
export const usePermissionResult = () => {
  const isAllowOpsEnabled = useIsSplitOn(Features.RBAC_OPERATIONS_API_TOGGLE)
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isIpSecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const hasSdLanPermission = () => {
    return isAllowOpsEnabled ?
      hasPermission({
        rbacOpsIds: [
          [
            getOpsApi(EdgeSdLanUrls.activateEdgeMvSdLanNetwork),
            getOpsApi(EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork)
          ]
        ]
      }):
      hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.EDIT })
  }

  // eslint-disable-next-line max-len
  const hasEdgeSdLanPermission = isEdgeSdLanMvEnabled ? hasSdLanPermission() : true
  // eslint-disable-next-line max-len
  const hasSoftGrePermission = isSoftGreEnabled ? hasPolicyPermission({ type: PolicyType.SOFTGRE, oper: PolicyOperation.EDIT }) : true
  // eslint-disable-next-line max-len
  const hasIpSecPermission = isIpSecEnabled ? hasPolicyPermission({ type: PolicyType.IPSEC, oper: PolicyOperation.EDIT }) : true

  return hasEdgeSdLanPermission && hasSoftGrePermission && hasIpSecPermission
}