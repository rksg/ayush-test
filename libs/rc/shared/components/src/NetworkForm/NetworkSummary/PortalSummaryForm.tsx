import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PasswordInput }                                                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { NetworkSaveData, Demo, PortalLanguageEnum, GuestNetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'

import { getLanguage }          from '../../services/PortalDemo'
import { AuthAccServerSummary } from '../CaptivePortal/AuthAccServerSummary'
import * as UI                  from '../styledComponents'

export function PortalSummaryForm (props: {
  summaryData: NetworkSaveData;
  portalData?: Demo
}) {
  const { summaryData, portalData } = props
  const intl = useIntl()
  const $t = intl.$t
  const isCloudPath = summaryData.guestPortal?.guestNetworkType===GuestNetworkTypeEnum.Cloudpath
  const hostDomains = summaryData.guestPortal?.hostGuestConfig?.hostDomains
  const hostEmails = summaryData.guestPortal?.hostGuestConfig?.hostEmails
  const HAEmailList_FeatureFlag = useIsSplitOn(Features.HOST_APPROVAL_EMAIL_LIST_TOGGLE)

  return (
    <>
      {isCloudPath&&
      <Form.Item
        label={$t({ defaultMessage: 'Enrollment Workflow URL:' })}
        children={summaryData.guestPortal?.externalPortalUrl}
      />
      }
      {summaryData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.SelfSignIn&&
      <Form.Item
        label={$t({ defaultMessage: 'Sign-in Option:' })}
        children={<>
          {summaryData.guestPortal?.enableSmsLogin&&
            <div><UI.SMSToken/>{$t({ defaultMessage: 'SMS Token' })}</div>}
          {summaryData.guestPortal?.enableEmailLogin&&
            <div><UI.EMailOTP/>{$t({ defaultMessage: 'Email' })}</div>}
          {summaryData.guestPortal?.enableWhatsappLogin&&
            <div><UI.WhatsApp/>{$t({ defaultMessage: 'WhatsApp' })}</div>}
          {summaryData.guestPortal?.socialIdentities?.facebook&&
            <div><UI.Facebook/>{$t({ defaultMessage: 'Facebook' })}</div>}
          {summaryData.guestPortal?.socialIdentities?.google&&
            <div><UI.Google/>{$t({ defaultMessage: 'Google' })}</div>}
          {summaryData.guestPortal?.socialIdentities?.twitter&&
            <div><UI.Twitter/>{$t({ defaultMessage: 'X' })}</div>}
          {summaryData.guestPortal?.socialIdentities?.linkedin&&
            <div><UI.LinkedIn/>{$t({ defaultMessage: 'LinkedIn' })}</div>}
        </>}
      />
      }
      { summaryData.guestPortal?.guestNetworkType===GuestNetworkTypeEnum.HostApproval && <>
        {
          !HAEmailList_FeatureFlag && hostDomains && <Form.Item
            label={$t({ defaultMessage: 'Host Domains:' })}
            children={hostDomains.map((domain)=> <div key={domain}>{domain}</div>)}
          />
        }
        {
          HAEmailList_FeatureFlag && <Form.Item
            label={$t({ defaultMessage: 'Host Contacts:' })}
          >
            {hostDomains && <>
              {$t({ defaultMessage: 'Entire Domain(s)' }) + ` (${hostDomains.length})`}
              {hostDomains.map((domain)=> {
                return (
                  <div style={{ color: '#808284', fontSize: '12px' }} key={domain}>
                    {domain}
                  </div>
                )
              })}
            </>}
            {hostEmails && <>
              {$t({ defaultMessage: 'Specific E-mail Contacts' }) + ` (${hostEmails.length})`}
              <div>
                {
                  hostEmails.map((email) => {
                    return (
                      <div style={{ color: '#808284', fontSize: '12px' }} key={email}>
                        {email}
                      </div>)
                  })
                }
              </div>
            </>}

          </Form.Item>
        }

        <Form.Item
          label={$t({ defaultMessage: 'Password Expiration Options:' })}
          children={summaryData.guestPortal?.hostGuestConfig?.hostDurationChoices.map(choice=>{
            if(choice+'' === '1') return <div key={choice+'hour'}>
              {$t({ defaultMessage: '1 Hour' })}</div>
            else if(choice+'' === '4') return <div key={choice+'hour'}>
              {$t({ defaultMessage: '4 Hours' })}</div>
            else if(choice+'' === '24') return <div key={choice+'hour'}>
              {$t({ defaultMessage: '1 Day' })}</div>
            else if(choice+'' === '168') return <div key={choice+'hour'}>
              {$t({ defaultMessage: '7 Days' })}</div>
            else return <div key={choice+'hour'}>{$t({ defaultMessage: '1 Month' })}</div>
          })}
        />
      </>
      }
      {summaryData.guestPortal?.guestNetworkType===GuestNetworkTypeEnum.WISPr&&<>
        <Form.Item
          label={$t({ defaultMessage: 'Portal Provider:' })}
          children={summaryData.guestPortal?.wisprPage?.externalProviderName}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Captive Portal URL:' })}
          children={summaryData.guestPortal?.wisprPage?.captivePortalUrl}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Encryption for Users’ MAC and IP addresses:' })}
          children={summaryData.guestPortal?.wisprPage?.encryptMacIpEnabled ?
            $t({ defaultMessage: 'Yes' }):$t({ defaultMessage: 'No' })
          }
        />
      </>
      }
      {(summaryData.guestPortal?.guestNetworkType===GuestNetworkTypeEnum.WISPr||
        isCloudPath)&&
        <AuthAccServerSummary summaryData={summaryData.guestPortal?.wisprPage||summaryData}
          isCloudPath={isCloudPath}
          enableAcctProxy={summaryData.enableAccountingProxy}
          enableAuthProxy={summaryData.enableAuthProxy}/>
      }
      {summaryData.guestPortal?.guestNetworkType!==GuestNetworkTypeEnum.Cloudpath&&
      <Form.Item
        label={$t({ defaultMessage: 'Redirect URL:' })}
        children={summaryData.guestPortal?.redirectUrl ||
          $t({ defaultMessage: 'Original URL request' })}
      />
      }
      {summaryData.wlan?.wlanSecurity !== WlanSecurityEnum.WPA3 &&
       summaryData.wlan?.wlanSecurity !== WlanSecurityEnum.WEP &&
       summaryData.wlan?.wlanSecurity !== WlanSecurityEnum.None &&
       summaryData.wlan?.passphrase &&
        <Form.Item
          label={summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA23Mixed ?
            $t({ defaultMessage: 'WPA2 Passphrase:' }) :
            $t({ defaultMessage: 'Passphrase:' })
          }
          children={<PasswordInput
            readOnly
            bordered={false}
            value={summaryData.wlan?.passphrase}
          />}
        />
      }
      {(summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA3 ||
        summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA23Mixed) &&
        summaryData.wlan?.saePassphrase &&
        <Form.Item
          label={summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA3?
            $t({ defaultMessage: 'SAE Passphrase:' }) :
            $t({ defaultMessage: 'WPA3 SAE Passphrase:' })
          }
          children={<PasswordInput
            readOnly
            bordered={false}
            value={summaryData.wlan?.saePassphrase}
          />}
        />
      }
      {summaryData.guestPortal?.guestNetworkType===GuestNetworkTypeEnum.WISPr&&
       summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WEP && summaryData.wlan?.wepHexKey &&
        <Form.Item
          label={$t({ defaultMessage: 'Hex Key:' })}
          children={<PasswordInput
            readOnly
            bordered={false}
            value={summaryData.wlan?.wepHexKey}
          />}
        />
      }
      {summaryData.wlan?.wlanSecurity === WlanSecurityEnum.None &&
        <Form.Item
          label={$t({ defaultMessage: 'Pre-Shared Key(PSK):' })}
          children={$t({ defaultMessage: 'No' })}
        />
      }
      {summaryData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.SelfSignIn&&
        <Form.Item
          label={$t({ defaultMessage: 'Collect User Email Address:' })}
          children={summaryData.guestPortal?.socialEmails?
            $t({ defaultMessage: 'Yes' }):$t({ defaultMessage: 'No' })}
        />
      }
      {summaryData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.SelfSignIn&&
      summaryData.guestPortal?.enableSmsLogin&&
        <Form.Item
          label={$t({ defaultMessage: 'Password Expires After:' })}
          children={summaryData.guestPortal?.smsPasswordDuration?.duration + ' '+
            (summaryData.guestPortal.smsPasswordDuration?.unit==='HOUR'?
              $t({ defaultMessage: 'Hours' }):$t({ defaultMessage: 'Days' }))}
        />
      }
      {summaryData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr&&
        <Form.Item
          label={$t({ defaultMessage: 'Mac auth bypass:' })}
          children={summaryData.wlan?.bypassCPUsingMacAddressAuthentication?
            $t({ defaultMessage: 'Yes' }):$t({ defaultMessage: 'No' })}
        />
      }
      {summaryData.guestPortal?.guestNetworkType !== GuestNetworkTypeEnum.Cloudpath&&
        <Form.Item
          label={$t({ defaultMessage: 'RUCKUS DHCP Service:' })}
          children={summaryData.enableDhcp?$t({ defaultMessage: 'Yes' }):
            $t({ defaultMessage: 'No' })}
        />
      }
      {isCloudPath&&
      <Form.Item
        label={$t({ defaultMessage: 'Use MAC authentication during reconnection:' })}
        children={summaryData.wlan?.bypassCPUsingMacAddressAuthentication?
          $t({ defaultMessage: 'Yes' }):$t({ defaultMessage: 'No' })}
      />
      }
      {isCloudPath&&
      <Form.Item
        label={$t({ defaultMessage: 'Use Bypass Captive Network Assistant:' })}
        children={summaryData.wlan?.bypassCNA?
          $t({ defaultMessage: 'Yes' }):$t({ defaultMessage: 'No' })}
      />
      }
      {(summaryData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath||
        summaryData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr)&&
        summaryData.guestPortal?.walledGardens&&
        summaryData.guestPortal?.walledGardens?.length>0&&
        <Form.Item
          label={$t({ defaultMessage: 'Walled Garden:' })}
          children={summaryData.guestPortal?.walledGardens?.map(garden=>
            <div key={garden}>{garden}</div>)}
        />
      }
      {portalData?.displayLangCode&&<Form.Item
        label={$t({ defaultMessage: 'Portal Display Language:' })}
        children={$t({ defaultMessage: '{lang}' }, { lang:
          getLanguage(portalData?.displayLangCode as keyof typeof PortalLanguageEnum) })}
      />}
      {portalData?.componentDisplay&&<Form.Item
        label={$t({ defaultMessage: 'WiFi4EU Snippet:' })}
        children={portalData?.componentDisplay?.wifi4eu?
          $t({ defaultMessage: 'ON' }):$t({ defaultMessage: 'OFF' })}
      />}
    </>
  )
}
