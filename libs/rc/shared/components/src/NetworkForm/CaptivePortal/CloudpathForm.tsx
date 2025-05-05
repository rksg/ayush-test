import { useContext, useEffect } from 'react'

import {
  Form,
  Tooltip,
  Checkbox,
  Input
} from 'antd'
import { useIntl } from 'react-intl'


import { GridCol, GridRow, StepsFormLegacy }                      from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import {
  NetworkSaveData,
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  URLProtocolRegExp,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { AuthAccServerSetting }                  from './AuthAccServerSetting'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems }                 from './SharedComponent/WlanSecurity/WlanSecuritySettings'

export function CloudpathForm () {
  const {
    data,
    editMode,
    isRuckusAiMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  // TODO: Remove deprecated codes below when RadSec feature is delivery
  useEffect(()=>{
    if(!supportRadsec && (editMode || cloneMode) && data){
      setFieldsValue()
    }
  },[data])

  useEffect(()=>{
    if(supportRadsec && (editMode || cloneMode) && data){
      setFieldsValue()
    }
  },[supportRadsec, data?.id, data?.wlan?.wlanSecurity])

  const setFieldsValue = () => {
    if (!data) {
      return
    }

    form.setFieldsValue({ ...data,
      enableAccountingService: data.enableAccountingService
    })
    if(data.accountingRadius){
      form.setFieldValue('accountingRadiusId',
        data.accountingRadius.id)
    }
    if(data.authRadius){
      form.setFieldValue('authRadiusId',
        data.authRadius.id)
    }
  }

  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
        <Form.Item
          name={['guestPortal','externalPortalUrl']}
          rules={
            [{ required: true, message: $t(validationMessages.validateURL) },
              { validator: (_, value) => URLProtocolRegExp(value) }]
          }
          label={<>
            {$t({ defaultMessage: 'Enrollment Workflow URL' })}
            <Tooltip title={$t({ defaultMessage: 'Your user will be re-directed to this URL in '+
            'order to enroll in the system.\nIt\'s recommended to copy it from '+
            'your Cloudpath\'s configuration.' })}
            placement='bottom'>
              <QuestionMarkCircleOutlined/>
            </Tooltip>
          </>}
          children={<Input placeholder={$t({ defaultMessage:
          'Copy from your Cloudpath\'s configuration' })}
          />}
        />
        <WlanSecurityFormItems />
        <div style={{ display: 'flex' }}>
          <Form.Item
            name={['wlan','bypassCPUsingMacAddressAuthentication']}
            noStyle
            valuePropName='checked'
            initialValue={true}
            children={
              <Checkbox>
                {$t({ defaultMessage: 'Use MAC authentication during reconnection' })}
              </Checkbox>
            }
          />
          <Tooltip title={$t({ defaultMessage: 'Authenticate clients by MAC address. '+
            'Cloudpath uses the MAC address as the user logon name and password.' })}
          placement='bottom'>
            <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
          </Tooltip>
        </div>
        <BypassCaptiveNetworkAssistantCheckbox/>
        <WalledGardenTextArea
          enableDefaultWalledGarden={true} />
        <AuthAccServerSetting/>
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.Cloudpath}
          wlanSecurity={data?.wlan?.wlanSecurity}
        />
      </GridCol>
    </GridRow>
    {!(editMode) && !(isRuckusAiMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>
  )
}
