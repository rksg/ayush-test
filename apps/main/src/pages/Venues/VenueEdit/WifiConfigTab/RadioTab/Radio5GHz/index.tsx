import { useEffect, useState } from 'react'

import { Checkbox, Form, InputNumber, Select, Slider, Space } from 'antd'
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

export function Radio5GHz () {
  const { $t } = useIntl()

  const { tenantId, venueId } = useParams()
  const [defaultIndoorChannels, setDefaultIndoorChannels] = useState<string[]>([''])
  const [defaultOutdoorChannels, setDefaultOutdoorChannels] = useState<string[]>([''])


  const [
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<string>(['radioParams50G', 'method']),
    useWatch<string>(['radioParams50G', 'channelBandwidth'])
  ]

  const { data: defaultIndoorChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  useEffect(() => {
    if(defaultIndoorChannelsData){
      setDefaultIndoorChannels(
        defaultIndoorChannelsData['5GChannels']['indoor']['auto']
      )
      setDefaultOutdoorChannels(
        defaultIndoorChannelsData['5GChannels']['outdoor']['auto']
      )
    }
    if(defaultIndoorChannelsData && channelBandwidth){
      const channelType = channelBandwidth === 'AUTO' ?
        channelBandwidth.toLowerCase() : channelBandwidth
      setDefaultIndoorChannels(
        // eslint-disable-next-line max-len
        defaultIndoorChannelsData['5GChannels']['indoor'][channelType]
      )
      setDefaultOutdoorChannels(
        // eslint-disable-next-line max-len
        defaultIndoorChannelsData['5GChannels']['outdoor'][channelType]
      )
    }
  }, [defaultIndoorChannelsData, channelBandwidth])

  function formatter (value: any) {
    return `${value}%`
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <FieldLabel width='200px'>
        { $t({ defaultMessage: 'Channel selection method:' }) }
        <Form.Item
          name={['radioParams50G', 'method']}>
          <Select
            options={channelSelectionMethodsOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={channelSelectionMethodsOptions[1].value}
          />
        </Form.Item>
      </FieldLabel>
      { channelMethod === channelSelectionMethodsOptions[0].value &&
      <FieldLabel width='200px'>
        { $t({ defaultMessage: 'Channel Change Frequency:' }) }
        <Form.Item
          name={['radioParams50G', 'changeInterval']}
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
          name={['radioParams50G', 'scanInterval']}
          rules={[
            { required: true },
            { type: 'number', min: 1 },
            { type: 'number', max: 65535 }
          ]}
          initialValue={20}
          children={<InputNumber min={1} max={65535} />}
        />
      </FieldLabel>

      <FieldLabel width='200px'>
        {$t({ defaultMessage: 'Bandwidth:' })}
        <Form.Item
          name={['radioParams50G', 'channelBandwidth']}>
          <Select
            options={channelBandwidth50GOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={channelBandwidth50GOptions[0].value}
          />
        </Form.Item>
      </FieldLabel>

      <FieldLabel width='200px'>
        {$t({ defaultMessage: 'Transmit Power adjustment:' })}
        <Form.Item
          name={['radioParams50G', 'txPower']}>
          <Select
            options={txPowerAdjustmentOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={txPowerAdjustmentOptions[1].value}
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
            name={['radioParams50G', 'allowedIndoorChannels']}
            children={
              <Checkbox.Group
                options={defaultIndoorChannels}
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
            name={['radioParams50G', 'allowedOutdoorChannels']}
            children={
              <Checkbox.Group
                options={defaultOutdoorChannels}
              />
            }
          />
        </MultiSelect>
      </div>
    </Space>
  )
}