import { useEffect, useState } from 'react'

import { Col, Form, Input, InputNumber, Radio, RadioChangeEvent, Row, Select, Slider } from 'antd'
import _                                                                               from 'lodash'
import { useIntl }                                                                     from 'react-intl'

import {
  useGetVenueRadioCustomizationQuery,
  useVenueDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import {
  ChannelBars,
  channelSelectionMethodsOptions,
  split5GChannels,
  txPowerAdjustmentOptions
} from '../contents'
import { RadioSettingsChannels } from '../RadioSettingsChannels'

const { useWatch } = Form

const defaultChannelBars: ChannelBars = {
  dfsChannels: [],
  lower5GChannels: [],
  upper5GChannels: []
}

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
  const [indoorChannelBars, setIndoorChannelBars] = useState<ChannelBars>(defaultChannelBars)
  const [outdoorChannelBars, setOutdoorChannelBars] = useState<ChannelBars>(defaultChannelBars)
  const [channelType, setChannelType] = useState<string>('auto')
  const [groupSize, setGroupSize] = useState<number>(1)

  const { data: defaultChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  const { allowedIndoorChannels, allowedOutdoorChannels } =
    useGetVenueRadioCustomizationQuery({ params: { tenantId, venueId } }, {
      selectFromResult ({ data }) {
        return {
          allowedIndoorChannels:
            data?.radioParamsDual5G?.radioParamsLower5G?.allowedIndoorChannels || [],
          allowedOutdoorChannels:
            data?.radioParamsDual5G?.radioParamsLower5G?.allowedOutdoorChannels || []
        }
      }
    })

  useEffect(() => {
    if (defaultChannelsData &&
        _.get(defaultChannelsData, '5GLowerChannels.indoor.auto')) {
      setDefaultIndoorChannels(
        defaultChannelsData['5GLowerChannels']['indoor']['auto']
      )
      setDefaultOutdoorChannels(
        defaultChannelsData['5GLowerChannels']['outdoor']['auto']
      )
    }
    if (defaultChannelsData && channelBandwidth &&
      _.get(defaultChannelsData, '5GLowerChannels.indoor.' + channelType)) {
      setChannelType(channelBandwidth === 'AUTO' ?
        channelBandwidth.toLowerCase() : channelBandwidth)

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

      const {
        lower5GChannels: indoorLower5GChannels,
        upper5GChannels: indoorUpper5GChannels
      } =
        split5GChannels(defaultChannelsData['5GLowerChannels']['indoor'][channelType])

      const {
        lower5GChannels: outdoorLower5GChannels,
        upper5GChannels: outdoorUpper5GChannels
      } =
        split5GChannels(defaultChannelsData['5GLowerChannels']['outdoor'][channelType])

      setIndoorChannelBars({
        dfsChannels: defaultChannelsData['5GLowerChannels']['dfs'][channelType],
        lower5GChannels: indoorLower5GChannels,
        upper5GChannels: indoorUpper5GChannels
      })

      setOutdoorChannelBars({
        dfsChannels: defaultChannelsData['5GLowerChannels']['dfs'][channelType],
        lower5GChannels: outdoorLower5GChannels,
        upper5GChannels: outdoorUpper5GChannels
      })
    }

    if(channelInheritSettings){
      setInheritSettings(channelInheritSettings)
    }

  }, [defaultChannelsData, channelBandwidth, channelInheritSettings, groupSize, channelType])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatter (value: any) {
    return `${value}%`
  }

  const on5GHzSettingChange = (e: RadioChangeEvent) => {
    setInheritSettings(e.target.value)
  }

  return (
    <>
      <Row gutter={20} data-testid='radio-l5g-tab'>
        <Col span={8}>
          <Form.Item
            label={$t({ defaultMessage: '5GHz settings:' })}
            name={['radioParamsDual5G', 'inheritParamsLower5G']}
          >
            <Radio.Group defaultValue={true} onChange={on5GHzSettingChange}>
              <Radio value={true}>
                {$t({ defaultMessage: 'Inherit from 5GHz' })}
              </Radio>

              <Radio value={false}>
                {$t({ defaultMessage: 'Custom Settings' })}
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Channel selection method:' })}
            name={['radioParamsDual5G', 'radioParamsLower5G', 'method']}>
            <Select
              options={channelSelectionMethodsOptions?.map(p =>
                ({ label: $t(p.label), value: p.value }))}
              defaultValue={channelSelectionMethodsOptions[1].value}
              disabled={inheritSettings}
            />
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Channel Change Frequency:' })}
            name={['radioParamsDual5G', 'radioParamsLower5G', 'changeInterval']}
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
            name={['radioParamsDual5G', 'radioParamsLower5G', 'scanInterval']}
            rules={[
              { required: true },
              { type: 'number', min: 1 },
              { type: 'number', max: 65535 }
            ]}
            initialValue={20}
            children={<InputNumber min={1} max={65535} disabled={inheritSettings} />}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Bandwidth:' })}
            name={['radioParamsDual5G', 'radioParamsLower5G', 'channelBandwidth']}>
            <Select
              options={defaultChannelsData &&
                _.get(defaultChannelsData, '5GLowerChannels.dfs') &&
                Object.keys(defaultChannelsData['5GLowerChannels']['dfs'])
                  .map(item => ({
                    label: item === 'auto' ? item.toUpperCase() : item, value: item
                  }))}
              defaultValue={'auto'}
              disabled={inheritSettings}
            />
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Transmit Power adjustment:' })}
            name={['radioParamsDual5G', 'radioParamsLower5G', 'txPower']}>
            <Select
              options={txPowerAdjustmentOptions?.map(p => ({ label: $t(p.label), value: p.value }))}
              defaultValue={txPowerAdjustmentOptions[1].value}
              disabled={inheritSettings}
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

          <div>
            <div>{$t({ defaultMessage: 'Indoor APs' })}</div>
            {defaultIndoorChannels &&
          <RadioSettingsChannels
            formName={['radioParamsDual5G', 'radioParamsLower5G', 'allowedIndoorChannels']}
            groupSize={groupSize}
            channelList={defaultIndoorChannels.map(item => ({
              value: item,
              selected: allowedIndoorChannels.includes(item)
            }))}
            displayBarSettings={['5G', 'DFS']}
            channelBars={indoorChannelBars}
            disabled={inheritSettings}
          />
            }
          </div>

          <div>
            <div>{$t({ defaultMessage: 'Outdoor APs' })}</div>
            {defaultOutdoorChannels &&
          <RadioSettingsChannels
            formName={['radioParamsDual5G', 'radioParamsLower5G', 'allowedOutdoorChannels']}
            groupSize={groupSize}
            channelList={defaultOutdoorChannels.map(item => ({
              value: item,
              selected: allowedOutdoorChannels.includes(item)
            }))}
            displayBarSettings={['5G', 'DFS']}
            channelBars={outdoorChannelBars}
            disabled={inheritSettings}
          />
            }
            <Form.Item
              name={['radioParamsDual5G', 'radioParamsLower5G', 'combineChannels']}
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
