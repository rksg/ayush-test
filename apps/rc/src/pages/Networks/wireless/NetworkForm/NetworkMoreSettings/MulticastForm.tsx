/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import { ReactNode, CSSProperties, useEffect } from 'react'

import {
  Checkbox,
  Form,
  Switch,
  Slider,
  FormItemProps
} from 'antd'
import { useIntl } from 'react-intl'

import { Fieldset, Tooltip }      from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'

import * as UI from './styledComponents'

const { useWatch } = Form

export function MulticastForm () {

  const { $t } = useIntl()

  const enableMulticastRateLimitingFieldName = ['wlan', 'advancedCustomization', 'enableMulticastRateLimiting']
  const enableMulticastUpLimitFieldName = ['wlan', 'advancedCustomization', 'enableMulticastUplinkRateLimiting']
  const enableMulticastDownLimitFieldName = ['wlan', 'advancedCustomization', 'enableMulticastDownlinkRateLimiting']
  const enableMulticastFilterFieldName = ['wlan', 'advancedCustomization', 'multicastFilterEnabled']
  const [
    enableMulticastRateLimiting,
    enableMulticastUpLimit,
    enableMulticastDownLimit,
    enableMulticastFilter
  ] = [
    useWatch<boolean>(enableMulticastRateLimitingFieldName),
    useWatch<boolean>(enableMulticastUpLimitFieldName),
    useWatch<boolean>(enableMulticastDownLimitFieldName),
    useWatch<boolean>(enableMulticastFilterFieldName)
  ]

  const form = Form.useFormInstance()
  const getDownloadMaxValue = () => getDLMax(form.getFieldValue('bssMinimumPhyRate'))
  let multicastRateLimitingSwitch = false

  useEffect(() => {
    if(form.getFieldValue(enableMulticastUpLimitFieldName) || form.getFieldValue(enableMulticastDownLimitFieldName)) {
      multicastRateLimitingSwitch = true
    }
    form.setFieldValue(enableMulticastRateLimitingFieldName, multicastRateLimitingSwitch )
  }, [])

  const multicastRateLimitFlag = useIsSplitOn(Features.MULTICAST_RATE_LIMIT_TOGGLE)
  const multicastFilterFlag = useIsSplitOn(Features.WIFI_EDA_MULTICAST_FILTER_TOGGLE)
  const multicastFilterTooltipContent = (
    <div>
      <p>Drop all multicast or broadcast traffic from associated wireless clients,
        except for the following which is always allowed:</p>
      <ul style={{ paddingLeft: '40px' }}>
        <li>ARP request</li>
        <li>DHCPv4 request</li>
        <li>DHCPv6 request</li>
        <li>IPv6 NS</li>
        <li>IPv6 NA</li>
        <li>IPv6 RS</li>
        <li>IGMP</li>
        <li>MLD</li>
        <li>All unicast packets</li>
      </ul>
    </div>
  )

  const handleMulticastFilterOnChange = (checked: boolean) => {
    if (checked) {
      if (enableMulticastRateLimiting) {
        form.setFieldValue(enableMulticastRateLimitingFieldName, false)
      }
    }
  }

  const handleMulticastRateLimitingOnChange = (checked: boolean) => {
    if (checked) {
      if (enableMulticastFilter) {
        form.setFieldValue(enableMulticastFilterFieldName, false)
      }
    }
  }

  return (
    <>
      {multicastFilterFlag &&
          <UI.FieldLabel width='250px'>
            <div style={{ display: 'grid', gridTemplateColumns: '85px 100px auto' }}>
              {$t({ defaultMessage: 'Multicast Filter' })}
              <Tooltip.Question
              // eslint-disable-next-line max-len
                title={multicastFilterTooltipContent}
                placement='right'
              />
              <Form.Item
                name={['wlan', 'advancedCustomization', 'multicastFilterEnabled']}
                style={{ marginBottom: '10px' }}
                valuePropName='checked'
                initialValue={false}
                children={<Switch
                  data-testid='multicast-filter-enabled'
                  onChange={handleMulticastFilterOnChange}
                />}
              />
            </div>
          </UI.FieldLabel>
      }

      { multicastRateLimitFlag &&
        <>
          <UI.FieldLabel width='175px'>
            {$t({ defaultMessage: 'Multicast Rate Limiting' })}
            <Form.Item
              name={['wlan', 'advancedCustomization', 'enableMulticastRateLimiting']}
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={multicastRateLimitingSwitch}
            >
              <Switch onChange={handleMulticastRateLimitingOnChange} />
            </Form.Item>
          </UI.FieldLabel>

          {enableMulticastRateLimiting &&
          <>
            <FieldsetItem
              name={['wlan', 'advancedCustomization', 'multicastRateLimit5GField']}
              label={$t({ defaultMessage: '2.4 GHz & 5 GHz' })}
              initialValue={true}
              switchStyle={{ display: 'none' }}
              style={{ width: 'max-content', marginLeft: '-8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
                <UI.FormItemNoLabel
                  name={['wlan', 'advancedCustomization', 'enableMulticastUplinkRateLimiting']}
                  valuePropName='checked'
                  initialValue={false}
                  style={{ lineHeight: '50px' }}
                  children={
                    <Checkbox data-testid='enableMulticastUpLimit'
                      children={$t({ defaultMessage: 'Upload Limit' })} />}
                />
                {
                  enableMulticastUpLimit ?
                    <UI.FormItemNoLabel
                      name={['wlan', 'advancedCustomization', 'multicastUplinkRateLimiting']}
                      children={
                        <Slider
                          tooltipVisible={false}
                          style={{ width: '245px', marginRight: '10px' }}
                          defaultValue={20}
                          min={1}
                          max={100}
                          marks={{
                            1: { label: '1 Mbps' },
                            100: { label: '100 Mbps' }
                          }}
                        />
                      }
                    /> :
                    <Unlimited />
                }
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
                <UI.FormItemNoLabel
                  name={['wlan', 'advancedCustomization', 'enableMulticastDownlinkRateLimiting']}
                  valuePropName='checked'
                  initialValue={false}
                  style={{ lineHeight: '50px' }}
                  children={
                    <Checkbox data-testid='enableMulticastDownLimit'
                      children={<>
                        {$t({ defaultMessage: 'Download Limit' })}
                        <Tooltip.Question
                          title={$t({ defaultMessage: 'The multicast download rate limiting should remain below 50% of the BSS minimum rate' })}
                          placement='bottom' />
                      </>}
                    />}
                />
                {
                  enableMulticastDownLimit ?
                    <UI.FormItemNoLabel
                      name={['wlan', 'advancedCustomization', 'multicastDownlinkRateLimiting']}
                      children={
                        <Slider
                          tooltipVisible={false}
                          style={{ width: '245px', marginRight: '10px' }}
                          defaultValue={getDownloadMaxValue()}
                          min={1}
                          max={getDownloadMaxValue()}
                          marks={{
                            1: { label: '1 Mbps' },
                            [`${getDownloadMaxValue()}`]: { label: getDownloadMaxValue().toString() + ' Mbps' }
                          }}
                        />
                      }
                    /> : <Unlimited />
                }
              </div>
            </FieldsetItem>

            <FieldsetItem
              name={['wlan', 'advancedCustomization', 'multicastRateLimit6GField']}
              label={$t({ defaultMessage: '6 GHz' })}
              initialValue={true}
              switchStyle={{ display: 'none' }}
              style={{ width: 'max-content', marginLeft: '-8px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
                <UI.FormItemNoLabel
                  name={['wlan', 'advancedCustomization', 'enableMulticastUplinkRateLimiting6G']}
                  valuePropName='checked'
                  initialValue={false}
                  style={{ lineHeight: '50px' }}
                  children={
                    <Checkbox data-testid='enableMulticastUpLimit6G'
                      children={$t({ defaultMessage: 'Upload Limit' })} />}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
                <UI.FormItemNoLabel
                  name={['wlan', 'advancedCustomization', 'enableMulticastDownlinkRateLimiting6G']}
                  valuePropName='checked'
                  initialValue={false}
                  style={{ lineHeight: '50px' }}
                  children={
                    <Checkbox data-testid='enableMulticastDownLimit6G'
                      children={$t({ defaultMessage: 'Download Limit' })} />}
                />
              </div>

            </FieldsetItem>
          </>}
        </>}
    </>
  )
}

enum BssMinRateEnum {
    VALUE_NONE = 'default',
    VALUE_1 = '1',
    VALUE_2 = '2',
    VALUE_5_5 = '5.5',
    VALUE_12 = '12',
    VALUE_24 = '24'
  }

function Unlimited () {
  const { $t } = useIntl()
  return (
    <UI.Label
      style={{ lineHeight: '50px' }}>
      {$t({ defaultMessage: 'Unlimited' })}
    </UI.Label>
  )
}

function getDLMax (value : String) : number {
  switch (value) {
    case BssMinRateEnum.VALUE_1: return 1
    case BssMinRateEnum.VALUE_2: return 1
    case BssMinRateEnum.VALUE_5_5: return 3
    case BssMinRateEnum.VALUE_12: return 6
    case BssMinRateEnum.VALUE_24: return 12
    default: return 6
  }
}

const FieldsetItem = ({
  children,
  label,
  switchStyle,
  ...props
}: FormItemProps & { label: string, children: ReactNode, switchStyle: CSSProperties }) =>
  <Form.Item
    {...props}
    valuePropName='checked'>
    <Fieldset {...{ label, children }} switchStyle={switchStyle}/>
  </Form.Item>
