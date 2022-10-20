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
import { RadioSettingsChannels }   from '../RadioSettingsChannels'
import { FieldLabel, MultiSelect } from '../styledComponents'

const { useWatch } = Form

export function RadioLower5GHz () {
  const { $t } = useIntl()

  const [
    channelInheritSettings,
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<boolean>(['radioParamsDual5G', 'inheritParamsLower5G']),
    useWatch<string>(['radioParamsDual5G', 'radioParamsLower5G', 'method']),
    useWatch<string>(['radioParamsDual5G', 'radioParamsLower5G', 'channelBandwidth'])
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
        defaultChannelsData['5GLowerChannels']['indoor']['auto']
      )
      setDefaultOutdoorChannels(
        defaultChannelsData['5GLowerChannels']['outdoor']['auto']
      )
    }
    if(defaultChannelsData && channelBandwidth){
      setDefaultIndoorChannels(
        defaultChannelsData['5GLowerChannels']['indoor'][channelType]
      )
      setDefaultOutdoorChannels(
        defaultChannelsData['5GLowerChannels']['outdoor'][channelType]
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

  }, [defaultChannelsData, channelBandwidth, channelInheritSettings, defaultIndoorChannels])

  function formatter (value: any) {
    return `${value}%`
  }

  const on5GHzSettingChange = (e: RadioChangeEvent) => {
    setInheritSettings(e.target.value)
  }

  const channelBars = {
    dfsChannels: defaultChannelsData && defaultChannelsData['5GLowerChannels']['dfs'][channelType]
     || [],
    lower5GChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
    upper5GChannels: []
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      {$t({ defaultMessage: '5GHz settings:' })}
      <div style={{ paddingBottom: '2em' }}>
        <Form.Item
          name={['radioParamsDual5G', 'inheritParamsLower5G']}
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
          name={['radioParamsDual5G', 'radioParamsLower5G', 'method']}>
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
          name={['radioParamsDual5G', 'radioParamsLower5G', 'changeInterval']}
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
          name={['radioParamsDual5G', 'radioParamsLower5G', 'scanInterval']}
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
          name={['radioParamsDual5G', 'radioParamsLower5G', 'channelBandwidth']}>
          <Select
            options={defaultChannelsData &&
              Object.keys(defaultChannelsData['5GLowerChannels']['dfs'])
                .map(item => ({ label: item === 'auto' ? item.toUpperCase() : item, value: item }))}
            defaultValue={'auto'}
            disabled={inheritSettings}
          />
        </Form.Item>
      </FieldLabel>

      <FieldLabel width='200px'>
        {$t({ defaultMessage: 'Transmit Power adjustment:' })}
        <Form.Item
          name={['radioParamsDual5G', 'radioParamsLower5G', 'txPower']}>
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
          formName={['radioParamsDual5G', 'radioParamsLower5G', 'allowedIndoorChannels']}
          groupSize={groupSize}
          channelList={defaultIndoorChannels.map(item =>
            ({ value: item, selected: false }))}
          displayBarSettings={['5G', 'DFS']}
          channelBars={channelBars}
          disabled={inheritSettings}
        />
      </div>

      <div style={{ marginTop: '50px' }}>
        <div>{$t({ defaultMessage: 'Outdoor Aps' })}</div>
        <RadioSettingsChannels
          formName={['radioParamsDual5G', 'radioParamsLower5G', 'allowedOutdoorChannels']}
          groupSize={groupSize}
          channelList={defaultOutdoorChannels.map(item =>
            ({ value: item, selected: false }))}
          displayBarSettings={['5G', 'DFS']}
          channelBars={channelBars}
          disabled={inheritSettings}
        />
        <Form.Item
          name={['radioParamsDual5G', 'radioParamsLower5G', 'combineChannels']}
          initialValue={false}
        >
          <Input type='hidden'></Input>
        </Form.Item>
      </div>
    </Space>
  )
}