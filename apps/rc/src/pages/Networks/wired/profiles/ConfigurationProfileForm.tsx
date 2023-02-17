import { useEffect, useRef, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { showToast, StepsForm, PageHeader, StepsFormInstance } from '@acx-ui/components'
import {
  useAddSwitchConfigProfileMutation,
  useUpdateSwitchConfigProfileMutation,
  useSwitchConfigProfileQuery
}                   from '@acx-ui/rc/services'
import { SwitchConfigurationProfile, Vlan }      from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { AclSetting }                  from './AclSetting'
import ConfigurationProfileFormContext from './ConfigurationProfileFormContext'
import { GeneralSetting }              from './GeneralSetting'
import { Summary }                     from './Summary'
import { TrustedPorts }                from './TrustedPorts'
import { VenueSetting }                from './VenueSetting'
import { VlanSetting }                 from './VlanSetting'

export function ConfigurationProfileForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const linkToProfiles = useTenantLink('/networks/wired/profiles')

  const { data } = useSwitchConfigProfileQuery({ params }, { skip: !params.profileId })

  const [addSwitchConfigProfile] = useAddSwitchConfigProfileMutation()
  const [updateSwitchConfigProfile] = useUpdateSwitchConfigProfileMutation()

  const editMode = params.action === 'edit'
  const [ ipv4DhcpSnooping, setIpv4DhcpSnooping ] = useState(false)
  const [ arpInspection, setArpInspection ] = useState(false)
  const [ currentData, setCurrentData ] =
    useState<SwitchConfigurationProfile>({} as SwitchConfigurationProfile)

  const formRef = useRef<StepsFormInstance<SwitchConfigurationProfile>>()

  useEffect(() => {
    if(data){
      setCurrentData(data as SwitchConfigurationProfile)
      updateVlanCurrentData(data)
    }
  }, [data])

  const updateVlanCurrentData = async (data: Partial<SwitchConfigurationProfile>) => {
    const ipv4DhcpSnoopingValue =
      data.vlans?.filter((item: Partial<Vlan>) => item.ipv4DhcpSnooping === true) || []
    const arpInspectionValue =
      data.vlans?.filter((item: Partial<Vlan>) => item.ipv4DhcpSnooping === true) || []

    setIpv4DhcpSnooping(ipv4DhcpSnoopingValue.length > 0)
    setArpInspection(arpInspectionValue.length > 0)

    setCurrentData({
      ...currentData,
      ...data
    })

    return true
  }

  const updateCurrentData = async (data: Partial<SwitchConfigurationProfile>) => {
    setCurrentData({
      ...currentData,
      ...data
    })

    return true
  }

  const proceedData = (data: SwitchConfigurationProfile) => {
    if(data.trustedPorts){
      const vlanModels = data.vlans.map(
        item => item.switchFamilyModels?.map(obj => obj.model)) ||['']
      data.trustedPorts = data.trustedPorts.map(
        item => { return {
          ...item,
          ...{ vlanDemand: vlanModels.join(',').indexOf(item.model) > -1 }
        }})
    }
    return data
  }

  const handleAddProfile = async (data: SwitchConfigurationProfile) => {
    try {
      await addSwitchConfigProfile({ params, payload: proceedData(data) }).unwrap()
      navigate(linkToProfiles, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleEditProfile = async (data: SwitchConfigurationProfile) => {
    try {
      await updateSwitchConfigProfile({ params, payload: proceedData(data) }).unwrap()
      navigate(linkToProfiles, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Switch Configuration Profile' })
          : $t({ defaultMessage: 'Add Switch Configuration Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired Networks' }), link: '/networks/wired/profiles' }
        ]}
      />
      <ConfigurationProfileFormContext.Provider value={{ editMode, currentData }}>
        <StepsForm
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToProfiles, { replace: true })}
          onFinish={async (data) => {
            editMode ? handleEditProfile(data) : handleAddProfile(data)
          }}
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

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'ACLs' })}
            onFinish={updateCurrentData}
          >
            <AclSetting />
          </StepsForm.StepForm>

          {(ipv4DhcpSnooping || arpInspection) &&
            <StepsForm.StepForm
              title={$t({ defaultMessage: 'Trusted Ports' })}
              onFinish={updateCurrentData}
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
    </>
  )
}
