import { useContext, useEffect } from 'react'

import {
  Form,
  Tooltip,
  Checkbox,
  Input,
  Space
} from 'antd'
import { useIntl } from 'react-intl'


import { GridCol, GridRow, StepsForm, Button } from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import { NetworkSaveData, GuestNetworkTypeEnum, NetworkTypeEnum, URLProtocolRegExp, walledGardensRegExp } from '@acx-ui/rc/utils'

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
  const defaultWalledGarden = [
    '*.Ggpht.com',
    '*.accounts.google.com',
    '*.airport.us',
    '*.android.clients.google.com',
    '*.android.com',
    '*.appengine.google.com',
    '*.apple.com',
    '*.apple.com.edgekey.net',
    '*.appleiphonecell.com',
    '*.captive.apple.com',
    '*.clients.google.com',
    '*.clients3.google.com',
    '*.cloud.google.com',
    '*.cloudpath.net',
    '*.geotrust.com',
    '*.googleapis.com',
    '*.googleusercontent.com',
    '*.gsp1.apple.com',
    '*.gvt1.com',
    '*.gstatic.com',
    '*.ibook.info',
    '*.itools.info',
    '*.myaccount.google.com',
    '*.ocsp.godaddy.com',
    '*.play.google.com',
    '*.play.googleapis.com',
    '*.ruckuswireless.com',
    '*.ruckus.cloud',
    '*.settings.crashlytics.com',
    '*.ssl.gstatic.com',
    'Android.clients.google.com',
    'Android.l.google.com',
    'Ggpht.com',
    'captive.apple.com',
    'clients3.google.com',
    'connectivitycheck.android.com',
    'connectivitycheck.gstatic.com',
    'play.googleapis.com',
    'urs.microsoft.com',
    'w.apprep.smartscreen.microsoft.com',
    'www.airport.us',
    'www.appleiphonecell.com',
    'www.googleapis.com',
    'www.ibook.info',
    'www.itools.info',
    'www.thinkdifferent.us',
    '172.217.0.0/16',
    '216.58.0.0/16'
  ]
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
        <Form.Item
          name={['walledGardensString']}
          rules={[
            { validator: (_, value) => walledGardensRegExp(value.toString()) }
          ]}
          initialValue={defaultWalledGarden.toString().replace(/,/g, '\n')}
          label={<>{$t({ defaultMessage: 'Walled Garden' })}
            <Tooltip title={$t({ defaultMessage: 'Unauthenticated users will be allowed '
            +'to access these destinations(i.e., without redirection to captive '+
            'portal).' })+'\n'+
             $t({ defaultMessage: 'Each destination should be entered in a new line.' })+'\n'+
             $t({ defaultMessage: 'Accepted formats for destinations are:' })+'\n\n'+
             $t({ defaultMessage: '-IP address(e.g. 10.11.12.13)' })+'\n\n'+
             $t({ defaultMessage: '-IP address range(e.g. 10.11.12.13-10.11.12.15)' })+'\n\n'+
             $t({ defaultMessage: '-CIDR(e.g. 10.11.12.13/28)' })+'\n\n'+
             $t({ defaultMessage: '-IP address and mask(e.g. 10.11.12.13 255.255.255.0)' })+'\n\n'+
             $t({ defaultMessage: '-Website FQDN(e.g. www.ruckus.com)' })+'\n\n'+
             $t({ defaultMessage: '-Website FQDN with a wildcard(e.g. *.amazon.com; *.com)' })+'\n'}
            placement='bottom'>
              <QuestionMarkCircleOutlined/>
            </Tooltip>
            <Button onClick={() => {
              form.setFieldValue(['guestPortal','walledGardens'],defaultWalledGarden)
              form.setFieldValue('walledGardensString',
                defaultWalledGarden.toString().replace(/,/g, '\n'))
            }}
            style={{ marginLeft: 90, marginRight: 10 }}
            type='link'>
              {$t({ defaultMessage: 'Reset to default' })}
            </Button>
            <Space/>
            <Button onClick={() => {
              form.setFieldValue(['guestPortal','walledGardens'],[])
              form.setFieldValue('walledGardensString',[])
            }}
            type='link'>
              {$t({ defaultMessage: 'Clear' })}
            </Button>
          </>}
          children={
            <Input.TextArea rows={15}
              style={{ resize: 'none' }}
              onChange={(e)=>{
                const values = e.target.value.split('\n')
                const walledGardens = [] as string[]
                values.map(value=>{
                  if(value.trim())walledGardens.push(value)
                })
                form.setFieldValue(['guestPortal','walledGardens'],walledGardens)}}
              placeholder={$t({ defaultMessage: 'Enter permitted walled '+
              'garden destinations and IP subnets, a new line for each '+
              'entry. Hover over the question mark for help with this field.' })}
            />
          }
        />
        <Form.Item
          hidden
          initialValue={defaultWalledGarden}
          name={['guestPortal','walledGardens']}
        />
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
