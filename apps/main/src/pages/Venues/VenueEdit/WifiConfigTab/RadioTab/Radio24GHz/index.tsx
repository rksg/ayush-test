import { useContext, useEffect, useState } from 'react'

import { Checkbox, Form, InputNumber, Select, Slider, Space } from 'antd'
import { useIntl }                                            from 'react-intl'

import {
  useVenueDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import { VenueEditContext }  from '../../..'
import {
  channelSelectionMethodsOptions,
  channelBandwidth24GOptions,
  txPowerAdjustmentOptions
} from '../contents'
import { FieldLabel, MultiSelect } from '../styledComponents'

const { useWatch } = Form

export function Radio24GHz () {
  const { $t } = useIntl()

  const { tenantId, venueId } = useParams()
  const [validChannels, setValidChannels] = useState<string[]>([''])

  const [
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<string>(['radioParams24G', 'method']),
    useWatch<string>(['radioParams24G', 'channelBandwidth'])
  ]

  const { data: validChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })


  useEffect(() => {
    if(validChannelsData){
      setValidChannels(validChannelsData['2.4GChannels']['20MHz'])
    }

    if(validChannelsData && channelBandwidth){
      const channelType = channelBandwidth === 'AUTO' ?
        channelBandwidth.toLowerCase() : channelBandwidth
      setValidChannels(
        validChannelsData['2.4GChannels'][channelType]
      )
    }
  }, [validChannelsData, channelBandwidth])

  function formatter (value: any) {
    return `${value}%`
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <FieldLabel width='200px'>
        { $t({ defaultMessage: 'Channel selection method:' }) }
        <Form.Item
          name={['radioParams24G', 'method']}>
          <Select
            options={channelSelectionMethodsOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={channelSelectionMethodsOptions[1].value}
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
          name={['radioParams24G', 'changeInterval']}
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
          name={['radioParams24G', 'scanInterval']}
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
          name={['radioParams24G', 'channelBandwidth']}>
          <Select
            options={channelBandwidth24GOptions?.map(p => ({ label: p.label, value: p.value }))}
            defaultValue={channelBandwidth24GOptions[0].value}
          />
        </Form.Item>
      </FieldLabel>
      <FieldLabel width='200px'>
        {$t({ defaultMessage: 'Transmit Power adjustment:' })}
        <Form.Item
          name={['radioParams24G', 'txPower']}>
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
      <FieldLabel width='25px'>
        <MultiSelect>
          <Form.Item
            name={['radioParams24G', 'allowedChannels']}
            children={
              <Checkbox.Group
                options={validChannels.map(item => ({ label: item, value: item }))}
              />
            }
          />
        </MultiSelect>
      </FieldLabel>
    </Space>
  )
}