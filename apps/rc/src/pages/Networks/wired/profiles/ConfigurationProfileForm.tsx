import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm, PageHeader, Loader, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import {
  useAddSwitchConfigProfileMutation,
  useUpdateSwitchConfigProfileMutation,
  useGetSwitchConfigProfileQuery
}                   from '@acx-ui/rc/services'
import { SwitchConfigurationProfile, SwitchModel, TaggedVlanPorts, Vlan, VoiceVlanConfig, VoiceVlanOption } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                            from '@acx-ui/react-router-dom'

import { AclSetting }                               from './AclSetting'
import { ConfigurationProfileFormContext }          from './ConfigurationProfileFormContext'
import { GeneralSetting }                           from './GeneralSetting'
import { Summary }                                  from './Summary'
import { generateTrustedPortsModels, TrustedPorts } from './TrustedPorts'
import { VenueSetting }                             from './VenueSetting'
import { VlanSetting }                              from './VlanSetting'
import { VoiceVlan }                                from './VoiceVlan'

export function ConfigurationProfileForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const linkToProfiles = useTenantLink('/networks/wired/profiles')
  const [form] = Form.useForm()
  const isSwitchVoiceVlanEnhanced = useIsSplitOn(Features.SWITCH_VOICE_VLAN)

  const { data, isLoading } = useGetSwitchConfigProfileQuery(
    { params }, { skip: !params.profileId })

  const [addSwitchConfigProfile, {
    isLoading: isAddingSwitchConfigProfile }] = useAddSwitchConfigProfileMutation()
  const [updateSwitchConfigProfile, {
    isLoading: isUpdatingSwitchConfigProfile }] = useUpdateSwitchConfigProfileMutation()

  const editMode = params.action === 'edit'
  const [ ipv4DhcpSnooping, setIpv4DhcpSnooping ] = useState(false)
  const [ arpInspection, setArpInspection ] = useState(false)
  const [ vlansWithTaggedPorts, setVlansWithTaggedPorts] = useState(false)
  const [ currentData, setCurrentData ] =
    useState<SwitchConfigurationProfile>({} as SwitchConfigurationProfile)

  useEffect(() => {
    if(data){
      setCurrentData(data as SwitchConfigurationProfile)
      updateVlanCurrentData(data)
    }
  }, [data])

  const checkTrustedPortEmpty = (data: Partial<SwitchConfigurationProfile>) => {
    const trustedPortModels = generateTrustedPortsModels(data)
    const hasEmptyTrustPorts = trustedPortModels.some(port => port.trustPorts.length === 0)

    if(hasEmptyTrustPorts){
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Error' }),
        content: $t({ defaultMessage:
          'Please select trusted ports in order to make this configuration profile valid' })
      })
      return true
    }
    return false
  }

  const updateCurrentData = async (data: Partial<SwitchConfigurationProfile>) => {
    setCurrentData({
      ...currentData,
      ...data
    })
    return true
  }

  const generateVoiceVlanOptions = (vlans: Vlan[]) => {
    const modelMap:{ [key:string]: TaggedVlanPorts[] } = {}
    vlans.forEach((vlan: Vlan) => {
      if(vlan.switchFamilyModels) {
        vlan.switchFamilyModels.forEach((model: SwitchModel) => {
          if(model.taggedPorts?.length){
            if(modelMap[model.model]) {
              modelMap[model.model].push({
                vlanId: String(vlan.vlanId),
                taggedPorts: model.taggedPorts.split(',')
              })
            } else {
              modelMap[model.model] = [{
                vlanId: String(vlan.vlanId),
                taggedPorts: model.taggedPorts.split(',')
              }]
            }
          }
        })
      }
    })
    const voiceVlanOptions = Object.keys(modelMap)
      .sort((a:string, b:string) => {
        return (a > b) ? 1 : -1
      })
      .map(model => ({
        model,
        taggedVlans: modelMap[model]
      }))
    return voiceVlanOptions
  }

  const generateVoiceVlanConfig = (options?: VoiceVlanOption[], prevConfig?: VoiceVlanConfig[]) => {
    if(options) {
      const initVoiceVlanConfigs:VoiceVlanConfig[] = options && options
        .map(i => ({ model: i.model, voiceVlans: [] }))

      if(prevConfig){
        initVoiceVlanConfigs.forEach((i, index) => {
          prevConfig.forEach(p => {
            if(i.model == p.model) {
              if(p.voiceVlans.length){
                const validVlans = options[index].taggedVlans // Need check index is OK or not
                p.voiceVlans.forEach(pVlan=>{
                  validVlans.forEach(o => {
                    if(o.vlanId == pVlan.vlanId){
                      const ports = pVlan.taggedPorts
                        .filter(port => o.taggedPorts.indexOf(port)!==-1)
                      if(ports.length) {
                        i.voiceVlans.push({
                          vlanId: pVlan.vlanId,
                          taggedPorts: ports
                        })
                      }
                    }
                  })
                })
              }
            }
          })
        })
      }
      return initVoiceVlanConfigs
    }
    return false
  }

  const updateVlanCurrentData = async (data: Partial<SwitchConfigurationProfile>) => {
    const ipv4DhcpSnoopingValue =
      data.vlans?.filter((item: Partial<Vlan>) => item.ipv4DhcpSnooping === true) || []
    const arpInspectionValue =
      data.vlans?.filter((item: Partial<Vlan>) => item.arpInspection === true) || []
    const vlansWithTaggedPortsValue =
      data.vlans?.filter((item: Partial<Vlan>) => {
        return item.switchFamilyModels ?
          item.switchFamilyModels.find(model => model?.taggedPorts?.length)
          : false
      }) || []
    setIpv4DhcpSnooping(ipv4DhcpSnoopingValue.length > 0)
    setArpInspection(arpInspectionValue.length > 0)
    setVlansWithTaggedPorts(vlansWithTaggedPortsValue.length > 0)
    const voiceVlanOptions = data.vlans && generateVoiceVlanOptions(data.vlans as Vlan[])
    const voiceVlanConfigs = generateVoiceVlanConfig(voiceVlanOptions, currentData.voiceVlanConfigs)
    setCurrentData({
      ...currentData,
      ...data,
      ...(voiceVlanOptions ? { voiceVlanOptions } : {}),
      ...(voiceVlanConfigs ? { voiceVlanConfigs } : {})
    })

    return true
  }

  const updateTrustedPortsCurrentData = async (data: Partial<SwitchConfigurationProfile>) => {
    checkTrustedPortEmpty(data)
    setCurrentData({
      ...currentData,
      ...data
    })

    return true
  }

  const proceedData = (data: SwitchConfigurationProfile) => {
    if(data.trustedPorts){
      if(ipv4DhcpSnooping || arpInspection){
        const vlanModels = data.vlans.map(
          item => item.switchFamilyModels?.map(obj => obj.model)) ||['']
        data.trustedPorts = data.trustedPorts.map(
          item => { return {
            ...item,
            ...{ vlanDemand: vlanModels.join(',').indexOf(item.model) > -1 }
          }})
      } else {
        data.trustedPorts = []
      }
    }
    if(data.voiceVlanOptions) {
      delete data.voiceVlanOptions
    }
    if(data.voiceVlanConfigs && !data.voiceVlanConfigs.length) {
      delete data.voiceVlanConfigs
    }
    return data
  }

  const handleAddProfile = async () => {
    try {
      if(checkTrustedPortEmpty(currentData)){
        return false
      }
      await addSwitchConfigProfile({ params, payload: proceedData(currentData) }).unwrap()
      setCurrentData({} as SwitchConfigurationProfile)
      navigate(linkToProfiles, { replace: true })
    } catch(err) {
      console.log(err) // eslint-disable-line no-console
    }
    return true
  }

  const handleEditProfile = async (formData: SwitchConfigurationProfile) => {
    try {
      if(checkTrustedPortEmpty(formData)){
        return false
      }
      await updateSwitchConfigProfile({
        params, payload: proceedData(formData) }).unwrap()
      setCurrentData({} as SwitchConfigurationProfile)
      navigate(linkToProfiles)
      return true
    } catch (err) {
      console.log(err) // eslint-disable-line no-console
    }
    return true
  }

  return (
    <Loader states={[{
      isLoading: isLoading,
      isFetching: isAddingSwitchConfigProfile || isUpdatingSwitchConfigProfile
    }]}>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Switch Configuration Profile' })
          : $t({ defaultMessage: 'Add Switch Configuration Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Wired Network Profiles' }) },
          {
            text: $t({ defaultMessage: 'Configuration Profiles' }),
            link: '/networks/wired/profiles'
          }
        ]}
      />
      <ConfigurationProfileFormContext.Provider value={{ editMode, currentData }}>
        <StepsForm
          form={form}
          editMode={editMode}
          onCancel={() => navigate(linkToProfiles, { replace: true })}
          onFinish={editMode ? handleEditProfile : handleAddProfile}
        >
          <StepsForm.StepForm
            title={$t({ defaultMessage: 'General' })}
            onFinish={updateCurrentData}
          >
            <GeneralSetting />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'VLANs' })}
            onFinish={updateVlanCurrentData}
          >
            <VlanSetting />
          </StepsForm.StepForm>

          {
            (isSwitchVoiceVlanEnhanced && vlansWithTaggedPorts) &&
            <StepsForm.StepForm
              title={$t({ defaultMessage: 'Voice VLAN' })}
              onFinish={updateCurrentData}
            >
              <VoiceVlan />
            </StepsForm.StepForm>
          }

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'ACLs' })}
            onFinish={updateCurrentData}
          >
            <AclSetting />
          </StepsForm.StepForm>

          {(ipv4DhcpSnooping || arpInspection) &&
            <StepsForm.StepForm
              title={$t({ defaultMessage: 'Trusted Ports' })}
              onFinish={updateTrustedPortsCurrentData}
            >
              <TrustedPorts />
            </StepsForm.StepForm>
          }

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Venues' })}
            onFinish={updateCurrentData}
          >
            <VenueSetting />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Summary' })}
          >
            <Summary />
          </StepsForm.StepForm>
        </StepsForm>
      </ConfigurationProfileFormContext.Provider>
    </Loader>
  )
}
