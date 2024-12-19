import { useEffect, useState } from 'react'

import { Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { DefaultOptionType }                               from 'antd/lib/select'
import { FormattedMessage, useIntl }                       from 'react-intl'
import { useParams }                                       from 'react-router-dom'

import { cssStr, Tooltip }                          from '@acx-ui/components'
import { Features, useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { WarningCircleSolid }                       from '@acx-ui/icons'
import {
  useQueryEthernetPortProfilesWithOverwritesQuery
} from '@acx-ui/rc/services'
import {
  ApLanPortTypeEnum,
  CapabilitiesApModel,
  CapabilitiesLanPort,
  checkVlanMember,
  EthernetPortAuthType,
  EthernetPortProfileViewData,
  EthernetPortType,
  LanPort,
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

import EthernetPortProfileDrawer from './EthernetPortProfileDrawer'
import EthernetPortProfileInput  from './EthernetPortProfileInput'

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
    serialNumber
  } = props

  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const form = Form.useFormInstance()
  const lan = form?.getFieldValue('lan')?.[index]
  const params = useParams()
  const hasVni = lan?.vni > 0
  // Ethernet Port Profile
  const { isTemplate } = useConfigTemplate()
  const ethernetPortProfileId = Form.useWatch( ['lan', index, 'ethernetPortProfileId'] ,form)
  const isEthernetPortEnable = Form.useWatch( ['lan', index, 'enabled'] ,form)
  const softGreTunnelFieldName = ['lan', index, 'softGreTunnelEnable']
  const isSoftGreTunnelEnable = Form.useWatch(softGreTunnelFieldName, form)
  const [currentEthernetPortData, setCurrentEthernetPortData] =
    useState<EthernetPortProfileViewData>()
  const [ethernetProfileCreateId, setEthernetProfileCreateId] = useState<String>()
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isUnderAPNetworking = !!serialNumber

  // const isSoftGRETunnelSettingReadonly = () => {
  //   if(!isUnderAPNetworking){
  //     return !isEthernetPortEnable
  //   }
  //   // TODO Add readonly condition here
  //   return false
  // }

  // const isDhcpOption82SettingsReadonly = () => {
  //   if (!isUnderAPNetworking) {
  //     return false
  //   }
  //   // TODO Add readonly condition here
  //   return false
  // }

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

  const convertEthernetPortListToDropdownItems = (
    ethernetPortList?: EthernetPortProfileViewData[]): DefaultOptionType[] => {
    return ethernetPortList?.filter((m) => {
      // Not allow port-based ethernet port when LAN port is single port
      if(selectedModelCaps.lanPorts.length === 1 &&
        m.authType === EthernetPortAuthType.PORT_BASED) {
        return false
      }

      return !(selectedPortCaps.trunkPortOnly && m.type !== EthernetPortType.TRUNK)
    })
      .map(m => ({ label: m.name, value: m.id })) ?? []
  }

  // Ethernet Port Profile
  const { ethernetPortDropdownItems, ethernetPortListQuery,
    isLoading: isLoadingEthPortList } =
    useQueryEthernetPortProfilesWithOverwritesQuery({
      payload: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageSize: 1000
      },
      params: { ...params, venueId },
      selectedModelCaps
    }, {
      skip: isTemplate || !isEthernetPortProfileEnabled,
      selectFromResult: ({ data: queryResult, ...rest }) => ({
        ethernetPortDropdownItems: (queryResult)?
          convertEthernetPortListToDropdownItems(queryResult.data) :
          [],
        ethernetPortListQuery: queryResult,
        ...rest
      })
    })

  useEffect(()=> {
    if (!isLoadingEthPortList && ethernetPortListQuery?.data) {
      const ethProfile = ethernetPortListQuery.data.find((profile)=> ethernetProfileCreateId ?
        profile.id === ethernetProfileCreateId : profile.id === ethernetPortProfileId)

      setCurrentEthernetPortData(ethProfile)
      if (ethProfile && ethernetProfileCreateId) {
        form.setFieldValue(['lan', index, 'ethernetPortProfileId'], ethernetProfileCreateId)
        setEthernetProfileCreateId(undefined)
      }
    }
  }, [ethernetPortProfileId, ethernetPortListQuery?.data])

  useEffect(() => {
    form.setFieldValue(softGreTunnelFieldName, !!lan.softGreProfileId)
  }, [selectedPortCaps])

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
        onChange={() => onChangedByCustom('enabled')}
      />}
    />
    <Form.Item
      hidden={true}
      name={['lan', index, 'portId']}
      children={<Input />}
    />
    {!isTemplate && isEthernetPortProfileEnabled ?
      (isEthernetPortEnable && <>
        {(
          hasVni ? <Form.Item name={['lan', index, 'ethernetPortProfileId']} hidden/> :
            <Space>
              <Form.Item
                name={['lan', index, 'ethernetPortProfileId']}
                label={$t({ defaultMessage: 'Ethernet Port Profile' })}
                children={<Select
                  disabled={readOnly
                         || isDhcpEnabled
                         || !lan?.enabled
                         || hasVni}
                  options={ethernetPortDropdownItems}
                  style={{ width: '250px' }}
                  onChange={() => onChangedByCustom('ethernetPortProfileId')}
                />} />
              <EthernetPortProfileDrawer
                updateInstance={(createId) => {
                  setEthernetProfileCreateId(createId)
                }}
                currentEthernetPortData={currentEthernetPortData} />
            </Space>
        )}
        <EthernetPortProfileInput
          currentEthernetPortData={currentEthernetPortData}
          currentIndex={index}
          onGUIChanged={onGUIChanged}
          isEditable={!readOnly && !!serialNumber} />
        {
          isEthernetPortProfileEnabled && isEthernetSoftgreEnabled &&
            (<>
              <SoftGRETunnelSettings
                readonly={!isEthernetPortEnable || (readOnly ?? false)}
                index={index}
                softGreProfileId={selectedPortCaps.softGreProfileId ?? ''}
                softGreTunnelEnable={isSoftGreTunnelEnable}
                onGUIChanged={onGUIChanged}
              />
              {isSoftGreTunnelEnable &&
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
            </>)
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
                visible={true}
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
