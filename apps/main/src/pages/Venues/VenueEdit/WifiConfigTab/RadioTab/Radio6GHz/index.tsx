import { useEffect, useState } from 'react'

import { Checkbox, Form, InputNumber, Select, Slider, Space } from 'antd'
import { useIntl }                                            from 'react-intl'

import { useVenueDefaultRegulatoryChannelsQuery } from '@acx-ui/rc/services'
import { useParams }                              from '@acx-ui/react-router-dom'

import {
  channelSelectionMethodsOptions,
  channelBandwidth6GOptions,
  txPowerAdjustmentOptions
} from '../contents'
import { FieldLabel, MultiSelect } from '../styledComponents'

const { useWatch } = Form

export function Radio6GHz () {
  const { $t } = useIntl()

  const { tenantId, venueId } = useParams()
  const [defaultChannels, setDefaultChannels] = useState<string[]>([''])

  const [
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<string>(['radioParams6G', 'method']),
    useWatch<string>(['radioParams6G', 'channelBandwidth'])
  ]

  const { data: defaultChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  useEffect(() => {
    if(defaultChannelsData){
      setDefaultChannels(defaultChannelsData['6GChannels']['auto'])
    }

    if(defaultChannelsData && channelBandwidth){
      const channelType = channelBandwidth === 'AUTO' ?
        channelBandwidth.toLowerCase() : channelBandwidth
      setDefaultChannels(defaultChannelsData['6GChannels'][channelType])
    }
  }, [defaultChannelsData, channelBandwidth])

  function formatter (value: any) {
    return `${value}%`
  }
  return (
    <Space direction='vertical'
      size='middle'
      style={{
        display: 'flex'
      }}>
      <FieldLabel width='200px'>
        { $t({ defaultMessage: 'Channel selection method:' }) }
        <Form.Item
          name={['radioParams6G', 'method']}>
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
          name={['radioParams6G', 'changeInterval']}
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
          name={['radioParams6G', 'scanInterval']}
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
          name={['radioParams6G', 'channelBandwidth']}>
          <Select
            options={channelBandwidth6GOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={channelBandwidth6GOptions[0].value}
          />
        </Form.Item>
      </FieldLabel>

      <FieldLabel width='200px'>
        {$t({ defaultMessage: 'Transmit Power adjustment:' })}
        <Form.Item
          name={['radioParams6G', 'txPower']}>
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
        <MultiSelect>
          <Form.Item
            initialValue={[]}
            name={['radioParams6G', 'allowedChannels']}
            children={
              <Checkbox.Group
                options={defaultChannels}
              />
            }
          />
        </MultiSelect>
      </div>
    </Space>
  )
}