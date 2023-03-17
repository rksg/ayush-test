import { useContext, useEffect, useRef, useState } from 'react'

import {
  Form,
  Select,
  Checkbox,
  Space,
  Input,
  InputRef
} from 'antd'
import _                             from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams }                 from 'react-router-dom'

import { Button, GridCol, GridRow, StepsForm, Tooltip } from '@acx-ui/components'
import {
  InformationSolid,
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import { useExternalProvidersQuery }                                                                                                                                                                                                                                                                    from '@acx-ui/rc/services'
import { NetworkSaveData, generateHexKey, GuestNetworkTypeEnum, hexRegExp, NetworkTypeEnum, passphraseRegExp, Providers, PskWlanSecurityEnum, Regions, SecurityOptionsDescription, SecurityOptionsPassphraseLabel, trailingNorLeadingSpaces, URLProtocolRegExp, walledGardensRegExp, WlanSecurityEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { AuthAccServerSetting } from './AuthAccServerSetting'
import { AuthAccServerSummary } from './AuthAccServerSummary'
import { DhcpCheckbox }         from './DhcpCheckbox'
import { RedirectUrlInput }     from './RedirectUrlInput'




export function WISPrForm () {
  const {
    data,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const params = useParams()
  const inputKey = useRef<InputRef>(null)
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const wlanSecurity = useWatch(['wlan', 'wlanSecurity'])
  const enablePreShared = useWatch('enablePreShared')
  const externalProviderRegion = useWatch(['guestPortal','wisprPage','externalProviderRegion'])
  const providerData = useExternalProvidersQuery({ params })
  const [externalProviders, setExternalProviders]=useState<Providers[]>()
  const [regionOption, setRegionOption]=useState<Regions[]>()
  const [isOtherProvider, setIsOtherProvider]=useState(false)
  useEffect(()=>{
    if(providerData.data){
      const providers = providerData.data.providers
      setExternalProviders(providers)
    }
    if((editMode || cloneMode) && data){
      if(data.guestPortal?.wisprPage?.accountingRadius){
        form.setFieldValue('accountingRadius',
          data.guestPortal.wisprPage.accountingRadius)
        form.setFieldValue('accountingRadiusId',
          data.guestPortal.wisprPage.accountingRadius.id)
      }
      if(data.guestPortal?.wisprPage?.authRadius){
        form.setFieldValue('authRadius',
          data.guestPortal.wisprPage.authRadius)
        form.setFieldValue('authRadiusId',
          data.guestPortal.wisprPage.authRadius.id)
      }
      form.setFieldsValue({ ...data })
      if(data.guestPortal?.redirectUrl){
        form.setFieldValue('redirectCheckbox',true)
      }
      if(data.guestPortal?.walledGardens){
        form.setFieldValue('walledGardensString',
          data.guestPortal?.walledGardens.toString().replace(/,/g, '\n'))
      }
      const pName = data.guestPortal?.wisprPage?.externalProviderName
      if(pName){
        const regions = _.find(externalProviders,{ name: pName })?.regions
        setRegionOption(regions)
      }
      if(data.wlan?.wlanSecurity!== WlanSecurityEnum.None){
        form.setFieldValue('enablePreShared',true)
      }
      if(!pName?.trim() || pName==='Other provider'){
        form.setFieldValue(['guestPortal','wisprPage','externalProviderName'],'Other provider')
        setIsOtherProvider(true)
      }else setIsOtherProvider(false)
      if(data.guestPortal?.wisprPage?.authRadius?.secondary){
        form.setFieldValue('enableSecondaryAuthServer',true)
      }
      if(data.guestPortal?.wisprPage?.accountingRadius){
        form.setFieldValue('enableAccountingService', true)
        if(data.guestPortal?.wisprPage?.accountingRadius.secondary){
          form.setFieldValue('enableSecondaryAcctServer',true)
        }
      }
    }
  },[providerData.data,data])
  useEffect(()=>{
    form.setFieldValue(['guestPortal','wisprPage','integrationKey'], generateRandomString())
  },[])
  const onGenerateHexKey = () => {
    let hexKey = generateHexKey(26)
    form.setFieldsValue({ wlan: { wepHexKey: hexKey.substring(0, 26) } })
  }
  const securityDescription = () => {
    const wlanSecurity = form.getFieldValue([ 'wlan', 'wlanSecurity' ])
    return (
      <>
        {SecurityOptionsDescription[wlanSecurity as keyof typeof PskWlanSecurityEnum]}
        {[
          WlanSecurityEnum.WPA2Personal,
          WlanSecurityEnum.WPAPersonal,
          WlanSecurityEnum.WEP
        ].indexOf(wlanSecurity) > -1 &&
          <Space align='start'>
            <InformationSolid />
            {SecurityOptionsDescription.WPA2_DESCRIPTION_WARNING}
          </Space>
        }
      </>
    )
  }
  const generateRandomString = () => {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let randomString = ''
    for (let i = 0; i < 16; i++) {
      const randomPosition = Math.floor(Math.random() * charSet.length)
      randomString += charSet.substring(randomPosition, randomPosition + 1)
    }
    return randomString
  }
  const securityOptions = Object.keys(PskWlanSecurityEnum).map((key =>
    <Select.Option key={key}>{ PskWlanSecurityEnum[key as keyof typeof PskWlanSecurityEnum] }
    </Select.Option>
  ))
  const region = regionOption?.length === 1? regionOption?.[0]:
    _.find(regionOption,{ name: externalProviderRegion })
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name={['guestPortal','wisprPage','externalProviderName']}
          rules={
            [{ required: true }]
          }
          label={$t({ defaultMessage: 'Portal Provider' })}
          initialValue=''
          children={<Select onChange={(value)=>{
            const regions = _.find(externalProviders,{ name: value })?.regions
            form.setFieldValue(['guestPortal','wisprPage','customExternalProvider'], false)
            form.setFieldValue(['guestPortal','wisprPage','captivePortalUrl'], '')
            if(regions?.length===1){
              form.setFieldValue(['guestPortal','wisprPage','externalProviderRegion'],
                regions[0].name)
              if(regions[0].captivePortalUrl){
                form.setFieldValue(['guestPortal','wisprPage','captivePortalUrl'],
                  regions[0].captivePortalUrl)
              }
              if(regions[0].redirectUrl){
                form.setFieldValue('redirectCheckbox', true)
                form.setFieldValue(['guestPortal','redirectUrl'], regions[0].redirectUrl)
              }
            }else form.setFieldValue(['guestPortal','wisprPage','externalProviderRegion'], '')
            if(value==='Other provider'){
              setIsOtherProvider(true)
              form.setFieldValue(['guestPortal','wisprPage','customExternalProvider'], true)
            }else{
              setIsOtherProvider(false)
            }
            setRegionOption(regions)
          }}>
            <Select.Option value={''}>
              {$t({ defaultMessage: 'Select provider' })}
            </Select.Option>
            {externalProviders?.map(item=>{
              return <Select.Option key={item.name} value={item.name}>
                {item.name}
              </Select.Option>
            })}
            <Select.Option value={'Other provider'}>
              {$t({ defaultMessage: 'Other provider' })}
            </Select.Option>
          </Select>}
        />
        {isOtherProvider&&<Form.Item
          name={['guestPortal','wisprPage','providerName']}
          initialValue=''
          label={$t({ defaultMessage: 'Provider Name' })}
          children={<Input placeholder={$t({ defaultMessage: 'Provider Name' })}
          />}
        />

        }
        {regionOption && regionOption.length>1&&<Form.Item
          name={['guestPortal','wisprPage','externalProviderRegion']}
          rules={
            [{ required: true }]
          }
          initialValue=''
          label={$t({ defaultMessage: 'Region' })}
          children={<Select>
            <Select.Option value={''}>
              {$t({ defaultMessage: 'Select Region' })}
            </Select.Option>
            {regionOption?.map(item=>{
              return <Select.Option key={item.name} value={item.name}>
                {item.name}
              </Select.Option>
            })}
          </Select>}
        />}
        {!(regionOption && regionOption.length>1)&&<Form.Item
          name={['guestPortal','wisprPage','externalProviderRegion']}
          hidden
        />

        }
        <Form.Item
          name={['guestPortal','wisprPage','captivePortalUrl']}
          rules={
            [{ required: true },
              { validator: (_, value) => URLProtocolRegExp(value) }]
          }
          label={<>
            {$t({ defaultMessage: 'Captive Portal URL' })}
            <Tooltip.Question
              title={$t({ defaultMessage: 'Copy this from your vendor\'s configuration' })}
              placement='bottom' />
          </>}
          children={<Input placeholder={$t({ defaultMessage:
          'Tip: Copy this from your vendor\'s configuration' })}
          />}
        />
        <RedirectUrlInput></RedirectUrlInput>
        <Form.Item name={['guestPortal','wisprPage','customExternalProvider']}
          hidden
          initialValue={false}
        />
        <Form.Item
          name={['guestPortal','wisprPage','integrationKey']}
          label={<>{$t({ defaultMessage: 'Integration Key' })}
            <Tooltip.Question
              title={$t({ defaultMessage: 'Copy this password to your vendor\'s'
            +' configuration, to allow it to connect to Ruckus Cloud' })}
              placement='bottom' />
          </>}
          extra={
            <div style={{ marginLeft: 210, marginTop: -30 }}>
              <Button onClick={() => {
                inputKey?.current?.focus()
                inputKey?.current?.select()
                navigator?.clipboard?.writeText(
                  form.getFieldValue(['guestPortal','wisprPage','integrationKey']))
              }}
              type='link'>
                {$t({ defaultMessage: 'Copy Key' })}
              </Button></div>}
          children={<Input readOnly style={{ width: 200 }} ref={inputKey}/>}
        />
        <Form.Item>
          <Form.Item name='enablePreShared'
            noStyle
            valuePropName='checked'
            initialValue={false}
            children={
              <Checkbox>
                {$t({ defaultMessage: 'Enable Pre-Shared Key (PSK)' })}
              </Checkbox>
            }
          />
          <Tooltip title={$t({ defaultMessage: 'Require users to enter a passphrase to connect' })}
            placement='bottom'>
            <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
          </Tooltip>
        </Form.Item>
        {enablePreShared && wlanSecurity !== WlanSecurityEnum.WEP &&
         wlanSecurity !== WlanSecurityEnum.WPA3 &&
          <Form.Item
            name={['wlan', 'passphrase']}
            label={SecurityOptionsPassphraseLabel[wlanSecurity as keyof typeof PskWlanSecurityEnum]
              ??SecurityOptionsPassphraseLabel.WPA2Personal}
            rules={[
              { required: true, min: 8 },
              { max: 64 },
              { validator: (_, value) => trailingNorLeadingSpaces(value) },
              { validator: (_, value) => passphraseRegExp(value) }
            ]}
            validateFirst
            extra={$t({ defaultMessage: '8 characters minimum' })}
            children={<Input.Password />}
          />
        }
        {enablePreShared && wlanSecurity === 'WEP' &&
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
            children={<Input.Password />}
          />
        }
        {enablePreShared &&
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
            children={<Input.Password />}
          />
        }
        {enablePreShared && <Form.Item
          label={$t({ defaultMessage: 'Security Protocol' })}
          name={['wlan', 'wlanSecurity']}
          initialValue={WlanSecurityEnum.WPA2Personal}
          extra={securityDescription()}
        >
          <Select>
            {securityOptions}
          </Select>
        </Form.Item>}
        <Form.Item
          name={['wlan','bypassCPUsingMacAddressAuthentication']}
          noStyle
          valuePropName='checked'
          initialValue={true}
          children={
            <Checkbox>
              {$t({ defaultMessage: 'Enable MAC auth bypass' })}
            </Checkbox>
          }
        />
        <DhcpCheckbox />
        <Form.Item
          name={['walledGardensString']}
          rules={[
            { validator: (_, value) => walledGardensRegExp(value.toString()) }
          ]}
          initialValue={[]}
          label={<>{$t({ defaultMessage: 'Walled Garden' })}
            <Tooltip.Question
              placement='bottom'
              title={<FormattedMessage
                values={{ br: (chunks) => <>{chunks}<br /></> }}
                /* eslint-disable max-len */
                defaultMessage={`
                  Unauthenticated users will be allowed to access these destinations(i.e., without redirection to captive portal).<br></br><br></br>
                  Each destination should be entered in a new line. Accepted formats for destinations are:<br></br><br></br>
                  - IP address(e.g. 10.11.12.13)<br></br>
                  - IP address range(e.g. 10.11.12.13-10.11.12.15)<br></br>
                  - CIDR(e.g. 10.11.12.13/28)<br></br>
                  - IP address and mask(e.g. 10.11.12.13 255.255.255.0)<br></br>
                  - Website FQDN(e.g. www.ruckus.com)<br></br>
                  - Website FQDN with a wildcard(e.g. *.amazon.com; *.com)
                `}
                /* eslint-enable */
              />}
            />
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
          initialValue={[]}
          name={['guestPortal','walledGardens']}
        />
        {!regionOption && isOtherProvider &&<AuthAccServerSetting/>}
        {regionOption && region && <AuthAccServerSummary summaryData={region as Regions}/>}
        {!(editMode) && <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />}
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.WISPr}/>
      </GridCol>
    </GridRow>
  )
}
