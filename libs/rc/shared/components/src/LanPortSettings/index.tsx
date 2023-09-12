import { Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { FormattedMessage, useIntl }                       from 'react-intl'

import { cssStr, Tooltip } from '@acx-ui/components'
import {
  ApLanPortTypeEnum,
  ApModel,
  CapabilitiesApModel,
  CapabilitiesLanPort,
  checkVlanMember,
  LanPort,
  VenueLanPorts,
  WifiApSetting,
  WifiNetworkMessages
} from '@acx-ui/rc/utils'


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
  selectedModelCaps: ApModel | CapabilitiesApModel,
  onGUIChanged?: (fieldName: string) => void,
  isDhcpEnabled?: boolean,
  isTrunkPortUntaggedVlanEnabled?: boolean,
  readOnly?: boolean,
  useVenueSettings?: boolean
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
    useVenueSettings
  } = props

  const form = Form.useFormInstance()
  const lan = form?.getFieldValue('lan')?.[index]
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
          to the venue which already has enabled DHCP service.</p>
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
          || lan?.vni > 0
        }
        onChange={() => onChangedByCustom('enabled')}
      />}
    />
    <Form.Item
      hidden={true}
      name={['lan', index, 'portId']}
      children={<Input />}
    />
    <Form.Item
      name={['lan', index, 'type']}
      label={<>
        {$t({ defaultMessage: 'Port type' })}
        <Tooltip.Question
          title={$t(WifiNetworkMessages.LAN_PORTS_PORT_TOOLTIP)}
          placement='bottom'
        />
      </>}
      children={<Select
        disabled={readOnly
          || isDhcpEnabled
          || !lan?.enabled
          || selectedPortCaps?.trunkPortOnly
          || lan?.vni > 0
        }
        options={Object.keys(ApLanPortTypeEnum).map(type => ({ label: type, value: type }))}
        onChange={(value) => handlePortTypeChange(value, index)}
      />}
    />
    <Form.Item
      name={['lan', index, 'untagId']}
      label={<>
        {$t({ defaultMessage: 'VLAN untag ID' })}
        <Tooltip.Question
          title={$t(WifiNetworkMessages.LAN_PORTS_VLAN_UNTAG_TOOLTIP)}
          placement='bottom'
        />
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
          || lan?.vni > 0
        }
        onChange={(value) => {
          const isTrunkPort = lan?.type === ApLanPortTypeEnum.TRUNK
          if (!isTrunkPort || isTrunkPortUntaggedVlanEnabled) {
            const lanPorts = selectedModel?.lanPorts?.map((lan: LanPort, idx: number) =>
              index === idx ? {
                ...lan,
                untagId: value,
                vlanMembers: isTrunkPort ? lan?.vlanMembers : value?.toString()
              } : lan
            )
            form?.setFieldValue('lan', lanPorts)
            onChangedByCustom('untagId')
          }
        }}
      />}
    />
    <Form.Item
      name={['lan', index, 'vlanMembers']}
      label={<>
        {$t({ defaultMessage: 'VLAN member' })}
        <Tooltip.Question
          title={$t(WifiNetworkMessages.LAN_PORTS_VLAN_MEMBERS_TOOLTIP)}
          placement='bottom'
        />
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
          || lan?.vni > 0
        }
        onChange={() => onChangedByCustom('vlanMembers')}
      />}
    />
    <Form.Item
      hidden={true}
      name={['lan', index, 'vni']}
      children={<Input />}
    />
  </>)
}
