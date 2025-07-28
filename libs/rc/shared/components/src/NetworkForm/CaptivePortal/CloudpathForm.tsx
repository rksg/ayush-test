import { useContext, useEffect } from 'react'

import {
  Form,
  Tooltip,
  Checkbox,
  Input
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import { useIntl }  from 'react-intl'


import { GridCol, GridRow, StepsFormLegacy } from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import {
  NetworkSaveData,
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  HttpURLRegExp,
  HttpDualModeURLRegExp,
  useSelectValidatorByIpModeFF
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
  const networkSecurity = useWatch('networkSecurity', form)
  const enableAccountingProxy = useWatch('enableAccountingProxy', form)
  const enableAccountingService = useWatch('enableAccountingService', form)

  // Use the hook to select the appropriate validator based on IP mode feature flag
  const urlValidator = useSelectValidatorByIpModeFF(HttpURLRegExp, HttpDualModeURLRegExp)

  useEffect(()=>{
    if((editMode || cloneMode) && data){
      setFieldsValue()
    }
  },[data?.id])

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
              { validator: (_, value) => urlValidator(value) }]
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
        <NetworkDiagram
          type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.Cloudpath}
          wlanSecurity={data?.wlan?.wlanSecurity}
          networkSecurity={networkSecurity}
          enableAccountingService={enableAccountingService}
          enableAccountingProxy={enableAccountingProxy}
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
