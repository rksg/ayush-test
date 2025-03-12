import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { StepsForm, PageHeader, Loader, showActionModal }   from '@acx-ui/components'
import { Features, useIsSplitOn }                           from '@acx-ui/feature-toggle'
import {
  useAddSwitchConfigProfileMutation, // wait
  useUpdateSwitchConfigProfileMutation, //wait
  useGetSwitchConfigProfileQuery,
  useGetSwitchConfigProfileTemplateQuery,
  useAddSwitchConfigProfileTemplateMutation,
  useUpdateSwitchConfigProfileTemplateMutation,
  useLazyGetProfilesQuery,
  useLazyGetSwitchConfigProfileTemplateListQuery,
  useBatchAssociateSwitchProfileMutation,
  useBatchDisassociateSwitchProfileMutation,
  useBatchAssociateSwitchConfigProfileTemplateMutation,
  useBatchDisassociateSwitchConfigProfileTemplateMutation
}                   from '@acx-ui/rc/services'
import {
  ConfigurationProfile,
  useConfigTemplatePageHeaderTitle, SwitchConfigurationProfile, SwitchModel,
  TaggedVlanPorts, useConfigTemplateBreadcrumb,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  Vlan, VoiceVlanConfig, VoiceVlanOption,
  useConfigTemplateLazyQueryFnSwitcher,
  useConfigTemplate } from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import { usePathBasedOnConfigTemplate } from '../configTemplates'

import { AclSetting }                               from './AclSetting'
import { ConfigurationProfileFormContext }          from './ConfigurationProfileFormContext'
import { GeneralSetting }                           from './GeneralSetting'
import { PortProfile }                              from './PortProfile'
import { Summary }                                  from './Summary'
import { generateTrustedPortsModels, TrustedPorts } from './TrustedPorts'
import { VenueSetting }                             from './VenueSetting'
import { VlanPortSetting }                          from './VlanPortSetting'
import { VlanSetting }                              from './VlanSetting'
import { VoiceVlan }                                from './VoiceVlan'

export const profilesPayload = {
  filterType: null,
  pageSize: 9999,
  sortField: 'name',
  sortOrder: 'DESC'
}

export function ConfigurationProfileForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const linkToProfiles = usePathBasedOnConfigTemplate('/networks/wired/profiles', '')
  const [form] = Form.useForm()

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchPortProfileToggle = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isBulkVlanProvisioningEnabled = useIsSplitOn(Features.BULK_VLAN_PROVISIONING)
  const rbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isSwitchRbacEnabled

  const [getProfiles] = useConfigTemplateLazyQueryFnSwitcher({
    useLazyQueryFn: useLazyGetProfilesQuery,
    useLazyTemplateQueryFn: useLazyGetSwitchConfigProfileTemplateListQuery
  })
  const profileOnboardOnlyEnabled = useIsSplitOn(Features.SWITCH_PROFILE_ONBOARD_ONLY)

  const { data, isLoading } = useConfigTemplateQueryFnSwitcher<ConfigurationProfile>({
    useQueryFn: useGetSwitchConfigProfileQuery,
    useTemplateQueryFn: useGetSwitchConfigProfileTemplateQuery,
    skip: !params.profileId,
    enableRbac: isSwitchRbacEnabled,
    extraQueryArgs: {
      enableSwitchPortProfile: isSwitchPortProfileToggle
    }
  })

  // eslint-disable-next-line max-len
  const [addSwitchConfigProfile, { isLoading: isAddingSwitchConfigProfile }] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddSwitchConfigProfileMutation,
    useTemplateMutationFn: useAddSwitchConfigProfileTemplateMutation
  })
  // eslint-disable-next-line max-len
  const [updateSwitchConfigProfile, { isLoading: isUpdatingSwitchConfigProfile }] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateSwitchConfigProfileMutation,
    useTemplateMutationFn: useUpdateSwitchConfigProfileTemplateMutation
  })

  const [batchAssociateSwitchConfigProfile] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useBatchAssociateSwitchProfileMutation,
    useTemplateMutationFn: useBatchAssociateSwitchConfigProfileTemplateMutation
  })

  const [batchDisassociateSwitchConfigProfile] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useBatchDisassociateSwitchProfileMutation,
    useTemplateMutationFn: useBatchDisassociateSwitchConfigProfileTemplateMutation
  })

  const editMode = params.action === 'edit'
  const [vlansWithTaggedPorts, setVlansWithTaggedPorts] = useState(false)
  const [ipv4DhcpSnooping, setIpv4DhcpSnooping] = useState(false)
  const [arpInspection, setArpInspection] = useState(false)
  const [trustedPorts, setTrustedPorts] = useState(false)
  const [currentData, setCurrentData ] =
    useState<SwitchConfigurationProfile>({} as SwitchConfigurationProfile)

  // Config Template related states
  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: 'Wired' }) },
    { text: $t({ defaultMessage: 'Wired Network Profiles' }) },
    { text: $t({ defaultMessage: 'Configuration Profiles' }), link: '/networks/wired/profiles' }
  ])
  const pageTitle = useConfigTemplatePageHeaderTitle({
    isEdit: editMode,
    instanceLabel: $t({ defaultMessage: 'Switch Configuration Profile' })
  })

  useEffect(() => {
    if(data){
      const newData = { ...data }
      setCurrentData(newData as SwitchConfigurationProfile)
      updateVlanCurrentData(newData, 'init')
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
            const vlanId = String(vlan.vlanId)
            const taggedPorts = model.taggedPorts.split(',')
            modelMap[model.model] = modelMap[model.model]
              ? [...modelMap[model.model], { vlanId, taggedPorts }]
              : [{ vlanId, taggedPorts }]
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
    if (!options) return false

    const initVoiceVlanConfigs: VoiceVlanConfig[] = options.map((option) => {
      const matchingPrevConfig = prevConfig?.find((prev) => prev.model === option.model)
      const taggedVlans = option.taggedVlans || []

      if (!matchingPrevConfig || matchingPrevConfig.voiceVlans.length === 0) {
        return {
          model: option.model,
          voiceVlans: []
        }
      }

      const newVoiceVlans = matchingPrevConfig.voiceVlans
        .filter((prevVlan) => taggedVlans.some(
          (taggedVlan) => taggedVlan.vlanId == prevVlan.vlanId))
        .map((prevVlan) => {
          const taggedPorts = prevVlan.taggedPorts.filter((port) =>
            taggedVlans.find(
              (taggedVlan) => taggedVlan.vlanId == prevVlan.vlanId)?.taggedPorts.includes(port)
          )

          return {
            vlanId: prevVlan.vlanId,
            taggedPorts
          }
        })

      return {
        model: option.model,
        voiceVlans: newVoiceVlans
      }
    })

    return initVoiceVlanConfigs

  }

  const updateVlanCurrentData = async (
    data: Partial<SwitchConfigurationProfile>,
    timing?: string
  ) => {
    const nextCurrentData = {
      ...currentData,
      ...data
    }
    const ipv4DhcpSnoopingValue = nextCurrentData.vlans?.filter(
      (item: Partial<Vlan>) => item.ipv4DhcpSnooping === true) || []
    const arpInspectionValue = nextCurrentData.vlans?.filter(
      (item: Partial<Vlan>) => item.arpInspection === true) || []
    const vlansWithTaggedPortsValue = nextCurrentData.vlans?.filter(
      (item: Partial<Vlan>) => {
        return item.switchFamilyModels ?
          item.switchFamilyModels.find(model => model?.taggedPorts?.length)
          : false
      }) || []

    setIpv4DhcpSnooping(ipv4DhcpSnoopingValue.length > 0)
    setArpInspection(arpInspectionValue.length > 0)
    setVlansWithTaggedPorts(vlansWithTaggedPortsValue.length > 0)
    setTrustedPorts(nextCurrentData.trustedPorts?.length > 0)

    const voiceVlanOptions =
      nextCurrentData.vlans && generateVoiceVlanOptions(nextCurrentData.vlans as Vlan[])
    const currentVoiceVlanConfigs = timing === 'init' ? data.voiceVlanConfigs
      : currentData.voiceVlanConfigs
    const voiceVlanConfigs = generateVoiceVlanConfig(voiceVlanOptions, currentVoiceVlanConfigs)
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

  const proceedData = (formData: SwitchConfigurationProfile) => {
    const data = _.cloneDeep(formData) as SwitchConfigurationProfile
    if(data.trustedPorts){
      const vlanModels = data.vlans?.map(
        item => item.switchFamilyModels?.map(obj => obj.model)) ||['']

      if(vlanModels.length > 0) {
        data.trustedPorts = data.trustedPorts?.map(
          item => { return {
            ...item,
            ...{ vlanDemand: vlanModels.join(',').indexOf(item.model) > -1 }
          }})
      }
    } else {
      data.trustedPorts = []
    }
    if(data.vlans) {
      data.vlans.forEach((vlan:Partial<Vlan>) => {
        vlan.switchFamilyModels?.forEach((model) => {
          delete model.voicePorts
        })
      })
    } else {
      data.vlans = []
    }
    if(data.voiceVlanOptions) {
      delete data.voiceVlanOptions
    }
    if(data.voiceVlanConfigs && !data.voiceVlanConfigs.length) {
      delete data.voiceVlanConfigs
    }
    if (profileOnboardOnlyEnabled) {
      data.applyOnboardOnly = !data.applyOnboardOnly
    } else {
      data.applyOnboardOnly = false
    }
    return data
  }

  const associateWithCliProfile = async (
    venues: string[],
    cliProfileId?: string,
    callBack?: () => void
  ) => {
    const profileId = params.profileId || cliProfileId
    const hasAssociatedVenues = venues.length > 0

    if (rbacEnabled && hasAssociatedVenues && profileId) {
      const requests = venues.map((key: string)=> ({
        params: { venueId: key, profileId }
      }))

      await batchAssociateSwitchConfigProfile(requests).then(callBack)
    }
    return Promise.resolve()
  }

  const disassociateWithCliProfile = async (
    venues: string[],
    callBack?: () => void
  ) => {
    const hasDisassociatedVenues = venues.length > 0
    if (rbacEnabled && hasDisassociatedVenues) {
      const requests = venues.map((key: string)=> ({
        params: { venueId: key, profileId: params.profileId }
      }))
      await batchDisassociateSwitchConfigProfile(requests).then(callBack)
    }
    return Promise.resolve()
  }

  const handleAddProfile = async () => {
    try {
      if(checkTrustedPortEmpty(currentData)){
        return false
      }
      const hasAssociatedVenues = (currentData.venues ?? [])?.length > 0
      await addSwitchConfigProfile({
        params,
        payload: proceedData(currentData),
        enableRbac: rbacEnabled,
        enableSwitchPortProfile: isSwitchPortProfileToggle
      }).unwrap()

      if (rbacEnabled && hasAssociatedVenues) {
        const { data: profileList } = await getProfiles({
          params, payload: profilesPayload, enableRbac: true
        }).unwrap()
        const profileId = profileList?.filter(t =>
          t.name === currentData?.name)?.map(t => t.id)?.[0]
        await associateWithCliProfile(currentData?.venues ?? [], profileId)
      }

      setCurrentData({} as SwitchConfigurationProfile)
      navigate(linkToProfiles, { replace: true })
    } catch(err) {
      console.log(err) // eslint-disable-line no-console
    }
    return true
  }

  const handleEditProfile = async (formData: SwitchConfigurationProfile) => {
    try {
      if (checkTrustedPortEmpty(formData)) {
        return false
      }
      const orinAppliedVenues = data?.venues as string[]
      const appliedVenues = formData?.venues as string[]
      const disassociateSwitch = _.difference(orinAppliedVenues, appliedVenues)
      const diffAssociatedSwitch = _.difference(appliedVenues, orinAppliedVenues)

      await disassociateWithCliProfile(disassociateSwitch)
      await updateSwitchConfigProfile({
        params,
        payload: proceedData(formData),
        enableRbac: rbacEnabled,
        enableSwitchPortProfile: isSwitchPortProfileToggle
      }).unwrap()
      await associateWithCliProfile(diffAssociatedSwitch)
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
        title={pageTitle}
        breadcrumb={breadcrumb}
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
            onFinish={(data:Partial<SwitchConfigurationProfile>) => updateVlanCurrentData(data)}
          >
            <VlanSetting />
          </StepsForm.StepForm>

          { isBulkVlanProvisioningEnabled && <StepsForm.StepForm
            title={$t({ defaultMessage: 'Ports' })}
            onFinish={(data:Partial<SwitchConfigurationProfile>) => updateVlanCurrentData(data)}
          >
            <VlanPortSetting />
          </StepsForm.StepForm> }

          {
            vlansWithTaggedPorts &&
            <StepsForm.StepForm
              title={$t({ defaultMessage: 'Voice VLAN' })}
              onFinish={updateCurrentData}
            >
              <div data-testid='voice-vlan'>
                <VoiceVlan />
              </div>
            </StepsForm.StepForm>
          }

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'ACLs' })}
            onFinish={updateCurrentData}
          >
            <AclSetting />
          </StepsForm.StepForm>

          {isSwitchPortProfileToggle &&
          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Port Profiles' })}
            onFinish={updateCurrentData}
          >
            <PortProfile />
          </StepsForm.StepForm>
          }

          {(trustedPorts || arpInspection || ipv4DhcpSnooping) &&
            <StepsForm.StepForm
              title={$t({ defaultMessage: 'Trusted Ports' })}
              onFinish={updateTrustedPortsCurrentData}
            >
              <TrustedPorts />
            </StepsForm.StepForm>
          }

          <StepsForm.StepForm
            title={$t({ defaultMessage: '<VenuePlural></VenuePlural>' })}
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
