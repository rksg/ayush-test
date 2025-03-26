/* eslint-disable no-console */
import { MutableRefObject, useEffect, useState } from 'react'

import { Form }              from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useParams }         from 'react-router-dom'

import { StepsFormLegacyInstance }                                              from '@acx-ui/components'
import { useIsSplitOn, Features }                                               from '@acx-ui/feature-toggle'
import { useLazyGetSoftGreViewDataListQuery, useLazyGetIpsecViewDataListQuery } from '@acx-ui/rc/services'
import {
  useConfigTemplate,
  IpsecActivation,
  IpsecWiredActivation,
  IpsecWiredApActivation,
  WifiApSetting,
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState,
  IpsecViewData,
  SoftGreViewData
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
    index?: number,
    apModel?: string,
    serialNumber?: string,
    portId?: number
  }

interface useIpsecProfileLimitedSelectionProps {
  venueId: string
  isVenueOperation: boolean
  duplicationChangeDispatch: React.Dispatch<SoftGreDuplicationChangeDispatcher>
  formRef?: MutableRefObject<StepsFormLegacyInstance<WifiApSetting>>
}

const useIpsecProfileLimitedSelection = (
  props: useIpsecProfileLimitedSelectionProps
) => {
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
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

  const allowSoftGetGrePorfiles = !isTemplate
    && isEthernetSoftgreEnabled
    && isEthernetPortProfileEnabled

  const allowIpsecGetPorfiles = allowSoftGetGrePorfiles && isWifiIpsecOverNetworkEnabled

  const [ getSoftGreViewDataList ] = useLazyGetSoftGreViewDataListQuery()
  const [ getIpsecViewDataList ] = useLazyGetIpsecViewDataListQuery()

  useEffect(() => {
    const setData = async () => {
      const softGreList = ((allowSoftGetGrePorfiles) ?
        (await getSoftGreViewDataList({
          params,
          payload: {}
        }).unwrap()).data : [])

      const ipsecProfileList = ((allowIpsecGetPorfiles) ?
        (await getIpsecViewDataList({
          params,
          payload: {}
        }).unwrap()).data : [])
      const { softGreIds, boundSoftGreList } = getUsedSoftGreProfiles(softGreList)

      setSoftGreOptionList(softGreList.map((softGre) => {
        return { label: softGre.name, value: softGre.id }
      }))

      const boundIpsecList = getUsedIpsecProfiles(ipsecProfileList)

      if (boundIpsecList.length > 0) {
        setBoundSoftGreIpsecData(boundIpsecList)

        setIpsecOptionList(ipsecProfileList.map((ipsec) => {
          if (ipsec.id === boundIpsecList[0].ipsecId) {
            return { label: ipsec.name, value: ipsec.id, disabled: false }
          }
          return { label: ipsec.name, value: ipsec.id, disabled: true }
        }))

        //dispatch softGre Options
        duplicationChangeDispatch({
          state: SoftGreDuplicationChangeState.BoundIpSec,
          softGreProfileId: boundIpsecList[0].softGreId
        })
        setBoundSoftGre(true)
      } else if (softGreIds.size > 0) {
        setBoundSoftGreIpsecData(boundSoftGreList)

        setIpsecOptionList(ipsecProfileList.map((ipsec) => {
          return { label: ipsec.name, value: ipsec.id, disabled: true }
        }))
        return
      } else {
        setIpsecOptionList(ipsecProfileList.map((ipsec) => {
          return { label: ipsec.name, value: ipsec.id }
        }))
      }
    }
    setData()
  }, [])

  useEffect(() => {
    if (boundSoftGreIpsecData.length > 0) {
      if (boundSoftGreIpsecData[0].ipsecId) {
        setIpsecOptionList(ipsecOptionList.map((ipsec) => {
          if (ipsec.value === boundSoftGreIpsecData[0].ipsecId) {
            return { ...ipsec, disabled: false }
          }
          return { ...ipsec, disabled: true }
        }))

        if (boundSoftGreIpsecData[0].softGreId && boundSoftGreIpsecData.length > 1) {
          duplicationChangeDispatch({
            state: SoftGreDuplicationChangeState.BoundIpSec,
            softGreProfileId: boundSoftGreIpsecData[0].softGreId
          })
          setBoundSoftGre(true)
        }
      } else {
        setIpsecOptionList(ipsecOptionList.map((ipsec) => {
          return { ...ipsec, disabled: true }
        }))
        if (boundSoftGre) {
          duplicationChangeDispatch({
            state: SoftGreDuplicationChangeState.UnboundIpSec
          })
          setBoundSoftGre(false)
        }
      }
    } else if (newSoftGreIpsecList.length > 0) {
      const setIpSec = newSoftGreIpsecList.filter(data => data.ipsecId)
      const setSoftGre = newSoftGreIpsecList
        .filter(data => data.softGreId.length > 0 && !!!data.ipsecId)
      if (setIpSec.length > 0 && newSoftGreIpsecList.length > 1) {
        setIpsecOptionList(ipsecOptionList.map((ipsec) => {
          if (ipsec.value === setIpSec[0].ipsecId) {
            return { ...ipsec, disabled: false }
          }
          return { ...ipsec, disabled: true }
        }))
        duplicationChangeDispatch({
          state: SoftGreDuplicationChangeState.BoundIpSec,
          softGreProfileId: setIpSec.filter(data => data.softGreId.length > 0)[0].softGreId
        })
        setBoundSoftGre(true)
      } else if (setSoftGre.length > 0 && newSoftGreIpsecList.length > 1) {
        setIpsecOptionList(ipsecOptionList.map((ipsec) => {
          return { ...ipsec, disabled: true }
        }))
        if (boundSoftGre) {
          duplicationChangeDispatch({
            state: SoftGreDuplicationChangeState.UnboundIpSec
          })
          setBoundSoftGre(false)
        }
      } else {
        setIpsecOptionList(ipsecOptionList.map((ipsec) => {
          return { ...ipsec, disabled: false }
        }))
        if (boundSoftGre) {
          duplicationChangeDispatch({
            state: SoftGreDuplicationChangeState.UnboundIpSec
          })
          setBoundSoftGre(false)
        }
      }
    }
  }, [boundSoftGreIpsecData, newSoftGreIpsecList])

  useEffect(() => {
    console.log(
      'softGreOptionList: ', softGreOptionList,
      '\t\tipsecOptionList: ', ipsecOptionList,
      '\t\tboundSoftGreIpsecList:', boundSoftGreIpsecData,
      '\t\tnewSoftGreIpsecList:', newSoftGreIpsecList)
  }, [ipsecOptionList])

  const getPortFormData = (index: number) => {
    if (isVenueOperation) {
      const softGreId = form.getFieldValue(['lan', index, 'softGreProfileId'])
      const ipsecId = form.getFieldValue(['lan', index, 'ipsecProfileId'])
      const enabledSoftGre = form.getFieldValue(['lan', index, 'softGreEnabled'])
      if (!enabledSoftGre) {
        form.setFieldValue(['lan', index, 'ipsecEnabled'], false)
      }
      const enabledIpsec = form.getFieldValue(['lan', index, 'ipsecEnabled'])
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
      if (!enabledSoftGre) {
        formRef?.current?.setFieldValue(['lan', index, 'ipsecEnabled'], false)
      }
      const enabledIpsec = formRef?.current?.getFieldValue(['lan', index, 'ipsecEnabled'])
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

  const optionChange = async (index: number, apModel?: string, serialNumber?: string) => {
    const currentData = [...boundSoftGreIpsecData, ...newSoftGreIpsecList]
    const boundData = currentData.filter(data =>
      (isVenueOperation && data.actionLevel === ActionLevelEnum.VENUE
        && data.apModel === apModel && data.index === index
      )
      ||(!isVenueOperation && data.actionLevel === ActionLevelEnum.AP
        && data.serialNumber === serialNumber && data.index === index
      ))
    const formData = getPortFormData(index)
    if (boundData.length === 0) {
      const newPort = {
        actionLevel: isVenueOperation ? ActionLevelEnum.VENUE : ActionLevelEnum.AP,
        index,
        apModel,
        serialNumber,
        softGreId: formData.softGreId || '',
        ipsecId: formData.ipsecId || undefined,
        isChangable: true
      }
      setNewSoftGreIpsecList([...newSoftGreIpsecList, newPort])
    } else {
      if (boundData[0].isChangable) {
        if (formData.enabledSoftGre) {
          setNewSoftGreIpsecList(newSoftGreIpsecList.map(p => {
            if (p.index === index && ((isVenueOperation && p.apModel === apModel)
             || (!isVenueOperation && p.serialNumber === serialNumber))) {
              return { ...p, softGreId: formData.softGreId || '',
                ipsecId: formData.enabledIpsec ? formData.ipsecId || undefined : undefined }
            }
            return p
          }))
        } else {
          setNewSoftGreIpsecList(newSoftGreIpsecList.filter(p =>
            !(p.index === index && ((isVenueOperation && p.apModel === apModel)
            || (!isVenueOperation && p.serialNumber === serialNumber)))
          ))
        }

      }
    }

    console.log('formData: ', formData, '\ncurrentData: ', currentData, '\nboundData: ', boundData)
  }

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
            boundSoftGreList.push({
              actionLevel: ActionLevelEnum.VENUE,
              softGreId: softGre.id,
              isChangable: isVenueOperation,
              apModel: act.apModel,
              portId: act.portId
            })
          }
        }
      })
      softGre.apActivations?.forEach(act => {
        if (act.venueId === venueId) {
          if (!softGreIds.has(softGre.id)) {
            softGreIds.add(softGre.id)
            boundSoftGreList.push({
              actionLevel: ActionLevelEnum.AP,
              softGreId: softGre.id,
              isChangable: !isVenueOperation,
              serialNumber: act.apSerialNumber,
              portId: act.portId
            })
          }
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

      let boundVenueIpsec = ipsec.venueActivations?.find(
        act => act.venueId === venueId) || {} as IpsecWiredActivation
      if (boundVenueIpsec.softGreProfileId && boundVenueIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.VENUE,
          softGreId: boundVenueIpsec.softGreProfileId,
          ipsecId: ipsec.id,
          isChangable: isVenueOperation,
          apModel: boundVenueIpsec.apModel,
          portId: boundVenueIpsec.portId
        })
      }

      let boundApIpsec = ipsec.apActivations?.find(
        act => act.venueId === venueId) || {} as IpsecWiredApActivation
      if (boundApIpsec.softGreProfileId && boundApIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.AP,
          softGreId: boundApIpsec.softGreProfileId,
          ipsecId: ipsec.id,
          isChangable: !isVenueOperation,
          serialNumber: boundApIpsec.apSerialNumber,
          portId: boundApIpsec.portId
        })
      }
    })
    return boundIpsecList
  }

  return { optionChange, ipsecOptionList, boundSoftGreIpsecData }
}

export { useIpsecProfileLimitedSelection, useIpsecProfileLimitedSelectionProps }