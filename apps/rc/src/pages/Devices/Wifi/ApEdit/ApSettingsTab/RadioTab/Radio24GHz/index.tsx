import { useEffect, useState } from 'react'

import { Col, Form, Row, Select, Slider, Switch } from 'antd'
import _                                          from 'lodash'
import { useIntl }                                from 'react-intl'

import { RadioSettingsChannels }           from '@acx-ui/rc/components'
import {
  useGetApRadioQuery,
  useGetApValidChannelQuery,
  useGetVenueRadioCustomizationQuery,
  useVenueDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import { ApEditContext }     from '../../..'
import {
  channelSelectionMethodsOptions,
  txPowerAdjustmentOptions
} from '../contents'
import { DisabledDiv } from '../styledComponents'

const { useWatch } = Form

export function Radio24GHz (props: { venueId: string, serialNumber: string }) {
  const { $t } = useIntl()

  const { tenantId } = useParams()
  const form = Form.useFormInstance()
  const { venueId, serialNumber } = props
  const [defaultChannels, setDefaultChannels] = useState<string[]>([''])
  const [channelMethodLabel, setChannelMethodLabel] = useState<string>('')
  const [channelBandwidthLabel, setChannelBandwidthLabel] = useState<string>('')
  const [txPowerLabel, setTxPowerLabel] = useState<string>('')

  const [
    enable24G,
    channelMethod,
    channelBandwidth,
    useVenueSettings
  ] = [
    useWatch<boolean>('enable24G'),
    useWatch<string>(['apRadioParams24G', 'method']),
    useWatch<string>(['apRadioParams24G', 'channelBandwidth']),
    useWatch<boolean>('useVenueSettings')
  ]

  const { data: defaultChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  const { venueData, allowedVenueChannels } =
  useGetVenueRadioCustomizationQuery({ params: { tenantId, venueId } }, {
    selectFromResult ({ data }) {
      return {
        venueData: data?.radioParams24G,
        allowedVenueChannels: data?.radioParams24G?.allowedChannels || []
      }
    }
  })

  const { allowedChannels } =
    useGetApRadioQuery({ params: { tenantId, serialNumber } }, {
      selectFromResult ({ data }) {
        return {
          allowedChannels: data?.apRadioParams24G?.allowedChannels || []
        }
      }
    })

  const { allowedAPChannels } =
    useGetApValidChannelQuery({ params: { tenantId, serialNumber } }, {
      selectFromResult ({ data }) {
        const channelType = channelBandwidth === 'AUTO' ?
          channelBandwidth.toLowerCase() : channelBandwidth
        return {
          allowedAPChannels: data?.['2.4GChannels'][channelType] || []
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

    if(useVenueSettings){
      form.setFieldValue(['apRadioParams24G', 'allowedChannels'], allowedVenueChannels)
    }else{
      if(allowedChannels.length > 0){
        form.setFieldValue(['apRadioParams24G', 'allowedChannels'], allowedChannels)
      }else{
        form.setFieldValue(['apRadioParams24G', 'allowedChannels'], allowedAPChannels)
      }
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
  }, [defaultChannelsData, channelBandwidth, allowedChannels, allowedAPChannels,
    allowedVenueChannels, venueData, useVenueSettings])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatter (value: any) {
    return `${value}%`
  }

  const channelBars = {
    dfsChannels: [],
    lower5GChannels: [],
    upper5GChannels: []
  }

  const onChange = (value: boolean, fieldName: string) => {
    form.setFieldValue(fieldName, value)
  }

  return (
    <>
      <Row gutter={20} data-testid='radio-24g-tab'>
        <Col span={8}>
          <Form.Item
            name={['enable24G']}
            label={$t({ defaultMessage: 'Enable 2.4 GHz band:' })}
            valuePropName='checked'
            style={{ marginTop: '16px' }}
            initialValue={true}
            children={useVenueSettings ? <span>{$t({ defaultMessage: 'On' })}</span>
              :<Switch onChange={(checked)=>onChange(checked, 'enable24G')} />
            }
          />
          {(enable24G || useVenueSettings) && <>
            <Form.Item
              label={$t({ defaultMessage: 'Channel selection method:' })}
              name={['apRadioParams24G', 'method']}>
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
              name={['apRadioParams24G', 'changeInterval']}
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
              name={['apRadioParams24G', 'channelBandwidth']}>
              {useVenueSettings ?
                <span>{channelBandwidthLabel}</span>
                :
                <Select
                  options={defaultChannelsData &&
                  defaultChannelsData['2.4GChannels'] &&
              Object.keys(defaultChannelsData['2.4GChannels'])
                .map(item => ({ label: item === 'auto' ? _.upperFirst(item) : item,
                  value: item === 'auto' ? item.toUpperCase() : item }))}
                  defaultValue={'auto'}
                />
              }
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Transmit Power adjustment:' })}
              name={['apRadioParams24G', 'txPower']}>
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
      {enable24G &&
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
          formName={['apRadioParams24G', 'allowedChannels']}
          groupSize={1}
          channelList={defaultChannels.map(item => ({
            value: item,
            selected: allowedChannels?.includes(item)
          }))}
          displayBarSettings={[]}
          channelBars={channelBars}
          disabled={useVenueSettings}
          editContext={ApEditContext}
        />
          }
        </Col>
      </Row>
      }
      {!enable24G && !useVenueSettings &&
        <DisabledDiv>
          {$t({ defaultMessage: '2.4 GHz Radio is disabled' })}
        </DisabledDiv>
      }
    </>
  )
}
