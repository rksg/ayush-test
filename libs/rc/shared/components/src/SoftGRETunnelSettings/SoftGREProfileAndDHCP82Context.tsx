import { useState, useEffect, ReactNode, createContext } from 'react'

import { Form } from 'antd'

import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import {
  useLazyGetSoftGreProfileConfigurationOnVenueQuery
} from '@acx-ui/rc/services'
import {
  useConfigTemplate
} from '@acx-ui/rc/utils'


interface SoftgreProfileContextProps {
  softgreProfile: SoftgreProfile
  toggleSoftgreTunnel: (toggle: boolean) => void
}

export interface SoftgreProfile {
  index: number
  isSoftgreTunnelEnable: boolean
  softgreProfileId: string
  queryPayload: {
    venueId: string
    apModel: string
    portId: string
  }
}

const defaultSoftgreProfileContext = {
  index: 0,
  isSoftgreTunnelEnable: false,
  softgreProfileId: '',
  queryPayload: {
    venueId: '',
    apModel: '',
    portId: ''
  }
} as SoftgreProfile

export const SoftgreProfileAndDHCP82Context = createContext({} as SoftgreProfileContextProps)

export const SoftgreProfileProvider = (
  { value, children }: { value: SoftgreProfile, children: ReactNode }
) => {
  const { isTemplate } = useConfigTemplate()
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)

  const [softgreProfile, setSoftgreProfile] =
    useState<SoftgreProfile>(defaultSoftgreProfileContext)

  const form = Form.useFormInstance()
  const isEthernetPortEnable = Form.useWatch( ['lan', value.index, 'enabled'] ,form)


  const [ getSoftGreProfileConfiguration ] = useLazyGetSoftGreProfileConfigurationOnVenueQuery()
  useEffect(() => {
    if(value) {
      setSoftgreProfile(value)
    }
  },[])
  useEffect(() => {

    const setData = async () => {
      if (
        !isTemplate &&
        isEthernetPortProfileEnabled &&
        isEthernetSoftgreEnabled &&
        isEthernetPortEnable &&
        softgreProfile.isSoftgreTunnelEnable &&
        softgreProfile.softgreProfileId
      ) {
        const { data } = await getSoftGreProfileConfiguration({
          params: { ...value?.queryPayload, policyId: value.softgreProfileId }
        })
      }
    }

    setData()

  }, [softgreProfile, isEthernetPortEnable])

  const toggleSoftgreTunnel = (toggle: boolean) => {
    setSoftgreProfile({ ...softgreProfile, isSoftgreTunnelEnable: toggle })
  }


  return (
    <SoftgreProfileAndDHCP82Context.Provider value={{ softgreProfile, toggleSoftgreTunnel }}>
      {children}
    </SoftgreProfileAndDHCP82Context.Provider>
  )
}