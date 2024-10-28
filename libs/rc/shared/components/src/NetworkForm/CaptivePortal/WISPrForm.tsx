import { useContext, useEffect, useRef, useState, useReducer } from 'react'

import {
  Form,
  Select,
  Checkbox,
  Input,
  InputRef
} from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { useGetMspEcProfileQuery }                            from '@acx-ui/msp/services'
import { MSPUtils }                                           from '@acx-ui/msp/utils'
import { useExternalProvidersQuery }                          from '@acx-ui/rc/services'
import {
  NetworkSaveData,
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  Providers,
  Regions,
  URLProtocolRegExp,
  AuthRadiusEnum
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { AuthAccServerSummary }                                                                     from './AuthAccServerSummary'
import { DhcpCheckbox }                                                                             from './DhcpCheckbox'
import { RedirectUrlInput }                                                                         from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox }                                                    from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                                                                     from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WISPrAuthAccServer }                                                                       from './SharedComponent/WISPrAuthAccServer'
import { statesCollection, WISPrAuthAccContext, WISPrAuthAccServerState, WISPrAuthAccServerAction } from './SharedComponent/WISPrAuthAccServer/WISPrAuthAccServerReducer'
import { WlanSecurityFormItems }                                                                    from './SharedComponent/WlanSecurity/WlanSecuritySettings'

const mspUtils = MSPUtils()
export function WISPrForm () {
  const {
    data,
    editMode,
    cloneMode,
    isGptMode,
    setData
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const params = useParams()
  const { data: mspEcProfileData } = useGetMspEcProfileQuery({ params })
  const inputKey = useRef<InputRef>(null)
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const externalProviderRegion = useWatch(['guestPortal','wisprPage','externalProviderRegion'])
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const providerData = useExternalProvidersQuery({ params, enableRbac: isUseRbacApi })
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

  const generateRandomString = () => {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let randomString = ''
    for (let i = 0; i < 16; i++) {
      const randomPosition = Math.floor(Math.random() * charSet.length)
      randomString += charSet.substring(randomPosition, randomPosition + 1)
    }
    return randomString
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
            [{ required: true, message: $t(validationMessages.validateURL) },
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
        <WlanSecurityFormItems />
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
        <Form.Item
          name={['guestPortal','wisprPage', 'encryptMacIpEnabled']}
          valuePropName='checked'
          initialValue={true}
          children={
            <Checkbox>
              {$t({ defaultMessage: 'Enable the encryption for users’ MAC and IP addresses' })}
            </Checkbox>
          }
        />
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox />
        <WalledGardenTextArea
          enableDefaultWalledGarden={false} />
        {!regionOption &&
         isOtherProvider &&
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
        }
        {regionOption && region && <AuthAccServerSummary summaryData={region as Regions}/>}
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.WISPr}
          wlanSecurity={data?.wlan?.wlanSecurity}
          // eslint-disable-next-line max-len
          wisprWithAlwaysAccept={data?.guestPortal?.wisprPage?.authType === AuthRadiusEnum.ALWAYS_ACCEPT}
        />
      </GridCol>
    </GridRow>
    {!(editMode) && !(isGptMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>
  )
}
