import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { StepsFormNew, PageHeader, Loader, showActionModal } from '@acx-ui/components'
import {
  useAddSwitchConfigProfileMutation,
  useUpdateSwitchConfigProfileMutation,
  useGetSwitchConfigProfileQuery
}                   from '@acx-ui/rc/services'
import { SwitchConfigurationProfile, Vlan }      from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { AclSetting }                      from './AclSetting'
import { ConfigurationProfileFormContext } from './ConfigurationProfileFormContext'
import { GeneralSetting }                  from './GeneralSetting'
import { Summary }                         from './Summary'
import { TrustedPorts }                    from './TrustedPorts'
import { VenueSetting }                    from './VenueSetting'
import { VlanSetting }                     from './VlanSetting'

export function ConfigurationProfileForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const linkToProfiles = useTenantLink('/networks/wired/profiles')
  const [form] = Form.useForm()

  const { data, isLoading } = useGetSwitchConfigProfileQuery(
    { params }, { skip: !params.profileId })

  const [addSwitchConfigProfile, {
    isLoading: isAddingSwitchConfigProfile }] = useAddSwitchConfigProfileMutation()
  const [updateSwitchConfigProfile, {
    isLoading: isUpdatingSwitchConfigProfile }] = useUpdateSwitchConfigProfileMutation()

  const editMode = params.action === 'edit'
  const [ ipv4DhcpSnooping, setIpv4DhcpSnooping ] = useState(false)
  const [ arpInspection, setArpInspection ] = useState(false)
  const [ currentData, setCurrentData ] =
    useState<SwitchConfigurationProfile>({} as SwitchConfigurationProfile)

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

  const updateTrustedPortsCurrentData = async (data: Partial<SwitchConfigurationProfile>) => {
    const hasEmptyTrustPorts = data.trustedPorts?.some(port => port.trustPorts.length === 0)

    if(hasEmptyTrustPorts){
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Error' }),
        content: $t({ defaultMessage:
          'Please select trusted ports in order to make this configuration profile valid' })
      })
      return false
    }

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
      setCurrentData({} as SwitchConfigurationProfile)
      navigate(linkToProfiles, { replace: true })
    } catch(err) {
      console.log(err) // eslint-disable-line no-console
    }
  }

  const handleEditProfile = async (data: SwitchConfigurationProfile) => {
    try {
      await updateSwitchConfigProfile({ params, payload: proceedData(data) }).unwrap()
      setCurrentData({} as SwitchConfigurationProfile)
      navigate(linkToProfiles)
    } catch (err) {
      console.log(err) // eslint-disable-line no-console
    }
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
          { text: $t({ defaultMessage: 'Wired Networks' }), link: '/networks/wired/profiles' }
        ]}
      />
      <ConfigurationProfileFormContext.Provider value={{ editMode, currentData }}>
        <StepsFormNew
          form={form}
          editMode={editMode}
          onCancel={() => navigate(linkToProfiles, { replace: true })}
          onFinish={editMode ? handleEditProfile : handleAddProfile}
        >
          <StepsFormNew.StepForm
            title={$t({ defaultMessage: 'General' })}
            onFinish={updateCurrentData}
          >
            <GeneralSetting />
          </StepsFormNew.StepForm>

          <StepsFormNew.StepForm
            title={$t({ defaultMessage: 'VLANs' })}
            onFinish={updateVlanCurrentData}
          >
            <VlanSetting />
          </StepsFormNew.StepForm>

          <StepsFormNew.StepForm
            title={$t({ defaultMessage: 'ACLs' })}
            onFinish={updateCurrentData}
          >
            <AclSetting />
          </StepsFormNew.StepForm>

          {(ipv4DhcpSnooping || arpInspection) &&
            <StepsFormNew.StepForm
              title={$t({ defaultMessage: 'Trusted Ports' })}
              onFinish={updateTrustedPortsCurrentData}
            >
              <TrustedPorts />
            </StepsFormNew.StepForm>
          }

          <StepsFormNew.StepForm
            title={$t({ defaultMessage: 'Venues' })}
            onFinish={updateCurrentData}
          >
            <VenueSetting />
          </StepsFormNew.StepForm>

          <StepsFormNew.StepForm
            title={$t({ defaultMessage: 'Summary' })}
          >
            <Summary />
          </StepsFormNew.StepForm>
        </StepsFormNew>
      </ConfigurationProfileFormContext.Provider>
    </Loader>
  )
}
