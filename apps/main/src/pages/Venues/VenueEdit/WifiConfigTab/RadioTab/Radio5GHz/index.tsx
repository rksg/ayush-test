import { useEffect, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Select, Slider, Space } from 'antd'
import { useIntl }                                                   from 'react-intl'

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

export function Radio5GHz () {
  const { $t } = useIntl()

  const { tenantId, venueId } = useParams()
  const [defaultIndoorChannels, setDefaultIndoorChannels] = useState<string[]>([''])
  const [defaultOutdoorChannels, setDefaultOutdoorChannels] = useState<string[]>([''])
  const [groupSize, setGroupSize] = useState<number>(1)


  const [
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<string>(['radioParams50G', 'method']),
    useWatch<string>(['radioParams50G', 'channelBandwidth'])
  ]

  const { data: defaultChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  const channelType = channelBandwidth === 'AUTO' ?
    channelBandwidth.toLowerCase() : channelBandwidth

  useEffect(() => {
    if(defaultChannelsData){
      setDefaultIndoorChannels(
        defaultChannelsData['5GChannels']['indoor'][channelType]
      )
      setDefaultOutdoorChannels(
        defaultChannelsData['5GChannels']['outdoor'][channelType]
      )
    }
    if(defaultChannelsData && channelBandwidth){
      setDefaultIndoorChannels(
        // eslint-disable-next-line max-len
        defaultChannelsData['5GChannels']['indoor'][channelType]
      )
      setDefaultOutdoorChannels(
        // eslint-disable-next-line max-len
        defaultChannelsData['5GChannels']['outdoor'][channelType]
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
  }, [defaultChannelsData, channelBandwidth])

  function formatter (value: any) {
    return `${value}%`
  }

  const channelBars = {
    dfsChannels: defaultChannelsData && defaultChannelsData['5GChannels']['dfs'][channelType] || [],
    lower5GChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
    upper5GChannels: ['100', '104', '108', '112', '116', '120', '124',
      '128', '132', '136', '140', '144', '149', '153', '157', '161']
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
            options={defaultChannelsData &&
              Object.keys(defaultChannelsData['5GChannels']['dfs'])
                .map(item => ({ label: item === 'auto' ? item.toUpperCase() : item, value: item }))}
            defaultValue={'auto'}
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
        { defaultIndoorChannels &&
          <RadioSettingsChannels
            formName={['radioParams50G', 'allowedIndoorChannels']}
            groupSize={groupSize}
            channelList={defaultIndoorChannels.map(item =>
              ({ value: item, selected: false }))}
            displayBarSettings={['5G', 'DFS']}
            channelBars={channelBars}
            disabled={false}
          />
        }
      </div>

      <div>
        <div>{$t({ defaultMessage: 'Outdoor Aps' })}</div>
        {defaultOutdoorChannels &&
          <RadioSettingsChannels
            formName={['radioParams50G', 'allowedOutdoorChannels']}
            groupSize={groupSize}
            channelList={defaultOutdoorChannels.map(item =>
              ({ value: item, selected: false }))}
            displayBarSettings={['5G', 'DFS']}
            channelBars={channelBars}
            disabled={false}
          />
        }
        <Form.Item
          name={['radioParams50G', 'combineChannels']}
          initialValue={false}
        >
          <Input type='hidden'></Input>
        </Form.Item>
      </div>
    </Space>
  )
}