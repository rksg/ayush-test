import { useState, useEffect, ReactNode, createContext, useReducer } from 'react'

import { Form } from 'antd'
import _        from 'lodash'

import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import {
  useLazyGetSoftGreProfileConfigurationOnVenueQuery
} from '@acx-ui/rc/services'
import {
  useConfigTemplate,
  DhcpOption82Settings
} from '@acx-ui/rc/utils'
import { VenueApModelLanPortSettingsV1 } from '@acx-ui/rc/utils'

interface SoftgreProfileContextProps {
  softgreProfile: SoftgreContextInfo
  venueApModelLanPortSettingsV1?: VenueApModelLanPortSettingsV1
  onChangeSoftgreTunnel: (toggle: boolean) => void
  onChangeDHCPOption82Settings: (dhcpOption82Settings: DhcpOption82Settings) => void
}

export interface SoftgreContextInfo {
  index: number
  isSoftgreTunnelEnable: boolean
  softgreProfileId: string
  queryPayload: {
    venueId: string
    apModel: string
    portId: string
  }
}

const defaultContextInfo = {
  index: 0,
  isSoftgreTunnelEnable: false,
  softgreProfileId: '',
  queryPayload: {
    venueId: '',
    apModel: '',
    portId: ''
  }
} as SoftgreContextInfo


export enum SoftGreState {
  Init,
  TurnOffSoftGre,
  TurnOnSoftGre,
  TurnOnDHCPOption82,
  TurnOffDHCPOption82,
  ModifyDHCPOption82Settings,
}

export const SoftgreProfileAndDHCP82Context = createContext({} as SoftgreProfileContextProps)
/* eslint-disable max-len */
export const SoftgreProfileProvider = (
  { value, children }: { value: SoftgreContextInfo, children: ReactNode }
) => {
  const { isTemplate } = useConfigTemplate()
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const [originVenueApModelLanPortSettingsV1, setOriginVenueApModelLanPortSettingsV1] =
    useState<VenueApModelLanPortSettingsV1>({ softGreEnabled: false })
  const [venueApModelLanPortSettingsV1, setVenueApModelLanPortSettingsV1] =
    useState<VenueApModelLanPortSettingsV1>({ softGreEnabled: false })
  const [contextInfo, setContextInfo] = useState<SoftgreContextInfo>(defaultContextInfo)

  const form = Form.useFormInstance()
  const isEthernetPortEnable = Form.useWatch( ['lan', value.index, 'enabled'] ,form)


  const actionRunner = (current: SoftGreState, next: SoftGreState) => {
    let state = SoftGreState.Init
    switch(next){
      case SoftGreState.TurnOnSoftGre:
        setContextInfo({ ...contextInfo, isSoftgreTunnelEnable: true })
        setVenueApModelLanPortSettingsV1({
          ...venueApModelLanPortSettingsV1,
          ...{
            softGreEnabled: true
          }
        })
        state = SoftGreState.TurnOnSoftGre
        break
      case SoftGreState.TurnOffSoftGre:
        setContextInfo({ ...contextInfo, isSoftgreTunnelEnable: false })
        setVenueApModelLanPortSettingsV1({
          ...venueApModelLanPortSettingsV1,
          ...{
            softGreEnabled: false
          }
        })
        state = SoftGreState.TurnOffSoftGre
        break
      case SoftGreState.TurnOnDHCPOption82:
        setVenueApModelLanPortSettingsV1({
          ...venueApModelLanPortSettingsV1,
          ...{
            softGreSettings: {
              dhcpOption82Enabled: true
            }
          }
        })
        state = SoftGreState.TurnOnDHCPOption82
        break
      case SoftGreState.TurnOffDHCPOption82:
        setVenueApModelLanPortSettingsV1({
          ...venueApModelLanPortSettingsV1,
          ...{
            softGreSettings: {
              dhcpOption82Enabled: false
            }
          }
        })
        state = SoftGreState.TurnOffDHCPOption82
        break
      case SoftGreState.ModifyDHCPOption82Settings:
        const settings = form?.getFieldValue(['lan', value.index, 'dhcpOption82']) as DhcpOption82Settings
        setVenueApModelLanPortSettingsV1({
          ...venueApModelLanPortSettingsV1,
          ...{
            softGreSettings: {
              dhcpOption82Settings: settings
            }
          }
        })
        state = SoftGreState.ModifyDHCPOption82Settings
        break
      default:
        console.error(`Invalid action: ${next}`) // eslint-disable-line no-console
        state = next
        break
    }
    if (!_.isEqual(originVenueApModelLanPortSettingsV1, venueApModelLanPortSettingsV1)) {
      // TODO notify state in Lanport and trigger update
    }
    return state
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [state, dispatch] = useReducer(actionRunner, SoftGreState.Init)

  const [ getSoftGreProfileConfiguration ] = useLazyGetSoftGreProfileConfigurationOnVenueQuery()
  useEffect(() => {
    if(value) {
      setContextInfo(value)
    }
  },[])
  useEffect(() => {

    const setData = async () => {
      if (
        !isTemplate &&
        isEthernetPortProfileEnabled &&
        isEthernetSoftgreEnabled &&
        isEthernetPortEnable &&
        contextInfo.isSoftgreTunnelEnable &&
        contextInfo.softgreProfileId
      ) {
        if (value.queryPayload.apModel) {
          const { data } = await getSoftGreProfileConfiguration({
            params: { ...value?.queryPayload }
          })
          if (data) {
            setVenueApModelLanPortSettingsV1(data)
            setOriginVenueApModelLanPortSettingsV1(data)
          }
        }
      }
    }

    setData()

  }, [contextInfo, isEthernetPortEnable])

  const onChangeSoftgreTunnel = (toggle: boolean) => {
    toggle ? dispatch(SoftGreState.TurnOnSoftGre) : dispatch(SoftGreState.TurnOffSoftGre)
  }

  const onChangeDHCPOption82Enable = (toggle: boolean) => {
    toggle ? dispatch(SoftGreState.TurnOnDHCPOption82) : dispatch(SoftGreState.TurnOffDHCPOption82)
  }

  const onChangeDHCPOption82Settings = (dhcpOption82Settings: DhcpOption82Settings) => {
    dispatch(SoftGreState.ModifyDHCPOption82Settings)
  }

  return (
    <SoftgreProfileAndDHCP82Context.Provider value={{
      softgreProfile: contextInfo,
      venueApModelLanPortSettingsV1,
      onChangeSoftgreTunnel,
      onChangeDHCPOption82Settings
    }}>
      {children}
    </SoftgreProfileAndDHCP82Context.Provider>
  )
}
