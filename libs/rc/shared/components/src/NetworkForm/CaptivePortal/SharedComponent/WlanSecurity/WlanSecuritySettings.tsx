import React, { useState, useContext, useEffect } from 'react'

import { Form, Space, Select, Switch } from 'antd'
import { useIntl }                     from 'react-intl'

import { Button, PasswordInput, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import { InformationSolid }               from '@acx-ui/icons'
import {
  generateHexKey,
  GuestNetworkTypeEnum,
  hexRegExp,
  passphraseRegExp,
  PskWlanSecurityEnum,
  SecurityOptionsDescription,
  SecurityOptionsPassphraseLabel,
  trailingNorLeadingSpaces,
  WlanSecurityEnum,
  WisprSecurityEnum,
  WisprSecurityOptionsDescription,
  ManagementFrameProtectionEnum,
  WifiNetworkMessages
} from '@acx-ui/rc/utils'

import { MLOContext }     from '../../../NetworkForm'
import NetworkFormContext from '../../../NetworkFormContext'
import * as UI            from '../../../styledComponents'

export const WlanSecurityFormItems = () => {
  const { $t } = useIntl()

  const { data, setData } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)

  const { useWatch } = Form
  const form = Form.useFormInstance()

  const wlanSecurity = useWatch('pskProtocol', form)
  const networkSecurity = useWatch('networkSecurity', form)

  const [enablePreShared, setEnablePreShared] = useState(false)

  const isGuestNetworkTypeWISPr = (): boolean => {
    return data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr
  }

  const isGuestNetworkTypeGuestPass = (): boolean => {
    return data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.GuestPass
  }

  const isGuestNetworkTypeDirectoryServer = (): boolean => {
    return data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Directory
  }

  const isCaptivePortalPskEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_PSK)
    || isGuestNetworkTypeWISPr()
    || isGuestNetworkTypeDirectoryServer()
  const isCaptivePortalOweEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_OWE)
    || isGuestNetworkTypeWISPr()
    || isGuestNetworkTypeGuestPass()
    || isGuestNetworkTypeDirectoryServer()
  const isDeprecateWep = useIsSplitOn(Features.WIFI_WLAN_DEPRECATE_WEP)
  // eslint-disable-next-line max-len
  const isCaptivePortalOWETransitionEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_OWE_TRANSITION)

  useEffect(() => {
    const transNetworkSecurity =
      WisprSecurityEnum[networkSecurity as keyof typeof WisprSecurityEnum]
    const transWlanSecurity =
      PskWlanSecurityEnum[wlanSecurity as keyof typeof PskWlanSecurityEnum]
    const MLOEffectiveCondition = [
      (transNetworkSecurity === WisprSecurityEnum.PSK &&
        transWlanSecurity === PskWlanSecurityEnum.WPA23Mixed),
      (transNetworkSecurity === WisprSecurityEnum.PSK &&
        transWlanSecurity === PskWlanSecurityEnum.WPA3),
      (transNetworkSecurity === WisprSecurityEnum.OWE)
    ].some(Boolean)

    disableMLO(!MLOEffectiveCondition)

    if (!MLOEffectiveCondition) {
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }
  }, [wlanSecurity, networkSecurity])

  useEffect(() => {
    const { wlanSecurity } = data?.wlan || {}
    if (wlanSecurity) {
      if (wlanSecurity === WlanSecurityEnum.None) {
        form.setFieldValue('networkSecurity', 'NONE')
        setEnablePreShared(false)
      } else if (wlanSecurity === WlanSecurityEnum.OWE) {
        form.setFieldValue('networkSecurity', 'OWE')
        setEnablePreShared(false)
      } else if (wlanSecurity === WlanSecurityEnum.OWETransition) {
        form.setFieldValue('networkSecurity', 'OWE')
        form.setFieldValue('enableOweTransition', true)
        setEnablePreShared(false)
      }
      else {
        form.setFieldValue('networkSecurity', 'PSK')
        setEnablePreShared(true)
        form.setFieldValue('pskProtocol', wlanSecurity)
      }
    }
    if (data && 'enableOweTransition' in data) {
      delete data['enableOweTransition']
    }
  }, [data?.wlan?.wlanSecurity])

  const onGenerateHexKey = () => {
    let hexKey = generateHexKey(26)
    form.setFieldsValue({ wlan: { wepHexKey: hexKey.substring(0, 26) } })
  }
  const onOweTransitionChange = (checked: boolean) => {
    setData && setData({
      ...data,
      wlan: {
        ...data?.wlan,
        wlanSecurity: checked ? WlanSecurityEnum.OWETransition : WlanSecurityEnum.OWE
      }
    })
  }
  const securityDescription = () => {
    const wlanSecurity = form.getFieldValue('pskProtocol')
    return (
      <>
        {wlanSecurity in PskWlanSecurityEnum &&
          $t(SecurityOptionsDescription[wlanSecurity as keyof typeof PskWlanSecurityEnum])}
        {[
          WlanSecurityEnum.WPA2Personal,
          WlanSecurityEnum.WPAPersonal,
          WlanSecurityEnum.WEP
        ].indexOf(wlanSecurity) > -1 &&
          <Space align='start'>
            <InformationSolid />
            {$t(SecurityOptionsDescription.WPA2_DESCRIPTION_WARNING)}
          </Space>
        }
      </>
    )
  }
  const networkSecurityOptions = Object.entries(WisprSecurityEnum).filter(([k]) => {
    if (k === 'PSK' && !isCaptivePortalPskEnabled) {
      return false
    }
    if (k === 'OWE' && !isCaptivePortalOweEnabled) {
      return false
    }
    return true
  }).map(([k, v]) => ({
    value: k,
    label: v
  }))
  const networkSecurityDescription = () => {
    const networkSecurity = form.getFieldValue('networkSecurity')
    return (
      networkSecurity in WisprSecurityOptionsDescription &&
        // eslint-disable-next-line max-len
        $t(WisprSecurityOptionsDescription[networkSecurity as keyof typeof WisprSecurityOptionsDescription])
    )
  }
  const securityOptions = Object.keys(PskWlanSecurityEnum).filter(key => {
    return isGuestNetworkTypeWISPr() || (key !== 'WPAPersonal' && key !== 'WEP')
  }).map((key =>
    <Select.Option key={key} disabled={isDeprecateWep && key === 'WEP'}>
      {isDeprecateWep && key === 'WEP' ?
        `${PskWlanSecurityEnum[key as keyof typeof PskWlanSecurityEnum]} (Unsafe)`
        : PskWlanSecurityEnum[key as keyof typeof PskWlanSecurityEnum]}
    </Select.Option>
  ))
  const onProtocolChange = (value: WlanSecurityEnum) => {
    const protocol = {} as { [key: string]: string | undefined | null }
    if (data?.wlan?.passphrase) {
      protocol.passphrase =
        [WlanSecurityEnum.WPAPersonal,
          WlanSecurityEnum.WPA2Personal,
          WlanSecurityEnum.WPA23Mixed].includes(value)
          ? data?.wlan?.passphrase
          : null
    }
    if (data?.wlan?.saePassphrase) {
      protocol.saePassphrase = [WlanSecurityEnum.WPA23Mixed, WlanSecurityEnum.WPA3].includes(value)
        ? data?.wlan?.saePassphrase
        : null
    }
    if (data?.wlan?.wepHexKey) {
      protocol.wepHexKey = value === WlanSecurityEnum.WEP
        ? data?.wlan?.wepHexKey
        : null
    }
    let networkSec = 'PSK'
    if (value === WlanSecurityEnum.OWE) {
      networkSec = 'OWE'
      protocol.managementFrameProtection = ManagementFrameProtectionEnum.Required
      // eslint-disable-next-line max-len
      form.setFieldValue(['wlan', 'managementFrameProtection'], ManagementFrameProtectionEnum.Required)
    } else if (value === WlanSecurityEnum.None) {
      networkSec = 'NONE'
    }
    form.setFieldValue(['wlan', 'wlanSecurity'], value)
    setData && setData({
      ...data,
      ...{
        wlan: {
          ...data?.wlan,
          wlanSecurity: value,
          ...protocol
        }
      },
      ...{
        pskProtocol: value,
        networkSecurity: networkSec
      }
    })
  }
  return (
    <>
      {(isCaptivePortalPskEnabled || isCaptivePortalOweEnabled) &&
        <Form.Item
          name='networkSecurity'
          initialValue={'NONE'}
          label={$t({ defaultMessage: 'Secure your network' })}
          extra={networkSecurityDescription()}
          children={
            <Select
              placeholder={$t({ defaultMessage: 'None' })}
              options={networkSecurityOptions}
              onChange={(selected: string) => {
                let security = data?.wlan?.wlanSecurity
                /* eslint-disable */
                switch (WisprSecurityEnum[selected as keyof typeof WisprSecurityEnum]) {
                  case WisprSecurityEnum.PSK:
                    setEnablePreShared(true)
                    disableMLO(true)
                    security = WlanSecurityEnum.WPA2Personal
                    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
                    break
                  case WisprSecurityEnum.OWE:
                    setEnablePreShared(false)
                    disableMLO(false)
                    security = WlanSecurityEnum.OWE
                    break
                  case WisprSecurityEnum.NONE:
                    // disable secure network
                    setEnablePreShared(false)
                    disableMLO(true)
                    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
                    security = WlanSecurityEnum.None
                    break
                  default:
                    disableMLO(true)
                    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
                    return
                }
                /* eslint-enable */
                onProtocolChange(security)
              }}
            />}
        />
      }

      {(isCaptivePortalOWETransitionEnabled && networkSecurity === 'OWE') &&
        <UI.FieldLabel width={'250px'}>
          <Space align='start'>
            { $t({ defaultMessage: 'OWE Transition mode' }) }
            <Tooltip.Question
              title={$t(WifiNetworkMessages.ENABLE_OWE_TRANSITION_TOOLTIP)}
              placement='bottom'
              iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
            />
          </Space>
          <Form.Item
            data-testid={'owe-transition-switch'}
            name='enableOweTransition'
            valuePropName='checked'
            children={<Switch onChange={onOweTransitionChange} />}/>
        </UI.FieldLabel>
      }
      {isCaptivePortalPskEnabled && enablePreShared && wlanSecurity !== WlanSecurityEnum.WEP &&
        wlanSecurity !== WlanSecurityEnum.WPA3 &&
        <Form.Item
          name={['wlan', 'passphrase']}
          label={SecurityOptionsPassphraseLabel[wlanSecurity as keyof typeof PskWlanSecurityEnum]
            ?? SecurityOptionsPassphraseLabel.WPA2Personal}
          rules={[
            { required: true, min: 8 },
            { max: 64 },
            { validator: (_, value) => trailingNorLeadingSpaces(value) },
            { validator: (_, value) => passphraseRegExp(value) }
          ]}
          validateFirst
          extra={$t({ defaultMessage: '8 characters minimum' })}
          children={<PasswordInput />}
        />
      }
      {isGuestNetworkTypeWISPr() && enablePreShared && wlanSecurity === 'WEP' &&
        <Form.Item
          name={['wlan', 'wepHexKey']}
          label={SecurityOptionsPassphraseLabel[PskWlanSecurityEnum.WEP]}
          rules={[
            { required: true },
            { validator: (_, value) => hexRegExp(value) }
          ]}
          extra={<>{$t({ defaultMessage: 'Must be 26 hex characters' })}
            <div style={{ textAlign: 'right', marginTop: -25 }}>
              <Button type='link' onClick={onGenerateHexKey}>
                {$t({ defaultMessage: 'Generate' })}
              </Button></div>
          </>}
          children={<PasswordInput />}
        />
      }
      {isCaptivePortalPskEnabled && enablePreShared &&
        [WlanSecurityEnum.WPA23Mixed, WlanSecurityEnum.WPA3].includes(wlanSecurity) &&
        <Form.Item
          name={['wlan', 'saePassphrase']}
          label={wlanSecurity === WlanSecurityEnum.WPA3
            ? $t({ defaultMessage: 'SAE Passphrase' })
            : $t({ defaultMessage: 'WPA3 SAE Passphrase' })
          }
          rules={[
            { required: true, min: 8 },
            { max: 64 },
            { validator: (_, value) => trailingNorLeadingSpaces(value) },
            { validator: (_, value) => passphraseRegExp(value) }
          ]}
          validateFirst
          extra={$t({ defaultMessage: '8 characters minimum' })}
          children={<PasswordInput />}
        />
      }
      {isCaptivePortalPskEnabled && enablePreShared && <Form.Item
        label={$t({ defaultMessage: 'Security Protocol' })}
        name='pskProtocol'
        initialValue={WlanSecurityEnum.WPA2Personal}
        extra={securityDescription()}
      >
        <Select onChange={onProtocolChange}>
          {securityOptions}
        </Select>
      </Form.Item>}
    </>
  )
}
