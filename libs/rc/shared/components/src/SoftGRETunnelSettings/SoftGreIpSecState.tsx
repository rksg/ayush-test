/* eslint-disable no-console */
import { useEffect, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { useIsSplitOn, Features }                                                           from '@acx-ui/feature-toggle'
import { useLazyGetIpsecViewDataListQuery, useLazyGetSoftGreViewDataListQuery }             from '@acx-ui/rc/services'
import { IpsecActivation, IpsecWiredActivation, IpsecWiredApActivation, useConfigTemplate } from '@acx-ui/rc/utils'

enum ActionLevelEnum {
  NETWORK = 'NETWORK',
  VENUE = 'VENUE',
  AP = 'AP'
}
export interface BoundSoftGreIpsec {
  actionLevel: ActionLevelEnum
  softGreId: string
  softGreName: string
  ipsecId?: string
  ipsecName?: string
  isChangable: boolean,
  index?: number,
  apModel?: string
}

interface NameMapItem {
  id: string,
  name: string
}

export const SoftGreIpSecState = (venueId: string, isVenueOperation = true) => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isWifiIpsecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const form = Form.useFormInstance()

  const [ softGRENameMap, setSoftGreNameMap] = useState<NameMapItem[]>([])
  const [ ipsecNameMap, setIpsecNameMap] = useState<NameMapItem[]>([])

  const [boundSoftGreIpsecList, setBoundSoftGreIpsecList] = useState<BoundSoftGreIpsec[]>([])
  const [newSoftGreIpsecList, setNewSoftGreIpsecList] = useState<BoundSoftGreIpsec[]>([])
  const [isVenueBoundIpsec, setIsVenueBoundIpsec] = useState(false)

  const allowSoftGetGrePorfiles = !isTemplate
  && isEthernetSoftgreEnabled
  && isEthernetPortProfileEnabled

  const allowIpsecGetPorfiles = allowSoftGetGrePorfiles && isWifiIpsecOverNetworkEnabled

  const [ getSoftGreViewDataList ] = useLazyGetSoftGreViewDataListQuery()
  const [ getIpsecViewDataList ] = useLazyGetIpsecViewDataListQuery()

  const getUsedSoftGreProfiles = async () => {
    const softGreList = ((allowSoftGetGrePorfiles) ?
      (await getSoftGreViewDataList({
        params,
        payload: {}
      }).unwrap()).data : [])
    const softGreIds = new Set<string>()
    const boundSoftGreList = new Array<BoundSoftGreIpsec>()
    setSoftGreNameMap(softGreList.map((softGre) => {
      return { name: softGre.name, id: softGre.id }
    }))
    softGreList.forEach(softGre => {
      softGre.activations?.forEach(act => {
        if (act.venueId === venueId) {
          if (!softGreIds.has(softGre.id)) {
            softGreIds.add(softGre.id)
            boundSoftGreList.push({
              actionLevel: ActionLevelEnum.NETWORK,
              softGreId: softGre.id,
              softGreName: softGre.name,
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
              softGreName: softGre.name,
              isChangable: isVenueOperation
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
              softGreName: softGre.name,
              isChangable: !isVenueOperation
            })
          }
        }
      })
    })
    return { softGreIds, boundSoftGreList }
  }

  const getUsedIpsecProfiles = async (boundSoftGreList: BoundSoftGreIpsec[]) => {
    const ipsecProfileList = ((allowIpsecGetPorfiles) ?
      (await getIpsecViewDataList({
        params,
        payload: {}
      }).unwrap()).data : [])
    setIpsecNameMap(ipsecProfileList.map((ipsec) => {
      return { name: ipsec.name, id: ipsec.id }
    }))
    const boundIpsecList = new Array<BoundSoftGreIpsec>()

    ipsecProfileList.forEach(ipsec => {
      let boundIpsec = ipsec.activations?.find(
        act => act.venueId === venueId) || {} as IpsecActivation
      if (boundIpsec.softGreProfileId && boundIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.NETWORK,
          softGreId: boundIpsec.softGreProfileId,
          softGreName: boundSoftGreList
            .find(boundSoftGre =>
              boundSoftGre.softGreId === boundIpsec.softGreProfileId)?.softGreName || '',
          ipsecId: ipsec.id,
          ipsecName: ipsec.name,
          isChangable: false
        })
      }

      let boundVenueIpsec = ipsec.venueActivations?.find(
        act => act.venueId === venueId) || {} as IpsecWiredActivation
      if (boundVenueIpsec.softGreProfileId && boundVenueIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.VENUE,
          softGreId: boundVenueIpsec.softGreProfileId,
          softGreName: boundSoftGreList
            .find(boundSoftGre =>
              boundSoftGre.softGreId === boundVenueIpsec.softGreProfileId)?.softGreName || '',
          ipsecId: ipsec.id,
          ipsecName: ipsec.name,
          isChangable: isVenueOperation
        })
      }

      let boundApIpsec = ipsec.apActivations?.find(
        act => act.venueId === venueId) || {} as IpsecWiredApActivation
      if (boundApIpsec.softGreProfileId && boundApIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.AP,
          softGreId: boundApIpsec.softGreProfileId,
          softGreName: boundSoftGreList
            .find(boundSoftGre =>
              boundSoftGre.softGreId === boundApIpsec.softGreProfileId)?.softGreName || '',
          ipsecId: ipsec.id,
          ipsecName: ipsec.name,
          isChangable: !isVenueOperation
        })
      }
    })
    return boundIpsecList
  }

  useEffect(() => {
    const setData = async () => {
      const { softGreIds, boundSoftGreList } = await getUsedSoftGreProfiles()
      if (softGreIds.size > 1) {
        setBoundSoftGreIpsecList(boundSoftGreList)
        return
      }

      const boundIpsecList = await getUsedIpsecProfiles(boundSoftGreList)
      if (boundIpsecList.length > 0) {
        setIsVenueBoundIpsec(true)
        setBoundSoftGreIpsecList(boundIpsecList)
      }
    }
    setData()
    console.log('boundSoftGreIpsecList', boundSoftGreIpsecList)
  }, [])

  const softGreIpsecProfileValidator = async (
    softGreEditable: boolean, index: number, apModel?: string) => {
    const softGreId = form.getFieldValue(['lan', index, 'softGreProfileId'])
    const softGreName = softGRENameMap.filter(softGre => softGre.id === softGreId)?.[0]?.name || ''
    const ipsecId = form.getFieldValue(['lan', index, 'ipsecProfileId'])
    const ipsecName = ipsecNameMap.filter(ipsec => ipsec.id === ipsecId)?.[0]?.name || ''
    const enabledSoftGre = form.getFieldValue(['lan', index, 'softGreEnabled'])
    if (!enabledSoftGre) {
      form.setFieldValue(['lan', index, 'ipsecEnabled'], false)
    }
    const enabledIpsec = form.getFieldValue(['lan', index, 'ipsecEnabled'])
    const targetList = [...boundSoftGreIpsecList, ...newSoftGreIpsecList]

    console.log('targetList', targetList,
      ', enabledSoftGre', enabledSoftGre,
      ', enabledIpsec', enabledIpsec,
      ', softGreId', softGreId,
      ', softGreName', softGreName,
      ', ipsecId', ipsecId,
      ', ipsecName', ipsecName,
      ', index', index,
      ', apModel', apModel)
    if (targetList.length !== 0) {
      if (targetList[0].ipsecId && targetList[0].ipsecId.length > 0) {
        if (enabledSoftGre && !enabledIpsec) {
          if (targetList.length === 1
            && newSoftGreIpsecList.length === 1
            && targetList[0].index === index
            && ((isVenueOperation && targetList[0].apModel === apModel) || !isVenueOperation)) {
            setNewSoftGreIpsecList(newSoftGreIpsecList.map(p => {
              return {
                actionLevel: p.actionLevel,
                softGreId: softGreId,
                softGreName: softGreName,
                ipsecId: undefined,
                ipsecName: undefined,
                isChangable: true,
                index: index,
                apModel: apModel
              }
            }))
          } else {
            return Promise.reject(
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Current SoftGRE is {softGreName} and IPsec is {ipsecName}. Must enable IPsec.' }, {
                softGreName: targetList[0].softGreName,
                ipsecName: targetList[0].ipsecName
              }))
          }
        } else if (enabledIpsec) {
          //specific ipsec
          if (targetList.filter(boundProfile => boundProfile.softGreId !== softGreId
               || boundProfile.ipsecId !== ipsecId).length > 0) {
            return Promise.reject(
              $t({ defaultMessage: 'Current SoftGRE is {softGreName} and IPsec is {ipsecName}.' }, {
                softGreName: targetList[0].softGreName,
                ipsecName: targetList[0].ipsecName
              }))
          }
        }
      } else {
        // only softgre
        if (enabledIpsec) {
          if (targetList.length === 1
            && newSoftGreIpsecList.length === 1
            && targetList[0].index === index
            && ((isVenueOperation && targetList[0].apModel === apModel) || !isVenueOperation)) {
            setNewSoftGreIpsecList(newSoftGreIpsecList.map(p => {
              return {
                actionLevel: p.actionLevel,
                softGreId: softGreId,
                softGreName: softGreName,
                ipsecId: ipsecId,
                ipsecName: ipsecName,
                isChangable: true,
                index: index,
                apModel: apModel
              }
            }))
          } else {
            return Promise.reject(
              $t({ defaultMessage: 'Use only SoftGRE profile setting. Cannot assign IPsec.' }, {
                softGreName: targetList[0].softGreName,
                ipsecName: targetList[0].ipsecName
              }))
          }
        }
      }
      if (!enabledSoftGre && softGreEditable) {
        // disable softgre (ipsec)
        if (isVenueOperation) {
          if (newSoftGreIpsecList.filter(boundProfile =>
            index === boundProfile.index && boundProfile.apModel === apModel).length > 0) {
            setNewSoftGreIpsecList(
              newSoftGreIpsecList.filter(boundProfile =>
                !(index === boundProfile.index && boundProfile.apModel === apModel)))
          }
        } else {
          if (newSoftGreIpsecList.filter(boundProfile => index === boundProfile.index).length > 0) {
            setNewSoftGreIpsecList(
              newSoftGreIpsecList.filter(boundProfile => index !== boundProfile.index))
          }
        }
      }
    }

    if (softGreEditable) {
      if (isVenueOperation) {
        if (newSoftGreIpsecList.filter(boundProfile =>
          index === boundProfile.index && boundProfile.apModel === apModel).length === 0) {
          if (enabledIpsec) {
            setNewSoftGreIpsecList([...newSoftGreIpsecList, {
              actionLevel: isVenueOperation ? ActionLevelEnum.VENUE : ActionLevelEnum.AP,
              softGreId: softGreId,
              softGreName: softGreName,
              ipsecId: ipsecId,
              ipsecName: ipsecName,
              isChangable: true,
              index: index,
              apModel: apModel
            }])
          } else if (enabledSoftGre) {
            setNewSoftGreIpsecList([...newSoftGreIpsecList, {
              actionLevel: isVenueOperation ? ActionLevelEnum.VENUE : ActionLevelEnum.AP,
              softGreId: softGreId,
              softGreName: softGreName,
              ipsecId: undefined,
              ipsecName: undefined,
              isChangable: true,
              index: index,
              apModel: apModel
            }])
          }
        }
      } else {
        if (newSoftGreIpsecList.filter(boundProfile => index === boundProfile.index).length === 0) {
          if (enabledIpsec) {
            setNewSoftGreIpsecList([...newSoftGreIpsecList, {
              actionLevel: isVenueOperation ? ActionLevelEnum.VENUE : ActionLevelEnum.AP,
              softGreId: softGreId,
              softGreName: softGreName,
              ipsecId: ipsecId,
              ipsecName: ipsecName,
              isChangable: true,
              index: index
            }])
          } else if (enabledSoftGre) {
            setNewSoftGreIpsecList([...newSoftGreIpsecList, {
              actionLevel: isVenueOperation ? ActionLevelEnum.VENUE : ActionLevelEnum.AP,
              softGreId: softGreId,
              softGreName: softGreName,
              ipsecId: undefined,
              ipsecName: undefined,
              isChangable: true
            }])
          }
        }
      }
    }

    return Promise.resolve()
  }

  return { isVenueBoundIpsec, boundSoftGreIpsecList, softGreIpsecProfileValidator }
}