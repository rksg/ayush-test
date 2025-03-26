import { useEffect, useState } from 'react'

import { Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { DefaultOptionType }                               from 'antd/lib/select'
import { FormattedMessage, useIntl }                       from 'react-intl'

import { cssStr, Tooltip }        from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { WarningCircleSolid }     from '@acx-ui/icons'
import {
  ApLanPortTypeEnum,
  CapabilitiesApModel,
  CapabilitiesLanPort,
  checkVlanMember,
  EthernetPortAuthType,
  EthernetPortProfileViewData,
  LanPort,
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState,
  useConfigTemplate,
  VenueLanPorts,
  WifiApSetting,
  WifiNetworkMessages
} from '@acx-ui/rc/utils'

import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '../ApCompatibility'
import { DhcpOption82Settings }  from '../DhcpOption82Settings'
import { SoftGRETunnelSettings } from '../SoftGRETunnelSettings'
import { BoundSoftGreIpsec }     from '../SoftGRETunnelSettings/SoftGreIpSecState'
import { SoftGreIpsecProfile }   from '../SoftGRETunnelSettings/useIpsecProfileLimitedSelection'

import ClientIsolationSettingsFields from './ClientIsolationSettingsFields'
import EthernetPortProfileFields     from './EthernetPortProfileFields'

export const ConvertPoeOutToFormData = (
  lanPortsData: WifiApSetting | VenueLanPorts,
  lanPortsCap: LanPort[] | CapabilitiesLanPort[]
) => {
  const newData = { ...lanPortsData }
  const { poeOut, lanPorts = [] } = newData

  if (poeOut === undefined) {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let poeOutObj: any = {}
  for (let i=0; i<lanPorts.length; i++) {
    if (lanPortsCap?.[i].isPoeOutPort) {
      poeOutObj[i] = poeOut
    }
  }
  return poeOutObj
}

export function LanPortSettings (props: {
  index: number,
  selectedPortCaps: LanPort,
  setSelectedPortCaps: (data: LanPort) => void,
  selectedModel: VenueLanPorts | WifiApSetting,
  selectedModelCaps: CapabilitiesApModel,
  onGUIChanged?: (fieldName: string) => void,
  isDhcpEnabled?: boolean,
  isTrunkPortUntaggedVlanEnabled?: boolean,
  readOnly?: boolean,
  useVenueSettings?: boolean,
  venueId?: string,
  serialNumber?: string
  softGREProfileOptionList?: DefaultOptionType[]
  optionDispatch?: React.Dispatch<SoftGreDuplicationChangeDispatcher>
  validateIsFQDNDuplicate: (softGreProfileId: string) => boolean
  isVenueBoundIpsec?: boolean,
  boundSoftGreIpsecList?: BoundSoftGreIpsec[],
  softGreIpsecProfileValidator: (
    softGreEditable: boolean, index: number) => Promise<void>,
  boundSoftGreIpsecData?: SoftGreIpsecProfile[],
  ipsecOptionList?: DefaultOptionType[],
  ipsecOptionChange?: (index: number, apModel?: string, serialNumber?: string) => void
}) {
  const { $t } = useIntl()
  const {
    index,
    selectedPortCaps,
    selectedModel,
    setSelectedPortCaps,
    selectedModelCaps,
    onGUIChanged,
    isDhcpEnabled,
    isTrunkPortUntaggedVlanEnabled,
    readOnly,
    useVenueSettings,
    venueId,
    serialNumber,
    softGREProfileOptionList,
    optionDispatch,
    validateIsFQDNDuplicate,
    isVenueBoundIpsec,
    boundSoftGreIpsecList,
    softGreIpsecProfileValidator,
    boundSoftGreIpsecData,
    ipsecOptionList,
    ipsecOptionChange
  } = props

  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const form = Form.useFormInstance()
  const lan = form?.getFieldValue('lan')?.[index]
  const hasVni = lan?.vni > 0
  const { isTemplate } = useConfigTemplate()
  const isEthernetPortEnable = Form.useWatch( ['lan', index, 'enabled'] ,form)
  const softGreTunnelFieldName = ['lan', index, 'softGreEnabled']
  const isSoftGreTunnelEnable = Form.useWatch(softGreTunnelFieldName, form)
  const [currentEthernetPortData, setCurrentEthernetPortData] =
    useState<EthernetPortProfileViewData>()
  const [isSoftGreEditable, setIsSoftGreEditable] = useState(true)

  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isDhcpOption82Enabled = useIsSplitOn(Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE)
  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const isR370UnsupportFeatureEnabled = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const isModelSupportSoftGRE =
    (isR370UnsupportFeatureEnabled && selectedModelCaps?.supportSoftGre) ||
    selectedModelCaps?.model !== 'R370'

  const isEthernetClientIsolationEnabled =
    useIsSplitOn(Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE)

  // template
  const isEthernetPortTemplate = useIsSplitOn(Features.ETHERNET_PORT_TEMPLATE_TOGGLE)

  const isShowEthPortProfile = (isTemplate)
    ? isEthernetPortTemplate : isEthernetPortProfileEnabled


  const isUnderAPNetworking = !!serialNumber

  // Non ethernet port profile
  const handlePortTypeChange = (value: string, index:number) => {
    const lanPorts = selectedModel?.lanPorts?.map((lan: LanPort, idx: number) =>
      index === idx ? {
        ...lan,
        type: value,
        untagId: value === ApLanPortTypeEnum.TRUNK ? 1 : lan.untagId,
        vlanMembers: value === ApLanPortTypeEnum.TRUNK
          ? '1-4094'
          : (value === ApLanPortTypeEnum.ACCESS
            ? lan?.untagId.toString()
            : lan?.vlanMembers.toString()
          )
      } : lan
    )
    setSelectedPortCaps(selectedModelCaps?.lanPorts?.[index] as LanPort)
    form?.setFieldValue('lan', lanPorts)

    onChangedByCustom('portType')
  }

  const onChangedByCustom = (fieldName: string) => {
    onGUIChanged?.(fieldName)
  }

  const onEthernetPortProfileChange = (data: EthernetPortProfileViewData) => {
    setCurrentEthernetPortData(data)
  }

  useEffect(() => {
    if (currentEthernetPortData) {
      if (currentEthernetPortData.authType === EthernetPortAuthType.SUPPLICANT) {
        form.setFieldValue(['lan', index, 'softGreEnabled'], false)
        onChangedByCustom('softGreEnabled')
        if (isIpSecOverNetworkEnabled) {
          form.setFieldValue(['lan', index, 'ipsecEnabled'], false)
          onChangedByCustom('ipsecEnabled')
        }
      }
    }
  }, [currentEthernetPortData])


  useEffect(() => {
    setIsSoftGreEditable(!!!selectedModel.lanPorts![index].softGreEnabled)
  }, [])

  return (<>
    {selectedPortCaps?.isPoeOutPort && <Form.Item
      name={['poeOut', index]}
      label={$t({ defaultMessage: 'Enable PoE Out' })}
      valuePropName='checked'
      children={<Switch
        disabled={readOnly}
        onChange={() => onChangedByCustom('poeOut')}
      />}
    />}
    {isDhcpEnabled && !useVenueSettings && <FormattedMessage
      defaultMessage={`<section>
        <p>* The following LAN Port settings can’t work because DHCP is enabled.</p>
        <p>You cannot edit LAN Port setting on this device because it has assigned
          to the <venueSingular></venueSingular> which already has enabled DHCP service.</p>
      </section>`}
      values={{
        section: (contents) => <Space
          direction='vertical'
          size={0}
          style={{ fontSize: '12px', color: cssStr('--acx-semantics-red-50') }}
        >
          {contents}
        </Space>,
        p: (contents) => <p>{contents}</p>
      }}
    />}
    <Form.Item
      name={['lan', index, 'enabled']}
      label={$t({ defaultMessage: 'Enable port' })}
      valuePropName='checked'
      children={<Switch
        disabled={readOnly
          || isDhcpEnabled
          || !selectedPortCaps?.supportDisable
          || hasVni
        }
        onChange={(value) => {
          onChangedByCustom('enabled')
          const portId = selectedModel.lanPorts![index].portId
          const voter = (isUnderAPNetworking ?
            { serialNumber, portId: (portId ?? '0') }:
            { model: (selectedModel as VenueLanPorts)?.model, portId: (portId ?? '0') })
          if (value) {
            optionDispatch && optionDispatch ({
              state: SoftGreDuplicationChangeState.TurnOnLanPort,
              softGreProfileId: form.getFieldValue(['lan', index, 'softGreProfileId']),
              voter: voter
            })
          }
          else {
            optionDispatch && optionDispatch ({
              state: SoftGreDuplicationChangeState.TurnOffLanPort,
              voter: voter
            })
          }
        }}
      />}
    />
    <Form.Item
      hidden={true}
      name={['lan', index, 'portId']}
      children={<Input />}
    />
    {isShowEthPortProfile ?
      (isEthernetPortEnable && <>
        <EthernetPortProfileFields
          index={index}
          onGUIChanged={onGUIChanged}
          readOnly={readOnly || isDhcpEnabled}
          useVenueSettings={useVenueSettings}
          isDhcpEnabled={isDhcpEnabled}
          hasVni={hasVni}
          serialNumber={serialNumber}
          isEthernetPortEnabled={!!lan.enabled}
          venueId={venueId}
          selectedPortCaps={selectedPortCaps}
          selectedModelCaps={selectedModelCaps}
          onEthernetPortProfileChanged={onEthernetPortProfileChange}
        />
        {!isTemplate && isEthernetSoftgreEnabled && isModelSupportSoftGRE && <>
          <SoftGRETunnelSettings
            readonly={
              !isEthernetPortEnable ||
                      isDhcpEnabled ||
                      currentEthernetPortData?.authType === EthernetPortAuthType.SUPPLICANT ||
                      (readOnly ?? false) ||
                    hasVni}
            index={index}
            portId={selectedModel.lanPorts![index].portId}
            onGUIChanged={onGUIChanged}
            toggleButtonToolTip={
              (currentEthernetPortData?.authType === EthernetPortAuthType.SUPPLICANT)?
                // eslint-disable-next-line max-len
                $t({ defaultMessage: 'A port profile cannot be applied to SoftGRE while it is configured with the 802.1X supplicant role.' }):
                undefined
            }
            softGREProfileOptionList={softGREProfileOptionList}
            serialNumber={serialNumber}
            apModel={(selectedModel as VenueLanPorts)?.model}
            isUnderAPNetworking={isUnderAPNetworking}
            optionDispatch={optionDispatch}
            validateIsFQDNDuplicate={validateIsFQDNDuplicate}
            isVenueBoundIpsec={isVenueBoundIpsec}
            boundSoftGreIpsecList={boundSoftGreIpsecList}
            softGreIpsecProfileValidator={softGreIpsecProfileValidator}
            softGreEditable={isSoftGreEditable}
            boundSoftGreIpsecData={boundSoftGreIpsecData}
            ipsecOptionChange={ipsecOptionChange}
            ipsecOptionList={ipsecOptionList}
          />
          {isDhcpOption82Enabled && isSoftGreTunnelEnable &&
            <DhcpOption82Settings
              readonly={readOnly ?? false}
              index={index}
              onGUIChanged={onGUIChanged}
              isUnderAPNetworking={isUnderAPNetworking}
              serialNumber={serialNumber}
              venueId={venueId}
              portId={selectedModel.lanPorts![index].portId}
              apModel={selectedModelCaps.model}
            />
          }
        </>
        }
        {!isTemplate && isEthernetClientIsolationEnabled &&
          <ClientIsolationSettingsFields
            index={index}
            onGUIChanged={onGUIChanged}
            readOnly={readOnly || isDhcpEnabled || hasVni}
          />
        }
      </>) :
      (<>
        <Form.Item
          name={['lan', index, 'type']}
          label={<>
            {$t({ defaultMessage: 'Port type' })}
            <Tooltip.Question
              title={$t(WifiNetworkMessages.LAN_PORTS_PORT_TOOLTIP)}
              placement='bottom' />
          </>}
          children={<Select
            disabled={readOnly
            || isDhcpEnabled
            || !lan?.enabled
            || selectedPortCaps?.trunkPortOnly
            || hasVni}
            options={Object.keys(ApLanPortTypeEnum).map(type => ({ label: type, value: type }))}
            onChange={(value) => handlePortTypeChange(value, index)} />} />
        <Form.Item
          name={['lan', index, 'untagId']}
          label={<>
            {$t({ defaultMessage: 'VLAN untag ID' })}
            {lan?.type === ApLanPortTypeEnum.TRUNK && isTrunkPortUntaggedVlanEnabled ?
              <ApCompatibilityToolTip
                title={$t(WifiNetworkMessages.LAN_PORTS_TRUNK_PORT_VLAN_UNTAG_TOOLTIP)}
                showDetailButton
                placement='bottom'
                onClick={() => setDrawerVisible(true)} />
              :
              <Tooltip.Question
                title={$t(WifiNetworkMessages.LAN_PORTS_VLAN_UNTAG_TOOLTIP)}
                placement='bottom' />}
            <ApCompatibilityDrawer
              visible={drawerVisible}
              type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
              venueId={venueId}
              featureName={InCompatibilityFeatures.TRUNK_PORT_VLAN_UNTAG_ID}
              onClose={() => setDrawerVisible(false)} />
          </>}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'This field is invalid' })
          }]}
          children={<InputNumber min={1}
            max={4094}
            style={{ width: '100%' }}
            disabled={readOnly
              || isDhcpEnabled
              || !lan?.enabled
              || (lan?.type === ApLanPortTypeEnum.TRUNK && !isTrunkPortUntaggedVlanEnabled)
              || hasVni}
            onChange={(value) => {
              const isTrunkPort = lan?.type === ApLanPortTypeEnum.TRUNK
              if (!isTrunkPort || isTrunkPortUntaggedVlanEnabled) {
                const lanPorts =
              selectedModel?.lanPorts?.map((lan: LanPort, idx: number) => index === idx ? {
                ...lan,
                untagId: value,
                vlanMembers: isTrunkPort ? lan?.vlanMembers : value?.toString()
              } : lan
              )
                form?.setFieldValue('lan', lanPorts)
                onChangedByCustom('untagId')
              }
            }} />} />
        <Form.Item
          name={['lan', index, 'vlanMembers']}
          label={<>
            {$t({ defaultMessage: 'VLAN member' })}
            <Tooltip.Question
              title={$t(WifiNetworkMessages.LAN_PORTS_VLAN_MEMBERS_TOOLTIP)}
              placement='bottom' />
          </>}
          rules={[
            { validator: (_, value) => checkVlanMember(value) }
          ]}
          children={<Input
            value={lan?.type === ApLanPortTypeEnum.ACCESS ? lan?.untagId : ''}
            disabled={readOnly
              || isDhcpEnabled
              || !lan?.enabled
              || lan?.type !== ApLanPortTypeEnum.GENERAL
              || hasVni}
            onChange={() => onChangedByCustom('vlanMembers')} />} />
      </>)}
    {(hasVni && <Space size='small'>
      <WarningCircleSolid />
      {$t({ defaultMessage: 'This LAN port is associated with the PIN service currently.' })}
    </Space>)}
    <Form.Item
      hidden={true}
      name={['lan', index, 'vni']}
      children={<Input />}
    />
  </>)
}
