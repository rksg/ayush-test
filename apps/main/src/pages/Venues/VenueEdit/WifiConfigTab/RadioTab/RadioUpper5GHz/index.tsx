import { useEffect, useState } from 'react'

import { Checkbox, Form, InputNumber, Radio, RadioChangeEvent, Select, Slider, Space } from 'antd'
import { useIntl }                                            from 'react-intl'

import { Button }                                 from '@acx-ui/components'
import { useVenueDefaultRegulatoryChannelsQuery } from '@acx-ui/rc/services'
import { useParams }                              from '@acx-ui/react-router-dom'

import {
  channelSelectionMethodsOptions,
  channelBandwidth50GOptions,
  txPowerAdjustmentOptions
} from '../contents'
import { FieldLabel, MultiSelect } from '../styledComponents'

const { useWatch } = Form

export function RadioUpper5GHz () {
  const { $t } = useIntl()

  const { tenantId, venueId } = useParams()
  const [inheritSettings, setInheritSettings] = useState<boolean>(true)
  const [defaultIndoorChannels, setDefaultIndoorChannels] = useState<string[]>([''])
  const [defaultOutdoorChannels, setDefaultOutdoorChannels] = useState<string[]>([''])


  const [
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<string>(['radioParamsDual5G', 'radioParamsUpper5G', 'method']),
    useWatch<string>(['radioParamsDual5G', 'radioParamsUpper5G', 'channelBandwidth'])
  ]

  const { data: defaultIndoorChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  useEffect(() => {
    if(defaultIndoorChannelsData){
      setDefaultIndoorChannels(
        defaultIndoorChannelsData['5GLowerChannels']['indoor']['auto']
      )
      setDefaultOutdoorChannels(
        defaultIndoorChannelsData['5GLowerChannels']['outdoor']['auto']
      )
    }
    if(defaultIndoorChannelsData && channelBandwidth){
      const channelType = channelBandwidth === 'AUTO' ?
        channelBandwidth.toLowerCase() : channelBandwidth
      setDefaultIndoorChannels(
        defaultIndoorChannelsData['5GLowerChannels']['indoor'][channelType]
      )
      setDefaultOutdoorChannels(
        defaultIndoorChannelsData['5GLowerChannels']['outdoor'][channelType]
      )
    }
  }, [defaultIndoorChannelsData, channelBandwidth])

  function formatter (value: any) {
    return `${value}%`
  }

  const on5GHzSettingChange = (e: RadioChangeEvent) => {
    setInheritSettings(e.target.value)
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div style={{ marginBottom: '50px' }}>
        {$t({ defaultMessage: '5GHz settings:' })}
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
      < hr />
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
      { channelMethod === channelSelectionMethodsOptions[0].value &&
      <FieldLabel width='200px'>
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
      }
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
            options={channelBandwidth50GOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={channelBandwidth50GOptions[0].value}
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
        <Form.Item noStyle name='indoorLower5G'>
          <Button
            type='link'
            onClick={() => {}}
          >
            {$t({ defaultMessage: 'Lower 5G' })}
          </Button>
        </Form.Item>
        <Form.Item noStyle name='indoorUpper5G'>
          <Button
            type='link'
            onClick={() => {}}
          >
            {$t({ defaultMessage: 'Upper 5G' })}
          </Button>
        </Form.Item>
        <Form.Item noStyle name='indoorDfs5G'>
          <Button
            type='link'
            onClick={() => {}}
          >
            {$t({ defaultMessage: 'DFS' })}
          </Button>
        </Form.Item>
        <MultiSelect>
          <Form.Item
            initialValue={[]}
            name={['radioParamsDual5G', 'radioParamsUpper5G', 'allowedIndoorChannels']}
            children={
              <Checkbox.Group
                options={defaultIndoorChannels}
                disabled={inheritSettings}
              />
            }
          />
        </MultiSelect>
      </div>

      <div style={{ marginTop: '100px' }}>
        <div>{$t({ defaultMessage: 'Outdoor Aps' })}</div>
        <Form.Item noStyle name='outdoorLower5G'>
          <Button
            type='link'
            onClick={() => {}}
          >
            {$t({ defaultMessage: 'Lower 5G' })}
          </Button>
        </Form.Item>
        <Form.Item noStyle name='outdoorUpper5G'>
          <Button
            type='link'
            onClick={() => {}}
          >
            {$t({ defaultMessage: 'Upper 5G' })}
          </Button>
        </Form.Item>
        <Form.Item noStyle name='dfsOutdoor'>
          <Button
            type='link'
            onClick={() => {}}
          >
            {$t({ defaultMessage: 'DFS' })}
          </Button>
        </Form.Item>
        <MultiSelect>
          <Form.Item
            initialValue={[]}
            name={['radioParamsDual5G', 'radioParamsUpper5G', 'allowedOutdoorChannels']}
            children={
              <Checkbox.Group
                options={defaultOutdoorChannels}
                disabled={inheritSettings}
              />
            }
          />
        </MultiSelect>
      </div>
    </Space>
  )
}