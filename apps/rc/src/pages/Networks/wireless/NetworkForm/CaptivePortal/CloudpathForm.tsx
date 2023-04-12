import { useContext, useEffect } from 'react'

import {
  Form,
  Tooltip,
  Checkbox,
  Input
} from 'antd'
import { useIntl } from 'react-intl'


import { GridCol, GridRow, StepsForm } from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import { NetworkSaveData, GuestNetworkTypeEnum, NetworkTypeEnum, URLProtocolRegExp } from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { AuthAccServerSetting } from './AuthAccServerSetting'
export function CloudpathForm () {
  const {
    data,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
      if(data.guestPortal?.walledGardens){
        form.setFieldValue('walledGardensString',
          data.guestPortal?.walledGardens.toString().replace(/,/g, '\n'))
      }
      form.setFieldValue('enableAccountingService', data.enableAccountingService)
      if(data.accountingRadius){
        form.setFieldValue('accountingRadiusId',
          data.accountingRadius.id)
      }
      if(data.authRadius){
        form.setFieldValue('authRadiusId',
          data.authRadius.id)
      }
    }
  },[data])
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name={['guestPortal','externalPortalUrl']}
          rules={
            [{ required: true },
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
        <Form.Item>
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
        </Form.Item>
        <Form.Item>
          <Form.Item
            name={['wlan', 'bypassCNA']}
            noStyle
            valuePropName='checked'
            initialValue={false}
            children={
              <Checkbox>
                {$t({ defaultMessage: 'Use Bypass Captive Network Assistant' })}
              </Checkbox>
            }
          />
        </Form.Item>
        <AuthAccServerSetting/>
        {!(editMode) && <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />}
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.Cloudpath}/>
      </GridCol>
    </GridRow>
  )
}
