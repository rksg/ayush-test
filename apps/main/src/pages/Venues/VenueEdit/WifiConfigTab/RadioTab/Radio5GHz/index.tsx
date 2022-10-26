import { useEffect, useState } from 'react'

import { Col, Form, Input, InputNumber, Row, Select, Slider } from 'antd'
import { useIntl }                                            from 'react-intl'

import {
  useGetVenueRadioCustomizationQuery,
  useVenueDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import {
  channelSelectionMethodsOptions,
  txPowerAdjustmentOptions
} from '../contents'
import { ChannelBars, split5GChannels } from '../contents'
import { RadioSettingsChannels }        from '../RadioSettingsChannels'

const { useWatch } = Form

const defaultChannelBars: ChannelBars = {
  dfsChannels: [],
  lower5GChannels: [],
  upper5GChannels: []
}

export function Radio5GHz () {
  const { $t } = useIntl()

  const { tenantId, venueId } = useParams()
  const [defaultIndoorChannels, setDefaultIndoorChannels] = useState<string[]>([''])
  const [defaultOutdoorChannels, setDefaultOutdoorChannels] = useState<string[]>([''])
  const [indoorChannelBars, setIndoorChannelBars] = useState<ChannelBars>(defaultChannelBars)
  const [outdoorChannelBars, setOutdoorChannelBars] = useState<ChannelBars>(defaultChannelBars)
  const [channelType, setChannelType] = useState<string>('auto')
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

  const { allowedIndoorChannels, allowedOutdoorChannels } =
    useGetVenueRadioCustomizationQuery({ params: { tenantId, venueId } }, {
      selectFromResult ({ data }) {
        return {
          allowedIndoorChannels: data?.radioParams50G?.allowedIndoorChannels || [],
          allowedOutdoorChannels: data?.radioParams50G?.allowedOutdoorChannels || []
        }
      }
    })

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
      setChannelType(channelBandwidth === 'AUTO' ?
        channelBandwidth.toLowerCase() : channelBandwidth)

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

      const {
        lower5GChannels: indoorLower5GChannels,
        upper5GChannels: indoorUpper5GChannels
      } =
        split5GChannels(defaultChannelsData['5GChannels']['indoor'][channelType])

      const {
        lower5GChannels: outdoorLower5GChannels,
        upper5GChannels: outdoorUpper5GChannels
      } =
        split5GChannels(defaultChannelsData['5GChannels']['outdoor'][channelType])

      setIndoorChannelBars({
        dfsChannels: defaultChannelsData['5GChannels']['dfs'][channelType],
        lower5GChannels: indoorLower5GChannels,
        upper5GChannels: indoorUpper5GChannels
      })

      setOutdoorChannelBars({
        dfsChannels: defaultChannelsData['5GChannels']['dfs'][channelType],
        lower5GChannels: outdoorLower5GChannels,
        upper5GChannels: outdoorUpper5GChannels
      })
    }
  }, [defaultChannelsData, channelBandwidth, groupSize, channelType])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatter (value: any) {
    return `${value}%`
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={8}>
          <Form.Item
            label={$t({ defaultMessage: 'Channel selection method:' })}
            name={['radioParams50G', 'method']}>
            <Select
              options={channelSelectionMethodsOptions?.map(p =>
                ({ label: $t(p.label), value: p.value }))}
              defaultValue={channelSelectionMethodsOptions[1].value}
            />
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Channel Change Frequency:' })}
            name={['radioParams50G', 'changeInterval']}
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
            name={['radioParams50G', 'scanInterval']}
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
            name={['radioParams50G', 'channelBandwidth']}>
            <Select
              options={defaultChannelsData &&
            Object.keys(defaultChannelsData['5GChannels']['dfs'])
              .map(item => ({ label: item === 'auto' ? item.toUpperCase() : item, value: item }))}
              defaultValue={'auto'}
            />
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Transmit Power adjustment:' })}
            name={['radioParams50G', 'txPower']}>
            <Select
              options={txPowerAdjustmentOptions?.map(p => ({ label: $t(p.label), value: p.value }))}
              defaultValue={txPowerAdjustmentOptions[1].value}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={24}>
          <div>{$t({ defaultMessage: 'Channel selection:' })}</div>

          <div>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Selected channels will be available for radio broadcasting in this venue. Hover to see overlapping channels' })
            }
          </div>

          <div>
            <div>{$t({ defaultMessage: 'Indoor APs' })}</div>
            { defaultIndoorChannels &&
          <RadioSettingsChannels
            formName={['radioParams50G', 'allowedIndoorChannels']}
            groupSize={groupSize}
            channelList={defaultIndoorChannels.map(item => ({
              value: item,
              selected: allowedIndoorChannels?.includes(item)
            }))}
            displayBarSettings={['5G', 'DFS']}
            channelBars={indoorChannelBars}
            disabled={false}
          />
            }
          </div>

          <div>
            <div>{$t({ defaultMessage: 'Outdoor APs' })}</div>
            {defaultOutdoorChannels &&
          <RadioSettingsChannels
            formName={['radioParams50G', 'allowedOutdoorChannels']}
            groupSize={groupSize}
            channelList={defaultOutdoorChannels.map(item => ({
              value: item,
              selected: allowedOutdoorChannels?.includes(item)
            }))}
            displayBarSettings={['5G', 'DFS']}
            channelBars={outdoorChannelBars}
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
        </Col>
      </Row>
    </>
  )
}