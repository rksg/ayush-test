import { useEffect, useState } from 'react'

import { Form, Input, InputNumber, Select, Slider, Space } from 'antd'
import { useIntl }                                         from 'react-intl'

import {
  useGetVenueRadioCustomizationQuery,
  useVenueDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import {
  channelSelectionMethodsOptions,
  txPowerAdjustmentOptions
} from '../contents'
import { RadioSettingsChannels } from '../RadioSettingsChannels'
import { FieldLabel }            from '../styledComponents'

const { useWatch } = Form

export function Radio6GHz () {
  const { $t } = useIntl()

  const { tenantId, venueId } = useParams()
  const [defaultChannels, setDefaultChannels] = useState<string[]>([''])
  const [groupSize, setGroupSize] = useState<number>(1)

  const [
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<string>(['radioParams6G', 'method']),
    useWatch<string>(['radioParams6G', 'channelBandwidth'])
  ]

  const { data: defaultChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  const { allowedChannels } =
    useGetVenueRadioCustomizationQuery({ params: { tenantId, venueId } }, {
      selectFromResult ({ data }) {
        return {
          allowedChannels: data?.radioParams6G?.allowedChannels || []
        }
      }
    })

  useEffect(() => {
    const channelType = channelBandwidth === 'AUTO' ?
      channelBandwidth.toLowerCase() : channelBandwidth
    if(defaultChannelsData){
      setDefaultChannels(defaultChannelsData['6GChannels'][channelType])
    }

    if(defaultChannelsData && channelBandwidth){
      setDefaultChannels(defaultChannelsData['6GChannels'][channelType])
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
  }, [defaultChannelsData, channelBandwidth, groupSize])

  function formatter (value: any) {
    return `${value}%`
  }

  const channelBars = {
    dfsChannels: [],
    lower5GChannels: [],
    upper5GChannels: []
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
      <FieldLabel
        width='200px'
        style={{ display: channelMethod === channelSelectionMethodsOptions[0].value ?
          'block' : 'none' }}
      >
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
            options={defaultChannelsData &&
              Object.keys(defaultChannelsData['6GChannels'])
                .map(item => ({ label: item === 'auto' ? item.toUpperCase() : item, value: item }))}
            defaultValue={'auto'}
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
        {defaultChannels &&
          <RadioSettingsChannels
            formName={['radioParams6G', 'allowedChannels']}
            groupSize={groupSize}
            channelList={defaultChannels.map(item => ({
              value: item,
              selected: allowedChannels?.includes(item)
            }))}
            displayBarSettings={[]}
            channelBars={channelBars}
            disabled={false}
          />
        }
        <Form.Item
          name={['radioParams6G', 'bssMinRate6G']}
          initialValue={'HE_MCS_0'}
        >
          <Input type='hidden'></Input>
        </Form.Item>
        <Form.Item
          name={['radioParams6G', 'mgmtTxRate6G']}
          initialValue={'6'}
        >
          <Input type='hidden'></Input>
        </Form.Item>
      </div>
    </Space>
  )
}