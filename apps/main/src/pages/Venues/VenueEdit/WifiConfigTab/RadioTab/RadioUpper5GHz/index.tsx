import { useEffect, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Radio, RadioChangeEvent, Select, Slider, Space } from 'antd'
import { useIntl }                                                                            from 'react-intl'

import { Button }                                 from '@acx-ui/components'
import { useVenueDefaultRegulatoryChannelsQuery } from '@acx-ui/rc/services'
import { useParams }                              from '@acx-ui/react-router-dom'

import {
  channelSelectionMethodsOptions,
  channelBandwidth50GOptions,
  txPowerAdjustmentOptions
} from '../contents'
import { FieldLabel, MultiSelect } from '../styledComponents'
import { RadioSettingsChannels } from '../RadioSettingsChannels'

const { useWatch } = Form

export function RadioUpper5GHz () {
  const { $t } = useIntl()

  const [
    channelInheritSettings,
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<boolean>(['radioParamsDual5G', 'inheritParamsUpper5G']),
    useWatch<string>(['radioParamsDual5G', 'radioParamsUpper5G', 'method']),
    useWatch<string>(['radioParamsDual5G', 'radioParamsUpper5G', 'channelBandwidth'])
  ]

  const { tenantId, venueId } = useParams()
  const [inheritSettings, setInheritSettings] = useState<boolean>(false)
  const [defaultIndoorChannels, setDefaultIndoorChannels] = useState<string[]>([''])
  const [defaultOutdoorChannels, setDefaultOutdoorChannels] = useState<string[]>([''])
  const [groupSize, setGroupSize] = useState<number>(1)

  const { data: defaultChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  const channelType = channelBandwidth === 'AUTO' ?
    channelBandwidth.toLowerCase() : channelBandwidth

  useEffect(() => {
    if(defaultChannelsData){
      setDefaultIndoorChannels(
        defaultChannelsData['5GUpperChannels']['indoor']['auto']
      )
      setDefaultOutdoorChannels(
        defaultChannelsData['5GUpperChannels']['outdoor']['auto']
      )
    }
    if(defaultChannelsData && channelBandwidth){
      setDefaultIndoorChannels(
        defaultChannelsData['5GUpperChannels']['indoor'][channelType]
      )
      setDefaultOutdoorChannels(
        defaultChannelsData['5GUpperChannels']['outdoor'][channelType]
      )

      switch(channelBandwidth){
        case '40MHz':
          setGroupSize(2)
          break
        case '80MHz':
          setGroupSize(4)
          break
        case '160MHz':
          setGroupSize(8)
          break
        default:
          setGroupSize(1)
          break
      }
    }

    if(channelInheritSettings){
      setInheritSettings(channelInheritSettings)
    }
  }, [defaultChannelsData, channelBandwidth, channelInheritSettings])

  function formatter (value: any) {
    return `${value}%`
  }

  const on5GHzSettingChange = (e: RadioChangeEvent) => {
    setInheritSettings(e.target.value)
  }

  const channelBars = {
    dfsChannels: defaultChannelsData && defaultChannelsData['5GUpperChannels']['dfs'][channelType]
     || [],
    lower5GChannels: [],
    upper5GChannels: ['100', '104', '108', '112', '116', '120', '124',
      '128', '132', '136', '140', '144', '149', '153', '157', '161']
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      {$t({ defaultMessage: '5GHz settings:' })}
      <div style={{ paddingBottom: '2em' }}>
        <Form.Item
          name={['radioParamsDual5G', 'inheritParamsUpper5G']}
        >
          <Radio.Group defaultValue={true} onChange={on5GHzSettingChange}>
            <FieldLabel width='300px'>
              <Radio value={true}>
                {$t({ defaultMessage: 'Inherit from 5GHz' })}
              </Radio>
            </FieldLabel>

            <FieldLabel width='300px'>
              <Radio value={false}>
                {$t({ defaultMessage: 'Custom Settings' })}
              </Radio>
            </FieldLabel>
          </Radio.Group>
        </Form.Item>
      </div>
      <FieldLabel width='200px'>
        { $t({ defaultMessage: 'Channel selection method:' }) }
        <Form.Item
          name={['radioParamsDual5G', 'radioParamsUpper5G', 'method']}>
          <Select
            options={channelSelectionMethodsOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={channelSelectionMethodsOptions[1].value}
            disabled={inheritSettings}
          />
        </Form.Item>
      </FieldLabel>
      <FieldLabel
        width='200px'
        style={{ display: channelMethod === channelSelectionMethodsOptions[0].value ?
          'block' : 'none' }}
      >
        { $t({ defaultMessage: 'Channel Change Frequency:' }) }
        <Form.Item
          name={['radioParamsDual5G', 'radioParamsUpper5G', 'changeInterval']}
        >
          <Slider
            tipFormatter={formatter}
            style={{ width: '240px' }}
            defaultValue={33}
            min={1}
            max={100}
            marks={{ 1: '1%', 100: '100%' }}
          />
        </Form.Item>
      </FieldLabel>
      <FieldLabel width='200px'>
        {$t({ defaultMessage: 'Run background scan every:' })}
        <Form.Item
          name={['radioParamsDual5G', 'radioParamsUpper5G', 'scanInterval']}
          rules={[
            { required: true },
            { type: 'number', min: 1 },
            { type: 'number', max: 65535 }
          ]}
          initialValue={20}
          children={<InputNumber min={1} max={65535} disabled={inheritSettings} />}
        />
      </FieldLabel>

      <FieldLabel width='200px'>
        {$t({ defaultMessage: 'Bandwidth:' })}
        <Form.Item
          name={['radioParamsDual5G', 'radioParamsUpper5G', 'channelBandwidth']}>
          <Select
            options={defaultChannelsData &&
              Object.keys(defaultChannelsData['5GUpperChannels']['dfs'])
                .map(item => ({ label: item === 'auto' ? item.toUpperCase() : item, value: item }))}
            defaultValue={'auto'}
            disabled={inheritSettings}
          />
        </Form.Item>
      </FieldLabel>

      <FieldLabel width='200px'>
        {$t({ defaultMessage: 'Transmit Power adjustment:' })}
        <Form.Item
          name={['radioParamsDual5G', 'radioParamsUpper5G', 'txPower']}>
          <Select
            options={txPowerAdjustmentOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={txPowerAdjustmentOptions[1].value}
            disabled={inheritSettings}
          />
        </Form.Item>
      </FieldLabel>

      <div>{$t({ defaultMessage: 'Channel selection:' })}</div>

      <div>
        {
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Selected channels will be available for radio broadcasting in this venue. Hover to see overlapping channels' })
        }
      </div>

      <div>
        <div>{$t({ defaultMessage: 'Indoor Aps' })}</div>
        <RadioSettingsChannels
          formName={['radioParamsDual5G', 'radioParamsUpper5G', 'allowedIndoorChannels']}
          groupSize={groupSize}
          channelList={defaultIndoorChannels.map(item =>
            ({ value: item, selected: false }))}
          displayBarSettings={['5G', 'DFS']}
          channelBars={channelBars}
          disabled={inheritSettings}
        />
      </div>

      <div>
        <div>{$t({ defaultMessage: 'Outdoor Aps' })}</div>
        <RadioSettingsChannels
          formName={['radioParamsDual5G', 'radioParamsUpper5G', 'allowedOutdoorChannels']}
          groupSize={groupSize}
          channelList={defaultOutdoorChannels.map(item =>
            ({ value: item, selected: false }))}
          displayBarSettings={['5G', 'DFS']}
          channelBars={channelBars}
          disabled={inheritSettings}
        />
        <Form.Item
          name={['radioParamsDual5G', 'radioParamsUpper5G', 'combineChannels']}
          initialValue={false}
        >
          <Input type='hidden'></Input>
        </Form.Item>
      </div>
    </Space>
  )
}