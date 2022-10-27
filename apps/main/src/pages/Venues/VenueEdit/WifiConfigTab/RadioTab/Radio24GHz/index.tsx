import { useEffect, useState } from 'react'

import { Col, Form, InputNumber, Row, Select, Slider } from 'antd'
import { useIntl }                                     from 'react-intl'

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


const { useWatch } = Form

export function Radio24GHz () {
  const { $t } = useIntl()

  const { tenantId, venueId } = useParams()
  const [defaultChannels, setDefaultChannels] = useState<string[]>([''])

  const [
    channelMethod,
    channelBandwidth
  ] = [
    useWatch<string>(['radioParams24G', 'method']),
    useWatch<string>(['radioParams24G', 'channelBandwidth'])
  ]

  const { data: defaultChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  const { allowedChannels } =
    useGetVenueRadioCustomizationQuery({ params: { tenantId, venueId } }, {
      selectFromResult ({ data }) {
        return {
          allowedChannels: data?.radioParams24G?.allowedChannels || []
        }
      }
    })


  useEffect(() => {
    if(defaultChannelsData){
      setDefaultChannels(defaultChannelsData['2.4GChannels']['20MHz'])
    }

    if(defaultChannelsData && channelBandwidth){
      const channelType = channelBandwidth === 'AUTO' ?
        channelBandwidth.toLowerCase() : channelBandwidth
      setDefaultChannels(
        defaultChannelsData['2.4GChannels'][channelType]
      )
    }
  }, [defaultChannelsData, channelBandwidth])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatter (value: any) {
    return `${value}%`
  }

  const channelBars = {
    dfsChannels: [],
    lower5GChannels: [],
    upper5GChannels: []
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={8}>
          <Form.Item
            label={$t({ defaultMessage: 'Channel selection method:' })}
            name={['radioParams24G', 'method']}>
            <Select
              options={channelSelectionMethodsOptions?.map(p =>
                ({ label: $t(p.label), value: p.value }))}
              defaultValue={channelSelectionMethodsOptions[1].value}
            />
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Channel Change Frequency:' })}
            name={['radioParams24G', 'changeInterval']}
            style={{ display: channelMethod === channelSelectionMethodsOptions[0].value ?
              'block' : 'none' }}
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
          <Form.Item
            label={$t({ defaultMessage: 'Run background scan every:' })}
            name={['radioParams24G', 'scanInterval']}
            rules={[
              { required: true },
              { type: 'number', min: 1 },
              { type: 'number', max: 65535 }
            ]}
            initialValue={20}
            children={<InputNumber min={1} max={65535} />}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Bandwidth:' })}
            name={['radioParams24G', 'channelBandwidth']}>
            <Select
              options={defaultChannelsData &&
                defaultChannelsData['2.4GChannels'] &&
            Object.keys(defaultChannelsData['2.4GChannels'])
              .map(item => ({ label: item === 'auto' ? item.toUpperCase() : item, value: item }))}
              defaultValue={'auto'}
            />
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Transmit Power adjustment:' })}
            name={['radioParams24G', 'txPower']}>
            <Select
              options={txPowerAdjustmentOptions?.map(p => ({ label: $t(p.label), value: p.value }))}
              defaultValue={txPowerAdjustmentOptions[1].value}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={14}>
          <div>{$t({ defaultMessage: 'Channel selection:' })}</div>

          <div>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Selected channels will be available for radio broadcasting in this venue. Hover to see overlapping channels' })
            }
          </div>
          {defaultChannels &&
        <RadioSettingsChannels
          formName={['radioParams24G', 'allowedChannels']}
          groupSize={1}
          channelList={defaultChannels.map(item => ({
            value: item,
            selected: allowedChannels?.includes(item)
          }))}
          displayBarSettings={[]}
          channelBars={channelBars}
          disabled={false}
        />
          }
        </Col>
      </Row>
    </>
  )
}