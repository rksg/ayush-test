import { useEffect, useState } from 'react'

import { Col, Form, Row, Select, Slider, Switch } from 'antd'
import _                                          from 'lodash'
import { useIntl }                                from 'react-intl'

import { RadioSettingsChannels }           from '@acx-ui/rc/components'
import {
  useGetApRadioQuery,
  useGetVenueRadioCustomizationQuery,
  useVenueDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import { ApEditContext }     from '../../..'
import {
  channelSelectionMethodsOptions,
  txPowerAdjustmentOptions
} from '../contents'
import { ChannelBars, split5GChannels } from '../contents'
import { DisabledDiv }                  from '../styledComponents'

const { useWatch } = Form

const defaultChannelBars: ChannelBars = {
  dfsChannels: [],
  lower5GChannels: [],
  upper5GChannels: []
}

export function Radio5GHz (props: { venueId: string, serialNumber: string }) {
  const { $t } = useIntl()

  const { tenantId } = useParams()
  const form = Form.useFormInstance()
  const { venueId, serialNumber } = props
  const [defaultIndoorChannels, setDefaultIndoorChannels] = useState<string[]>([''])
  const [indoorChannelBars, setIndoorChannelBars] = useState<ChannelBars>(defaultChannelBars)
  const [channelType, setChannelType] = useState<string>('auto')
  const [groupSize, setGroupSize] = useState<number>(1)
  const [channelMethodLabel, setChannelMethodLabel] = useState<string>('')
  const [channelBandwidthLabel, setChannelBandwidthLabel] = useState<string>('')
  const [txPowerLabel, setTxPowerLabel] = useState<string>('')

  const [
    enable50G,
    channelMethod,
    channelBandwidth,
    useVenueSettings
  ] = [
    useWatch<boolean>('enable50G'),
    useWatch<string>(['radioParams50G', 'method']),
    useWatch<string>(['radioParams50G', 'channelBandwidth']),
    useWatch<boolean>('useVenueSettings')
  ]

  const { data: defaultChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  const { venueData, allowedVenueChannels } =
    useGetVenueRadioCustomizationQuery({ params: { tenantId, venueId } }, {
      selectFromResult ({ data }) {
        return {
          venueData: data?.radioParams50G,
          allowedVenueChannels: data?.radioParams50G?.allowedIndoorChannels || []
        }
      }
    })

  const { allowedChannels } =
    useGetApRadioQuery({ params: { tenantId, serialNumber } }, {
      selectFromResult ({ data }) {
        return {
          allowedChannels: data?.apRadioParams50G?.allowedChannels || []
        }
      }
    })

  useEffect(() => {
    if(defaultChannelsData){
      setDefaultIndoorChannels(
        defaultChannelsData['5GChannels']['indoor'][channelType]
      )
    }

    if (defaultChannelsData && venueData?.channelBandwidth){
      setChannelType(venueData?.channelBandwidth === 'AUTO' ?
        venueData?.channelBandwidth.toLowerCase() : venueData?.channelBandwidth)

      setDefaultIndoorChannels(
        // eslint-disable-next-line max-len
        defaultChannelsData['5GChannels']['indoor'][channelType]
      )

      switch(venueData?.channelBandwidth){
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

      setIndoorChannelBars({
        dfsChannels: defaultChannelsData['5GChannels']['dfs'][channelType],
        lower5GChannels: indoorLower5GChannels,
        upper5GChannels: indoorUpper5GChannels
      })
    }

    if(allowedChannels.length > 0){
      form.setFieldValue(['radioParams50G', 'allowedChannels'], allowedChannels)
    }else if(allowedVenueChannels){
      form.setFieldValue(['radioParams50G', 'allowedIndoorChannels'], allowedVenueChannels)
    }

    if(venueData){
      const channelMethodObject = channelSelectionMethodsOptions
        .filter(p => p.value === venueData?.method)
      if(channelMethodObject.length > 0){
        setChannelMethodLabel(Object.values(channelMethodObject[0].label.defaultMessage[0])[1])
      }

      if(defaultChannelsData){
        const channelBandwidthObject = Object.keys(defaultChannelsData['2.4GChannels'])
          .filter(p => p.toUpperCase() === venueData?.channelBandwidth.toUpperCase())
        if(channelBandwidthObject.length > 0){
          setChannelBandwidthLabel(_.upperFirst(channelBandwidthObject[0]))
        }
      }

      const channelTxPowerObject = txPowerAdjustmentOptions
        .filter(p => p.value === venueData?.txPower)
      if(channelTxPowerObject.length > 0){
        setTxPowerLabel(Object.values(channelTxPowerObject[0].label.defaultMessage[0])[1])
      }
    }
  }, [defaultChannelsData, channelBandwidth,
    allowedChannels, allowedVenueChannels, venueData])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatter (value: any) {
    return `${value}%`
  }

  const onChange = (value: boolean, fieldName: string) => {
    form.setFieldValue(fieldName, value)
  }

  return (
    <>
      <Row gutter={20} data-testid='radio-5g-tab'>
        <Col span={8}>
          <Form.Item
            name={['enable50G']}
            label='Enable 5.0 GHz band:'
            valuePropName='checked'
            style={{ marginTop: '16px' }}
            initialValue={true}
            children={useVenueSettings ? <span>{enable50G ? 'On':'Off'}</span>
              :<Switch onChange={(checked)=>onChange(checked, 'enable50G')} />}
          />
          {enable50G && <>
            <Form.Item
              label={$t({ defaultMessage: 'Channel selection method:' })}
              name={['radioParams50G', 'method']}>
              { useVenueSettings ?
                <span>{channelMethodLabel}</span>
                :
                <Select
                  options={channelSelectionMethodsOptions?.map(p =>
                    ({ label: $t(p.label), value: p.value }))}
                  defaultValue={channelSelectionMethodsOptions[1].value}
                />
              }
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Channel Change Frequency:' })}
              name={['radioParams50G', 'changeInterval']}
              style={{ display: (!useVenueSettings &&
                channelMethod === channelSelectionMethodsOptions[0].value)
                || (useVenueSettings &&
                  venueData?.method === channelSelectionMethodsOptions[0].value) ?
                'block' : 'none' }}
            >
              <Slider
                tipFormatter={formatter}
                style={{ width: '240px' }}
                defaultValue={33}
                min={1}
                max={100}
                disabled={useVenueSettings}
                marks={{ 1: '1%', 100: '100%' }}
              />
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Bandwidth:' })}
              name={['radioParams50G', 'channelBandwidth']}>
              {useVenueSettings ?
                <span>{channelBandwidthLabel}</span>
                :
                <Select
                  options={defaultChannelsData &&
                    _.get(defaultChannelsData, '5GChannels.dfs') &&
                Object.keys(defaultChannelsData['5GChannels']['dfs'])
                  .map(item => ({ label: item === 'auto' ? _.upperFirst(item) : item,
                    value: item === 'auto' ? item.toUpperCase() : item }))}
                  defaultValue={'AUTO'}
                />
              }
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Transmit Power adjustment:' })}
              name={['radioParams50G', 'txPower']}>
              {useVenueSettings ?
                <span>{txPowerLabel}</span>
                :
                <Select
                  options={txPowerAdjustmentOptions?.map(p =>
                    ({ label: $t(p.label), value: p.value }))}
                  defaultValue={txPowerAdjustmentOptions[1].value}
                />
              }
            </Form.Item>
          </>
          }
        </Col>
      </Row>
      {enable50G &&
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
            { defaultIndoorChannels &&
          <RadioSettingsChannels
            formName={['radioParams50G', 'allowedChannels']}
            groupSize={groupSize}
            channelList={defaultIndoorChannels.map(item => ({
              value: item,
              selected: allowedChannels?.includes(item)
            }))}
            displayBarSettings={['5G', 'DFS']}
            channelBars={indoorChannelBars}
            disabled={useVenueSettings}
            editContext={ApEditContext}
          />
            }
          </div>
        </Col>
      </Row>
      }
      {!enable50G &&
        <DisabledDiv>
          {$t({ defaultMessage: '5.0 GHz Radio is disabled' })}
        </DisabledDiv>
      }
    </>
  )
}
