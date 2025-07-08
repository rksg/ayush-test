import { useEffect, useState } from 'react'

import { Form, Select, Tooltip, Typography } from 'antd'

import { Drawer, Loader }             from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  EdgePinUrls,
  getServiceDetailsLink,
  NetworkTypeEnum,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink }         from '@acx-ui/react-router-dom'
import { hasPermission }      from '@acx-ui/user'
import { getIntl, getOpsApi } from '@acx-ui/utils'

import { ApCompatibilityDrawer, ApCompatibilityToolTip, ApCompatibilityType, InCompatibilityFeatures } from '../ApCompatibility'
import { SpaceWrapper }                                                                                from '../SpaceWrapper'
import { useIsEdgeFeatureReady }                                                                       from '../useEdgeActions'

import { EdgeSdLanSelectOption }                          from './EdgeSdLanSelectOption'
import { messageMappings }                                from './messageMappings'
import { NetworkTunnelActionModalProps }                  from './NetworkTunnelActionModal'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum } from './types'
import { usePermissionResult }                            from './usePermissionResult'
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
  const isEdgePinHaEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeSdLanSelectionDrawerReady = useIsEdgeFeatureReady(Features.EDGE_SDLAN_SELECTION_ENHANCE_TOGGLE)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)

  const [softGreDrawerVisible, setSoftGreDrawerVisible] = useState(false)
  const { hasEdgeSdLanPermission, hasSoftGrePermission } = usePermissionResult()
  const isPinNetwork = isEdgePinHaEnabled && props.isPinNetwork

  const [form] = Form.useForm()
  const tunnelType = Form.useWatch(['tunnelType'], form)

  const networkId = network?.id
  const networkType = network?.type
  const networkVenueId = network?.venueId
  const networkVenueName = network?.venueName
  const isCaptivePortal = networkType === NetworkTypeEnum.CAPTIVEPORTAL
  const hiddenSoftGre = isCaptivePortal
  const hiddenPin = NetworkTypeEnum.DPSK !== networkType
  const hasPinAllowOps = hasPermission({
    rbacOpsIds: [
      getOpsApi(EdgePinUrls.updateEdgePin)
    ] })

  const {
    tunnelType: tunnelTypeInitVal,
    venueSdLanInfo: initialVenueSdLanInfo,
    networkVlanPool,
    venuePinInfo,
    isLoading
  } = useTunnelInfos({ network, cachedActs, cachedSoftGre })

  const handleApply = async () => {
    try {
      await form.validateFields()

      if (!networkVenueId)  return
      const formValues = form.getFieldsValue(true) as NetworkTunnelActionForm
      const venueSdLan = formValues.sdLan.newProfileId ? formValues.sdLan.newProfile : undefined

      await onFinish(formValues, { tunnelTypeInitVal, network, venueSdLan })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  const isSdLanConfigurable = isEdgeSdLanSelectionDrawerReady ? true : !!initialVenueSdLanInfo

  // If network is captive portal, SD-LAN should be selected by default and unchangeable
  // due to SoftGRE is not supported on captive portal
  const shouldSdLanBeSelectedByDefault = hiddenSoftGre && isSdLanConfigurable

  useEffect(() => {
    const isTunnelTypeTouched = form.isFieldTouched('tunnelType')

    if (visible && !isTunnelTypeTouched) {
      const defaultTunnelType = shouldSdLanBeSelectedByDefault
        ? NetworkTunnelTypeEnum.SdLan : ''

      form.setFieldValue('tunnelType',
        tunnelTypeInitVal === NetworkTunnelTypeEnum.None ? defaultTunnelType : tunnelTypeInitVal)
    }
  }, [visible, tunnelTypeInitVal, initialVenueSdLanInfo])

  const noChangePermission = !hasEdgeSdLanPermission && !hasSoftGrePermission

  return (<Drawer
    title={$t({ defaultMessage: 'Tunnel: {name}' }, { name: networkVenueName })}
    visible={visible}
    width={450}
    push={false}
    children={visible &&
      <Form form={form} layout='vertical' onFinish={handleApply}>
        <Typography style={{ marginBottom: '20px' }}>
          {$t(messageMappings.drawer_description) }
        </Typography>
        <Form.Item
          name='tunnelType'
          label={<>
            {$t({ defaultMessage: 'Tunneling Method' })}
            {isR370UnsupportedFeatures &&
            <>
              <ApCompatibilityToolTip
                title={'SoftGRE has specific compatibility requirements.'}
                showDetailButton
                placement='top'
                onClick={() => setSoftGreDrawerVisible(true)}
                icon={<QuestionMarkCircleOutlined
                  style={{ height: '16px', width: '16px', marginLeft: '3px', marginBottom: -3 }}
                />}
              />
              <ApCompatibilityDrawer
                visible={softGreDrawerVisible}
                type={ApCompatibilityType.ALONE}
                networkId={networkId}
                featureNames={[InCompatibilityFeatures.NETWORK_SOFT_GRE]}
                onClose={() => setSoftGreDrawerVisible(false)}
              />
            </>}
          </>}
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
              disabled={shouldSdLanBeSelectedByDefault}
            >
              <Select.Option value={''}>{$t({ defaultMessage: 'Select...' })}</Select.Option>
              <Select.Option
                data-testid='softgre-option'
                hidden={hiddenSoftGre}
                value={NetworkTunnelTypeEnum.SoftGre}
                disabled={!hasSoftGrePermission || hiddenSoftGre}>
                <Tooltip>
                  {$t({ defaultMessage: 'SoftGRE' })}
                </Tooltip>
              </Select.Option>
              <Select.Option
                data-testid='sd-lan-option'
                value={NetworkTunnelTypeEnum.SdLan}
                disabled={!hasEdgeSdLanPermission || isPinNetwork}>
                <Tooltip
                  title={isPinNetwork
                    ? $t(messageMappings.disable_pin_network)
                    : undefined}>
                  {$t({ defaultMessage: 'SD-LAN' })}
                </Tooltip>
              </Select.Option>
            </Select>
          }
        />
        {!hiddenSoftGre && visible
          && tunnelType===NetworkTunnelTypeEnum.SoftGre &&
          <WifiSoftGreSelectOption currentTunnelType={tunnelType}
            venueId={networkVenueId!}
            networkId={networkId!}
            cachedSoftGre={cachedSoftGre}
            disabledInfo={(!hasSoftGrePermission)
              ? {
                isDisabled: !hasSoftGrePermission,
                tooltip: undefined
              }
              : undefined} />
        }
        {network && visible && !venuePinInfo &&
        tunnelType===NetworkTunnelTypeEnum.SdLan &&
        <Loader states={[{ isLoading }]} style={{ backgroundColor: 'transparent' }}>
          <EdgeSdLanSelectOption
            tunnelTypeInitVal={tunnelTypeInitVal}
            currentTunnelType={tunnelType}
            networkId={networkId!}
            networkVenueId={networkVenueId!}
            networkType={networkType!}
            venueSdLan={initialVenueSdLanInfo}
            networkVlanPool={networkVlanPool}
            disabledInfo={(!hasEdgeSdLanPermission || isPinNetwork)
              ? {
                isDisabled: !hasEdgeSdLanPermission || !!isPinNetwork,
                tooltip: isPinNetwork
                  ? $t(messageMappings.disable_pin_network)
                  : undefined
              }
              : undefined}
          />
        </Loader>
        }
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