import { Form, Input, InputNumber, Select, Space, Switch, Tooltip, Typography } from 'antd'
import { useIntl }                                                              from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  ApLanPortTypeEnum,
  ApModel,
  checkVlanMember,
  LanPort,
  VenueLanPorts,
  WifiNetworkMessages
} from '@acx-ui/rc/utils'

export function LanPortSettings (props: {
  index: number,
  selectedPortCaps: LanPort,
  setSelectedPortCaps: (data: LanPort) => void,
  selectedModel: VenueLanPorts,
  selectedModelCaps: ApModel,
  isDhcpEnabled?: boolean,
  readOnly?: boolean,
  useVenueSettings?: boolean
}) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const {
    index,
    selectedPortCaps,
    selectedModel,
    setSelectedPortCaps,
    selectedModelCaps,
    isDhcpEnabled,
    readOnly,
    useVenueSettings
  } = props

  const lan = form?.getFieldValue('lan')[index]
  const handlePortTypeChange = (value: string, index:number) => {
    const lanPorts = selectedModel?.lanPorts?.map((lan: LanPort, idx: number) =>
      index === idx ? {
        ...lan,
        type: value,
        untagId: value === ApLanPortTypeEnum.TRUNK ? 1 : lan.untagId,
        vlanMembers: value === ApLanPortTypeEnum.TRUNK
          ? '1-4094'
          : (value === ApLanPortTypeEnum.ACCESS ? lan?.untagId.toString() : lan?.vlanMembers)
      } : lan
    )
    setSelectedPortCaps(selectedModelCaps?.lanPorts?.[index] as LanPort)
    form?.setFieldValue('lan', lanPorts)
  }

  return (<>
    {selectedPortCaps?.isPoeOutPort && <Form.Item
      name={['poeOut', index]}
      label={$t({ defaultMessage: 'Enable PoE Out' })}
      initialValue={selectedModel.poeOut}
      valuePropName='checked'
      children={<Switch
        disabled={readOnly}
      />}
    />}
    {isDhcpEnabled && !useVenueSettings && <Space
      direction='vertical'
      style={{ marginBottom: '12px' }}
    >
      <Typography.Text>{
        // eslint-disable-next-line max-len
        $t({ defaultMessage: '* The following LAN Port settings can\'t work because DHCP is enabled.' })
      }</Typography.Text>
      <Typography.Text>{
        // eslint-disable-next-line max-len
        $t({ defaultMessage: 'You cannot edit LAN Port setting on this device because it has assigned to the venue which already has enabled DHCP service.' })
      }</Typography.Text>
    </Space>}

    <Form.Item
      name={['lan', index, 'enabled']}
      label={$t({ defaultMessage: 'Enable port' })}
      initialValue={lan?.enabled}
      valuePropName='checked'
      children={<Switch
        disabled={readOnly
          || isDhcpEnabled
          || !selectedPortCaps?.supportDisable}
      />}
    />
    <Form.Item
      hidden={true}
      name={['lan', index, 'portId']}
      initialValue={lan?.portId}
      children={<Input />}
    />
    <Form.Item
      name={['lan', index, 'type']}
      label={<>
        {$t({ defaultMessage: 'Port type' })}
        <Tooltip
          title={$t(WifiNetworkMessages.LAN_PORTS_PORT_TOOLTIP)}
          placement='bottom'
        >
          <QuestionMarkCircleOutlined />
        </Tooltip>
      </>}
      initialValue={lan?.type}
      children={<Select
        disabled={readOnly
          || isDhcpEnabled
          || !lan?.enabled
          || selectedPortCaps?.trunkPortOnly
        }
        options={Object.keys(ApLanPortTypeEnum).map(type => ({ label: type, value: type }))}
        onChange={(value) => handlePortTypeChange(value, index)}
      />}
    />
    <Form.Item
      name={['lan', index, 'untagId']}
      label={<>
        {$t({ defaultMessage: 'VLAN untag ID' })}
        <Tooltip
          title={$t(WifiNetworkMessages.LAN_PORTS_VLAN_UNTAG_TOOLTIP)}
          placement='bottom'
        >
          <QuestionMarkCircleOutlined />
        </Tooltip>
      </>}
      initialValue={lan?.untagId}
      children={<InputNumber min={1}
        max={4094}
        style={{ width: '100%' }}
        disabled={readOnly
          || isDhcpEnabled
          || !lan?.enabled
          || lan?.type === ApLanPortTypeEnum.TRUNK
        }
        onChange={(value) => {
          if (lan?.type === ApLanPortTypeEnum.ACCESS) {
            const lanPorts = selectedModel?.lanPorts?.map((lan: LanPort, idx: number) =>
              index === idx ? {
                ...lan,
                untagId: value,
                vlanMembers: value
              } : lan
            )
            form?.setFieldValue('lan', lanPorts)
          }
        }}
      />}
    />
    <Form.Item
      name={['lan', index, 'vlanMembers']}
      label={<>
        {$t({ defaultMessage: 'VLAN member' })}
        <Tooltip
          title={$t(WifiNetworkMessages.LAN_PORTS_VLAN_MEMBERS_TOOLTIP)}
          placement='bottom'
        >
          <QuestionMarkCircleOutlined />
        </Tooltip>
      </>}
      initialValue={lan?.vlanMembers}
      rules={[
        { validator: (_, value) => checkVlanMember(value) }
      ]}
      children={<Input
        value={lan?.type === ApLanPortTypeEnum.ACCESS ? lan?.untagId : null}
        disabled={readOnly
          || isDhcpEnabled
          || !lan?.enabled
          || lan?.type !== ApLanPortTypeEnum.GENERAL}
      />}
    />
  </>)
}