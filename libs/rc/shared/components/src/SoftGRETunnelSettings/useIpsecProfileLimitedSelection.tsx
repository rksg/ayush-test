import { MutableRefObject, useEffect, useReducer, useState } from 'react'

import { Form }              from 'antd'
import { DefaultOptionType } from 'antd/lib/select'

import { StepsFormLegacyInstance }                                      from '@acx-ui/components'
import { useIsSplitOn, Features }                                       from '@acx-ui/feature-toggle'
import { useGetSoftGreViewDataListQuery, useGetIpsecViewDataListQuery } from '@acx-ui/rc/services'
import {
  useConfigTemplate,
  IpsecActivation,
  WifiApSetting,
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState,
  IpsecViewData,
  SoftGreViewData,
  IpsecOptionChangeState,
  IpsecOptionChangeDispatcher,
  Voter
} from '@acx-ui/rc/utils'

enum ActionLevelEnum {
    NETWORK = 'NETWORK',
    VENUE = 'VENUE',
    AP = 'AP'
  }
export interface SoftGreIpsecProfile {
    actionLevel: ActionLevelEnum
    softGreId: string
    ipsecId?: string
    isChangable: boolean,
    portId?: string
    apModel?: string,
    serialNumber?: string
  }
/* istanbul ignore next */
export const useIpsecProfileLimitedSelection = (
  props: {
    venueId: string
    isVenueOperation: boolean
    duplicationChangeDispatch: React.Dispatch<SoftGreDuplicationChangeDispatcher>
    formRef?: MutableRefObject<StepsFormLegacyInstance<WifiApSetting>>
  }
) => {
  const { isTemplate } = useConfigTemplate()
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isWifiIpsecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const {
    venueId,
    isVenueOperation,
    duplicationChangeDispatch,
    formRef
  } = props

  const form = Form.useFormInstance()

  const [softGreOptionList, setSoftGreOptionList] = useState<DefaultOptionType[]>([])
  const [ipsecOptionList, setIpsecOptionList] = useState<DefaultOptionType[]>([])

  const [boundSoftGreIpsecData, setBoundSoftGreIpsecData] = useState<SoftGreIpsecProfile[]>([])
  const [newSoftGreIpsecList, setNewSoftGreIpsecList] = useState<SoftGreIpsecProfile[]>([])
  const [boundSoftGre, setBoundSoftGre] = useState(false)
  const [hasCleanOperations, setHasCleanOperations] = useState(false)

  const allowSoftGetGrePorfiles = !isTemplate
    && isEthernetSoftgreEnabled
    && isEthernetPortProfileEnabled

  const allowIpsecGetPorfiles = allowSoftGetGrePorfiles && isWifiIpsecOverNetworkEnabled

  const { softGreData } = useGetSoftGreViewDataListQuery({
    payload: {
      page: 1,
      pageSize: 10_000,
      fields: ['name', 'id', 'activations', 'venueActivations', 'apActivations'],
      filters: {}
    } }, {
    skip: !allowIpsecGetPorfiles,
    selectFromResult: ({ data }) => {
      return { softGreData: data?.data }
    }
  })

  const { ipsecData } = useGetIpsecViewDataListQuery({
    payload: {
      page: 1,
      pageSize: 10_000,
      fields: ['name', 'id', 'activations', 'venueActivations', 'apActivations'],
      filters: {}
    } }, {
    skip: !allowIpsecGetPorfiles && !softGreData,
    selectFromResult: ({ data }) => {
      return { ipsecData: data?.data }
    }
  })

  const getUsedSoftGreProfiles = (softGreList: SoftGreViewData[]) => {
    const softGreIds = new Set<string>()
    const boundSoftGreList = new Array<SoftGreIpsecProfile>()
    softGreList.forEach(softGre => {
      softGre.activations?.forEach(act => {
        if (act.venueId === venueId) {
          if (!softGreIds.has(softGre.id)) {
            softGreIds.add(softGre.id)
            boundSoftGreList.push({
              actionLevel: ActionLevelEnum.NETWORK,
              softGreId: softGre.id,
              isChangable: false
            })
          }
        }
      })
      softGre.venueActivations?.forEach(act => {
        if (act.venueId === venueId) {
          if (!softGreIds.has(softGre.id)) {
            softGreIds.add(softGre.id)
          }
          boundSoftGreList.push({
            actionLevel: ActionLevelEnum.VENUE,
            softGreId: softGre.id,
            isChangable: isVenueOperation,
            apModel: act.apModel,
            portId: act.portId.toString()
          })
        }
      })
      softGre.apActivations?.forEach(act => {
        if (act.venueId === venueId) {
          if (!softGreIds.has(softGre.id)) {
            softGreIds.add(softGre.id)
          }
          boundSoftGreList.push({
            actionLevel: ActionLevelEnum.AP,
            softGreId: softGre.id,
            isChangable: !isVenueOperation,
            serialNumber: act.apSerialNumber,
            portId: act.portId.toString()
          })
        }
      })
    })
    return { softGreIds, boundSoftGreList }
  }

  const getUsedIpsecProfiles = (ipsecProfileList: IpsecViewData[]) => {
    const boundIpsecList = new Array<SoftGreIpsecProfile>()

    ipsecProfileList.forEach(ipsec => {
      let boundIpsec = ipsec.activations?.find(
        act => act.venueId === venueId) || {} as IpsecActivation
      if (boundIpsec.softGreProfileId && boundIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.NETWORK,
          softGreId: boundIpsec.softGreProfileId,
          ipsecId: ipsec.id,
          isChangable: false
        })
      }

      ipsec.venueActivations?.filter(
        act => act.venueId === venueId).forEach(act => {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.VENUE,
          softGreId: act.softGreProfileId,
          ipsecId: ipsec.id,
          isChangable: isVenueOperation,
          apModel: act.apModel,
          portId: act.portId.toString()
        })
      })

      ipsec.apActivations?.filter(
        act => act.venueId === venueId).forEach(act => {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.AP,
          softGreId: act.softGreProfileId,
          ipsecId: ipsec.id,
          isChangable: !isVenueOperation,
          serialNumber: act.apSerialNumber,
          portId: act.portId.toString()
        })
      })
    })
    return boundIpsecList
  }

  useEffect(() => {
    const setData = () => {
      const softGreList = ((allowSoftGetGrePorfiles
        && softGreData && softGreData?.length > 0) ? softGreData : [])

      const ipsecProfileList = ((allowIpsecGetPorfiles
        && ipsecData && ipsecData?.length > 0) ? ipsecData : [])
      const { softGreIds, boundSoftGreList } = getUsedSoftGreProfiles(softGreList)



      if (softGreList.length > 0) {
        setSoftGreOptionList(softGreList.map((softGre) => {
          return { label: softGre.name, value: softGre.id }
        }))
      }

      const boundIpsecList = getUsedIpsecProfiles(ipsecProfileList)

      if (hasCleanOperations) {
        if (newSoftGreIpsecList.length > 0 && !!newSoftGreIpsecList[0].ipsecId) {
          if (!!!boundIpsecList || boundIpsecList.length === 0 || (boundIpsecList?.[0].ipsecId
            && newSoftGreIpsecList[0].ipsecId !== boundIpsecList[0].ipsecId)
          ) {
            return
          }
        }
        // load data from backend, clean all user actions
        setNewSoftGreIpsecList([])
        setHasCleanOperations(false)
      }

      if (boundIpsecList.length > 0) {
        setBoundSoftGreIpsecData(boundIpsecList)

        setIpsecOptionList(ipsecProfileList.map((ipsec) => {
          if (ipsec.id === boundIpsecList[0].ipsecId) {
            return { label: ipsec.name, value: ipsec.id, disabled: false }
          }
          return { label: ipsec.name, value: ipsec.id, disabled: true }
        }))

        restrictSoftGreOptionsToSpecificSoftGre(boundIpsecList[0].softGreId)
      } else if (softGreIds.size > 0) {
        setBoundSoftGreIpsecData(boundSoftGreList)

        setIpsecOptionList(ipsecProfileList.map((ipsec) => {
          return { label: ipsec.name, value: ipsec.id, disabled: true }
        }))
      } else {
        if (boundSoftGreIpsecData.length > 0) {
          setBoundSoftGreIpsecData([])
        }
        if (ipsecProfileList.length > 0) {
          setIpsecOptionList(ipsecProfileList.map((ipsec) => {
            return { label: ipsec.name, value: ipsec.id }
          }))
        }
      }


    }
    if (ipsecData && softGreData) {
      setData()
    }
  }, [ipsecData, softGreData])

  const restrictSoftGreOptionsToSpecificSoftGre = (softGreId: string) => {
    changeSoftGreOptionState(SoftGreDuplicationChangeState.BoundIpSec, softGreId)
  }
  const enableSoftGreOptions = () => {
    changeSoftGreOptionState(SoftGreDuplicationChangeState.UnboundIpSec)
  }

  const changeSoftGreOptionState = (state: SoftGreDuplicationChangeState, softGreId?: string) => {
    duplicationChangeDispatch({
      state, softGreProfileId: softGreId
    })
    setBoundSoftGre(state === SoftGreDuplicationChangeState.BoundIpSec)
  }

  const restrictIpsecOptionsToSpecificIpsec = (ipsecId?: string) => {
    setIpsecOptionList(ipsecOptionList.map((ipsec) => {
      if (ipsec.value === ipsecId) {
        return { ...ipsec, disabled: false }
      }
      return { ...ipsec, disabled: true }
    }))
  }
  const disableAllIpsecOptions = () => {
    changeIpsecOptionState(true)
  }
  const enableAllIpsecOptions = () => {
    changeIpsecOptionState(false)
  }
  const changeIpsecOptionState = (disabled: boolean) => {
    setIpsecOptionList(ipsecOptionList.map((ipsec) => {
      return { ...ipsec, disabled: disabled }
    }))
  }

  useEffect(() => {
    if (boundSoftGreIpsecData.length > 0) {
      if (boundSoftGreIpsecData[0].ipsecId) {
        restrictIpsecOptionsToSpecificIpsec(boundSoftGreIpsecData[0].ipsecId)

        if (boundSoftGreIpsecData[0].softGreId && boundSoftGreIpsecData.length > 1) {
          restrictSoftGreOptionsToSpecificSoftGre(boundSoftGreIpsecData[0].softGreId)
        }
      } else {
        disableAllIpsecOptions()
        if (boundSoftGre) {
          enableSoftGreOptions()
        }
      }
    } else if (newSoftGreIpsecList.length > 0) {
      const setIpSec = newSoftGreIpsecList.filter(data => data.ipsecId)
      const setSoftGre = newSoftGreIpsecList
        .filter(data => data.softGreId.length > 0 && !!!data.ipsecId)
      if (setIpSec.length > 0 && newSoftGreIpsecList.length > 1) {
        restrictIpsecOptionsToSpecificIpsec(setIpSec[0].ipsecId)
        const chooseSoftGre = setIpSec.find(data => data.softGreId.length > 0)
        if (chooseSoftGre) {
          restrictSoftGreOptionsToSpecificSoftGre(chooseSoftGre.softGreId)
        }
      } else if (setSoftGre.length > 0 && newSoftGreIpsecList.length > 1) {
        disableAllIpsecOptions()
        if (boundSoftGre) {
          enableSoftGreOptions()
        }
      } else {
        enableAllIpsecOptions()
        if (boundSoftGre) {
          enableSoftGreOptions()
        }
      }
    }
  }, [boundSoftGreIpsecData, newSoftGreIpsecList])

  const getPortFormData = (index: number) => {
    if (isVenueOperation) {
      const softGreId = form.getFieldValue(['lan', index, 'softGreProfileId'])
      const ipsecId = form.getFieldValue(['lan', index, 'ipsecProfileId'])
      const enabledSoftGre = form.getFieldValue(['lan', index, 'softGreEnabled'])
      const enabledIpsec = enabledSoftGre && form.getFieldValue(['lan', index, 'ipsecEnabled'])
      return {
        softGreId,
        softGreName: softGreOptionList
          .filter(softGre => softGre.value === softGreId)?.[0]?.label || '',
        ipsecId,
        ipsecName: ipsecOptionList.filter(ipsec => ipsec.value === ipsecId)?.[0]?.label || '',
        enabledSoftGre,
        enabledIpsec
      }
    } else {
      const softGreId = formRef?.current?.getFieldValue(['lan', index, 'softGreProfileId'])
      const ipsecId = formRef?.current?.getFieldValue(['lan', index, 'ipsecProfileId'])
      const enabledSoftGre = formRef?.current?.getFieldValue(['lan', index, 'softGreEnabled'])
      const enabledIpsec = enabledSoftGre
        && formRef?.current?.getFieldValue(['lan', index, 'ipsecEnabled'])
      return {
        softGreId,
        softGreName: softGreOptionList
          .filter(softGre => softGre.value === softGreId)?.[0]?.label || '',
        ipsecId,
        ipsecName: ipsecOptionList.filter(ipsec => ipsec.value === ipsecId)?.[0]?.label || '',
        enabledSoftGre,
        enabledIpsec
      }
    }
  }

  const optionChange = async (
    index: number, portId: string, apModel?: string, serialNumber?: string) => {
    const currentData = [...boundSoftGreIpsecData, ...newSoftGreIpsecList]
    const boundData = currentData.filter(data =>
      (isVenueOperation && data.actionLevel === ActionLevelEnum.VENUE
        && data.apModel === apModel && data.portId === portId
      )
      ||(!isVenueOperation && data.actionLevel === ActionLevelEnum.AP
        && data.serialNumber === serialNumber && data.portId === portId
      ))
    const formData = getPortFormData(index)
    if (boundData.length === 0) {
      const newPort = {
        actionLevel: isVenueOperation ? ActionLevelEnum.VENUE : ActionLevelEnum.AP,
        portId,
        apModel,
        serialNumber,
        softGreId: formData.enabledSoftGre ? formData.softGreId || '' : '',
        ipsecId: formData.enabledIpsec ? formData.ipsecId || undefined : undefined,
        isChangable: true
      }
      setNewSoftGreIpsecList([...newSoftGreIpsecList, newPort])
    } else {
      if (boundData[0].isChangable) {
        if (formData.enabledSoftGre) {
          setNewSoftGreIpsecList(newSoftGreIpsecList.map(p => {
            if (p.portId === portId && ((isVenueOperation && p.apModel === apModel)
             || (!isVenueOperation && p.serialNumber === serialNumber))) {
              return { ...p,
                softGreId: formData.enabledSoftGre ? formData.softGreId || '' : '',
                ipsecId: formData.enabledIpsec ? formData.ipsecId || undefined : undefined }
            }
            return p
          }))
        } else {
          setNewSoftGreIpsecList(newSoftGreIpsecList.filter(p =>
            !(p.portId === portId && ((isVenueOperation && p.apModel === apModel)
            || (!isVenueOperation && p.serialNumber === serialNumber)))
          ))
        }

      }
    }
  }

  const reloadOptionList = (newOption?: DefaultOptionType) => {
    if (newOption) {
      if (ipsecOptionList.some(ipsec => ipsec.disabled)) {
        newOption.disabled = true
      }
      setIpsecOptionList([...ipsecOptionList, newOption])
      setNewSoftGreIpsecList(newSoftGreIpsecList.map(p => {
        return { ...p, ipsecId: newOption.value } as SoftGreIpsecProfile
      }))
    }
  }


  const addSoftGreOption = (newOption?: DefaultOptionType,
    portId?: string, apModel?: string, serialNumber?: string) => {
    if (newOption && portId) {
      setNewSoftGreIpsecList(newSoftGreIpsecList.map(p => {
        if ((isVenueOperation && p.apModel === apModel && p.portId === portId)
          || (!isVenueOperation && p.serialNumber === serialNumber && p.portId === portId)
        ) {
          return { ...p, softGreId: newOption.value } as SoftGreIpsecProfile
        } else {
          return p
        }
      }))
    }
  }

  const resetToDefault = (voters?: Voter[]) => {
    if (voters) {
      setNewSoftGreIpsecList(newSoftGreIpsecList.filter(p =>
        !voters.some(v => v.portId === p.portId)))
    }
  }

  const actionRunner =
  (current: IpsecOptionChangeDispatcher, next: IpsecOptionChangeDispatcher) => {
    switch (next.state) {
      case IpsecOptionChangeState.Init:
        break
      case IpsecOptionChangeState.OnChange:
        optionChange(next.index || 0, next.portId || '', next.apModel, next.serialNumber)
        break
      case IpsecOptionChangeState.ReloadOptionList:
        reloadOptionList(next.newOption)
        break
      case IpsecOptionChangeState.AddSoftGreOption:
        addSoftGreOption(
          next.newOption, next.portId, next.apModel, next.serialNumber)
        break
      case IpsecOptionChangeState.ResetToDefault:
        resetToDefault(next?.voters)
        break
      case IpsecOptionChangeState.OnSave:
        setHasCleanOperations(true)
        break
    }
    return next
  }

  // eslint-disable-next-line
  const [ipsecOptionState, ipsecOptionDispatch] = useReducer(actionRunner, {
    state: IpsecOptionChangeState.Init
  })

  return { ipsecOptionList, ipsecOptionDispatch,
    usedProfileData: { data: boundSoftGreIpsecData, operations: newSoftGreIpsecList } }
}