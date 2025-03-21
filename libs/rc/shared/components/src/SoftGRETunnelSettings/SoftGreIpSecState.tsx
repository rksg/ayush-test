/* eslint-disable no-console */
import { useEffect, useState } from 'react'

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
  isChangable: boolean
}

export const SoftGreIpSecState = (venueId: string, isVenueOperation = true) => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isWifiIpsecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const [boundSoftGreIpsecList, setBoundSoftGreIpsecList] = useState<BoundSoftGreIpsec[]>([])
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
    const boundIpsecList = new Array<BoundSoftGreIpsec>()
    ipsecProfileList.forEach(ipsecProfile => {
      let boundIpsec = ipsecProfile.activations?.find(
        act => act.venueId === venueId) || {} as IpsecActivation
      if (boundIpsec.softGreProfileId && boundIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.NETWORK,
          softGreId: boundIpsec.softGreProfileId,
          softGreName: boundSoftGreList
            .find(boundSoftGre =>
              boundSoftGre.softGreId === boundIpsec.softGreProfileId)?.softGreName || '',
          ipsecId: ipsecProfile.id,
          ipsecName: ipsecProfile.name,
          isChangable: false
        })
      }

      let boundVenueIpsec = ipsecProfile.venueActivations?.find(
        act => act.venueId === venueId) || {} as IpsecWiredActivation
      if (boundVenueIpsec.softGreProfileId && boundVenueIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.VENUE,
          softGreId: boundVenueIpsec.softGreProfileId,
          softGreName: boundSoftGreList
            .find(boundSoftGre =>
              boundSoftGre.softGreId === boundVenueIpsec.softGreProfileId)?.softGreName || '',
          ipsecId: ipsecProfile.id,
          ipsecName: ipsecProfile.name,
          isChangable: isVenueOperation
        })
      }

      let boundApIpsec = ipsecProfile.apActivations?.find(
        act => act.venueId === venueId) || {} as IpsecWiredApActivation
      if (boundApIpsec.softGreProfileId && boundApIpsec.softGreProfileId.length > 0) {
        boundIpsecList.push({
          actionLevel: ActionLevelEnum.AP,
          softGreId: boundApIpsec.softGreProfileId,
          softGreName: boundSoftGreList
            .find(boundSoftGre =>
              boundSoftGre.softGreId === boundApIpsec.softGreProfileId)?.softGreName || '',
          ipsecId: ipsecProfile.id,
          ipsecName: ipsecProfile.name,
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
    enabledSoftGre: boolean, softGreId: string, enabledIpsec: boolean, ipsecId: string) => {
    let isValid = true
    if (boundSoftGreIpsecList.length !== 0) {
      if (enabledIpsec) {
        boundSoftGreIpsecList.filter(boundProfile => boundProfile.softGreId === softGreId
          && boundProfile.ipsecId === ipsecId).length > 0 ? isValid = true : isValid = false
      } else if (enabledSoftGre) {
        boundSoftGreIpsecList.filter(boundProfile =>
          !!boundProfile.ipsecId
          && boundProfile.ipsecId.length > 0).length === 0 ? isValid = true : isValid = false
      }
    }
    console.log('softGreIpsecProfileValidator: ',
      enabledSoftGre, softGreId, enabledIpsec, ipsecId, isValid)
    return isValid ? Promise.resolve() :
      Promise.reject(
        /* eslint-disable max-len */
        $t({ defaultMessage: 'Not allowed to enable both SoftGRE and IPsec.' })
      )
  }

  return { isVenueBoundIpsec, boundSoftGreIpsecList, softGreIpsecProfileValidator }
}