import { useContext, useEffect, useRef, useState, useReducer } from 'react'

import {
  Form,
  Select,
  Checkbox,
  Space,
  Input,
  InputRef
} from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Button, GridCol, GridRow, StepsFormLegacy, Tooltip, PasswordInput } from '@acx-ui/components'
import { Features, useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import {
  InformationSolid,
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import { useGetMspEcProfileQuery }   from '@acx-ui/msp/services'
import { MSPUtils }                  from '@acx-ui/msp/utils'
import { useExternalProvidersQuery } from '@acx-ui/rc/services'
import {
  NetworkSaveData,
  generateHexKey,
  GuestNetworkTypeEnum,
  hexRegExp,
  NetworkTypeEnum,
  passphraseRegExp,
  Providers,
  PskWlanSecurityEnum,
  Regions,
  SecurityOptionsDescription,
  SecurityOptionsPassphraseLabel,
  trailingNorLeadingSpaces,
  URLProtocolRegExp,
  WlanSecurityEnum,
  AuthRadiusEnum,
  WisprSecurityEnum,
  WisprSecurityOptionsDescription,
  ManagementFrameProtectionEnum
} from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { AuthAccServerSetting }                                                                     from './AuthAccServerSetting'
import { AuthAccServerSummary }                                                                     from './AuthAccServerSummary'
import { DhcpCheckbox }                                                                             from './DhcpCheckbox'
import { RedirectUrlInput }                                                                         from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox }                                                    from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                                                                     from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WISPrAuthAccServer }                                                                       from './SharedComponent/WISPrAuthAccServer'
import { statesCollection, WISPrAuthAccContext, WISPrAuthAccServerState, WISPrAuthAccServerAction } from './SharedComponent/WISPrAuthAccServer/WISPrAuthAccServerReducer'

const mspUtils = MSPUtils()
export function WISPrForm () {
  const {
    data,
    editMode,
    cloneMode,
    setData
  } = useContext(NetworkFormContext)
  const enableWISPREncryptMacIP = useIsSplitOn(Features.WISPR_ENCRYPT_MAC_IP)
  const enableWISPRAlwaysAccept = useIsSplitOn(Features.WIFI_EDA_WISPR_ALWAYS_ACCEPT_TOGGLE)
  const enableOweEncryption = useIsSplitOn(Features.WIFI_EDA_OWE_TOGGLE)
  const { $t } = useIntl()
  const params = useParams()
  const { data: mspEcProfileData } = useGetMspEcProfileQuery({ params })
  const inputKey = useRef<InputRef>(null)
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const wlanSecurity = useWatch('pskProtocol')
  const externalProviderRegion = useWatch(['guestPortal','wisprPage','externalProviderRegion'])
  const providerData = useExternalProvidersQuery({ params })
  const [enablePreShared, setEnablePreShared ] = useState(false)
  const [externalProviders, setExternalProviders]=useState<Providers[]>()
  const [regionOption, setRegionOption]=useState<Regions[]>()
  const [isOtherProvider, setIsOtherProvider]=useState(false)
  const [isMspEc, setIsMspEc]=useState(false)

  // eslint-disable-next-line
  const actionRunner = (currentState: WISPrAuthAccServerState, incomingState: WISPrAuthAccServerState) => {
    if (incomingState.action === WISPrAuthAccServerAction.BypassCNAAndAuthChecked) {
      let mutableData = _.cloneDeep(data) ?? {}
      _.set(mutableData, 'wlan.bypassCPUsingMacAddressAuthentication', true)
      _.set(mutableData, 'guestPortal.wisprPage.authType', AuthRadiusEnum.RADIUS)
      setData && setData(mutableData)
    }

    if (incomingState.action === WISPrAuthAccServerAction.OnlyAuthChecked) {
      let mutableData = _.cloneDeep(data) ?? {}
      _.set(mutableData, 'wlan.bypassCPUsingMacAddressAuthentication', false)
      _.set(mutableData, 'guestPortal.wisprPage.authType', AuthRadiusEnum.RADIUS)
      setData && setData(mutableData)
    }
    if (incomingState.action === WISPrAuthAccServerAction.AllAcceptChecked) {
      form.setFieldValue(['authRadiusId'], '')
      form.setFieldValue(['authRadius'], undefined)
      form.setFieldValue(['wlan','bypassCPUsingMacAddressAuthentication'], false)

      let mutableData = _.cloneDeep(data) ?? {}
      _.set(mutableData, 'guestPortal.wisprPage.authType', AuthRadiusEnum.ALWAYS_ACCEPT)
      _.unset(mutableData, 'guestPortal.wisprPage.authRadius')
      setData && setData(mutableData)
    }
    return incomingState
  }

  const [state, dispatch] = useReducer(actionRunner, statesCollection.useBypassCNAAndAuth)

  const setProvider = (value: string, regions: Regions[]|undefined) =>{
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
    if(value==='Custom Provider'){
      setIsOtherProvider(true)
      form.setFieldValue(['guestPortal','wisprPage','customExternalProvider'], true)
    }else{
      setIsOtherProvider(false)
    }
    setRegionOption(regions)
  }

  useEffect(()=>{
    if(mspEcProfileData){
      setIsMspEc(mspUtils.isMspEc(mspEcProfileData))
    }
  },[mspEcProfileData])

  useEffect(()=>{
    if(providerData.data){
      const providers = providerData.data.providers
      setExternalProviders(providers)
      if(isMspEc && providers.length === 1){
        form.setFieldValue(['guestPortal','wisprPage','externalProviderName'],providers[0].name)
        setProvider(providers[0].name, providers[0].regions)
      }
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
      if(data.guestPortal?.wisprPage?.authType){
        form.setFieldValue(['guestPortal','wisprPage','authType'],
          data.guestPortal?.wisprPage?.authType)
      }
      form.setFieldsValue({ ...data })
      if(data.guestPortal?.redirectUrl){
        form.setFieldValue('redirectCheckbox',true)
      }
      let pName = data.guestPortal?.wisprPage?.externalProviderName
      if(data.guestPortal?.wisprPage?.customExternalProvider){
        form.setFieldValue(['guestPortal','wisprPage','providerName'], pName)
        pName = 'Custom Provider'
      }
      if(pName){
        const regions = _.find(externalProviders,{ name: pName })?.regions
        setRegionOption(regions)
      }
      if(!pName?.trim() || pName==='Custom Provider'){
        form.setFieldValue(['guestPortal','wisprPage','externalProviderName'], 'Custom Provider')
        setIsOtherProvider(true)
      }else setIsOtherProvider(false)
      if(data.guestPortal?.wisprPage?.authRadius?.secondary){
        form.setFieldValue('enableSecondaryAuthServer',true)
      }
      if(data.enableAccountingService&&data.guestPortal?.wisprPage?.accountingRadius){
        form.setFieldValue('enableAccountingService', true)
        if(data.guestPortal?.wisprPage?.accountingRadius.secondary){
          form.setFieldValue('enableSecondaryAcctServer',true)
        }
      }
    }
  },[providerData.data, data, isMspEc])

  useEffect(()=>{
    const { wlanSecurity } = data?.wlan || {}
    if (wlanSecurity) {
      if (!enableOweEncryption) {
        const enablePsk = wlanSecurity !== WlanSecurityEnum.None &&
                          wlanSecurity !== WlanSecurityEnum.OWE
        form.setFieldValue('enablePreShared', enablePsk)
        setEnablePreShared(enablePsk)
        form.setFieldValue('pskProtocol', wlanSecurity)
      } else if (wlanSecurity === WlanSecurityEnum.None) {
        form.setFieldValue('networkSecurity', 'NONE')
      } else if (wlanSecurity === WlanSecurityEnum.OWE) {
        form.setFieldValue('networkSecurity', 'OWE')
      } else {
        form.setFieldValue('networkSecurity', 'PSK')
        setEnablePreShared(true)
        form.setFieldValue('pskProtocol', wlanSecurity)
      }
    }
  }, [data?.wlan?.wlanSecurity])

  useEffect(()=>{
    if(!data?.guestPortal?.wisprPage?.integrationKey){
      form.setFieldValue(['guestPortal','wisprPage','integrationKey'], generateRandomString())
    }
    if ([
      (data?.guestPortal?.wisprPage?.authType === AuthRadiusEnum.ALWAYS_ACCEPT),
      (!data?.wlan?.bypassCPUsingMacAddressAuthentication)
    ].every(Boolean)) {dispatch(statesCollection.useAllAccept)}

    if ([
      (data?.guestPortal?.wisprPage?.authType === AuthRadiusEnum.RADIUS),
      (data?.wlan?.bypassCPUsingMacAddressAuthentication)
    ].every(Boolean)) {dispatch(statesCollection.useBypassCNAAndAuth)}

    if ([
      (data?.guestPortal?.wisprPage?.authType === AuthRadiusEnum.RADIUS),
      (!data?.wlan?.bypassCPUsingMacAddressAuthentication)
    ].every(Boolean)) {dispatch(statesCollection.useOnlyAuth)}
  },[])
  const onGenerateHexKey = () => {
    let hexKey = generateHexKey(26)
    form.setFieldsValue({ wlan: { wepHexKey: hexKey.substring(0, 26) } })
  }
  const securityDescription = () => {
    const wlanSecurity = form.getFieldValue('pskProtocol')
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
  const networkSecurityOptions = Object.entries(WisprSecurityEnum).map(([k, v]) => ({
    value: k,
    label: v
  }))
  const networkSecurityDescription = () => {
    const networkSecurity = form.getFieldValue('networkSecurity')
    return (
      WisprSecurityOptionsDescription[ networkSecurity as keyof typeof WisprSecurityEnum]
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
    if (value === WlanSecurityEnum.OWE) {
      protocol.managementFrameProtection = ManagementFrameProtectionEnum.Required
    }

    setData && setData({
      ...data,
      ...{
        wlan: {
          ...data?.wlan,
          wlanSecurity: value,
          ...protocol
        }
      }
    })
  }

  const onPskChange = async (e: CheckboxChangeEvent) => {
    setEnablePreShared(e.target.checked)
  }

  const region = regionOption?.length === 1? regionOption?.[0]:
    _.find(regionOption,{ name: externalProviderRegion })
  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
        <Form.Item
          name={['guestPortal','wisprPage','externalProviderName']}
          rules={
            [{ required: true }]
          }
          label={$t({ defaultMessage: 'Portal Provider' })}
          initialValue=''
          children={(!isMspEc||(externalProviders && externalProviders.length>1))
            ? <Select onChange={(value)=>{
              const regions = _.find(externalProviders,{ name: value })?.regions
              setProvider(value, regions)
            }}>
              <Select.Option value={''}>
                {$t({ defaultMessage: 'Select provider' })}
              </Select.Option>
              {externalProviders?.map(item=>{
                return <Select.Option key={item.name} value={item.name}>
                  {item.name}
                </Select.Option>
              })}
              <Select.Option value={'Custom Provider'}>
                {$t({ defaultMessage: 'Custom Provider' })}
              </Select.Option>
            </Select>
            : externalProviders?.[0].name}
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
          children={<></>}
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
        <RedirectUrlInput />
        <Form.Item
          name={['guestPortal','wisprPage','customExternalProvider']}
          hidden
          children={<></>}
          initialValue={false}
        />
        <Form.Item
          name={['guestPortal','wisprPage','integrationKey']}
          label={<>{$t({ defaultMessage: 'Integration Key' })}
            <Tooltip.Question
              title={$t({ defaultMessage: 'Copy this password to your vendor\'s'
            +' configuration, to allow it to connect to RUCKUS One' })}
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
        {!enableOweEncryption && <Form.Item>
          <Form.Item
            name='enablePreShared'
            noStyle
            valuePropName='checked'
            initialValue={false}
            children={
              <Checkbox onChange={onPskChange}>
                {$t({ defaultMessage: 'Enable Pre-Shared Key (PSK)' })}
              </Checkbox>
            }
          />
          <Tooltip title={$t({ defaultMessage: 'Require users to enter a passphrase to connect' })}
            placement='bottom'>
            <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
          </Tooltip>
        </Form.Item>}
        {enableOweEncryption && <Form.Item
          name='networkSecurity'
          initialValue={'NONE'}
          label={$t({ defaultMessage: 'Secure your network' })}
          extra={networkSecurityDescription()}
          children={
            <Select
              placeholder={$t({ defaultMessage: 'Select...' })}
              options={networkSecurityOptions}
              onChange={(selected: string) => {
                let security = data?.wlan?.wlanSecurity
                switch(WisprSecurityEnum[selected as keyof typeof WisprSecurityEnum]) {
                  case WisprSecurityEnum.PSK:
                    setEnablePreShared(true)
                    security = WlanSecurityEnum.WPA2Personal
                    break
                  case WisprSecurityEnum.OWE:
                    setEnablePreShared(false)
                    security = WlanSecurityEnum.OWE
                    break
                  case WisprSecurityEnum.NONE:
                    // disable secure network
                    setEnablePreShared(false)
                    security = WlanSecurityEnum.None
                    break
                  default:
                    return
                }
                onProtocolChange(security)
              }}
            />}
        />}

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
            children={<PasswordInput />}
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
            children={<PasswordInput />}
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
            children={<PasswordInput />}
          />
        }
        {enablePreShared && <Form.Item
          label={$t({ defaultMessage: 'Security Protocol' })}
          name='pskProtocol'
          initialValue={WlanSecurityEnum.WPA2Personal}
          extra={securityDescription()}
        >
          <Select onChange={onProtocolChange}>
            {securityOptions}
          </Select>
        </Form.Item>}
        <Form.Item
          name={['wlan','bypassCPUsingMacAddressAuthentication']}
          valuePropName='checked'
          initialValue={true}
          children={
            <Checkbox
              data-testid='bypasscna_checkbox'
              disabled={state.isDisabled.BypassCNA}
              onChange={(e)=>{e.target.checked ?
                dispatch(statesCollection.useBypassCNAAndAuth) :
                dispatch(statesCollection.useOnlyAuth)}}>
              {state.isDisabled.BypassCNA ?
                <Tooltip placement='bottom'
                  title={'In order to enable this option you must \
                  set the authentication service to “Authenticate Connections”'}
                >
                  {$t({ defaultMessage: 'Enable MAC auth bypass' })}
                </Tooltip> :
                $t({ defaultMessage: 'Enable MAC auth bypass' })
              }
            </Checkbox>
          }
        />
        {enableWISPREncryptMacIP && <Form.Item
          name={['guestPortal','wisprPage', 'encryptMacIpEnabled']}
          valuePropName='checked'
          initialValue={true}
          children={
            <Checkbox>
              {$t({ defaultMessage: 'Enable the encryption for users’ MAC and IP addresses' })}
            </Checkbox>
          }
        />}
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox
          guestNetworkTypeEnum={GuestNetworkTypeEnum.WISPr} />
        <WalledGardenTextArea
          guestNetworkTypeEnum={GuestNetworkTypeEnum.WISPr}
          enableDefaultWalledGarden={false} />
        {!regionOption &&
         isOtherProvider &&
         (enableWISPRAlwaysAccept ?
           <WISPrAuthAccContext.Provider value={{ state, dispatch }}>
             <WISPrAuthAccServer
               onClickAuth={() => {
                 dispatch(statesCollection.useOnlyAuth)
                 let mutableData = _.cloneDeep(data) ?? {}
                 _.set(mutableData, 'guestPortal.wisprPage.authType', AuthRadiusEnum.RADIUS)
                 setData && setData(mutableData)
               }}
               onClickAllAccept={() => {
                 dispatch(statesCollection.useAllAccept)
                 let mutableData = _.cloneDeep(data) ?? {}
                 _.set(mutableData, 'guestPortal.wisprPage.authType', AuthRadiusEnum.ALWAYS_ACCEPT)
                 _.unset(mutableData, 'guestPortal.wisprPage.authRadius')
                 setData && setData(mutableData)
               }}
             />
           </WISPrAuthAccContext.Provider>
           : <AuthAccServerSetting/>)
        }
        {regionOption && region && <AuthAccServerSummary summaryData={region as Regions}/>}
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.WISPr}/>
      </GridCol>
    </GridRow>
    {!(editMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>
  )
}
