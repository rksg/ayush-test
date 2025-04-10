/* eslint-disable max-len */
import { FormInstance } from 'antd'
import { cloneDeep, find, findIndex, isNil, pick } from 'lodash'

import { EdgeMvSdLanViewData, EdgeSdLanTunneledWlan, NetworkTunnelIpsecAction, NetworkTunnelSdLanAction, NetworkTunnelSoftGreAction } from '@acx-ui/rc/utils'

import {
  isSdLanGuestUtilizedOnDiffVenue,
  isSdLanLastNetworkInVenue,
  showSdLanVenueDissociateModal
} from '../../../EdgeSdLan/edgeSdLanUtils'
import { showSdLanGuestFwdConflictModal } from '../../../EdgeSdLan/SdLanGuestFwdConflictModal'
import { NetworkTunnelActionForm, NetworkTunnelActionModalProps, NetworkTunnelTypeEnum } from '../../../NetworkTunnelActionModal'
import { mergeSdLanCacheAct } from '../../../NetworkTunnelActionModal/utils'
import { getNetworkTunnelSdLanUpdateData } from '../../utils'


export const handleSdLanTunnelAction = async (
  originalVenueSdLan: EdgeMvSdLanViewData | undefined,
  props: {
  form: FormInstance,
  modalFormValues: NetworkTunnelActionForm,
  otherData: {
    network: NetworkTunnelActionModalProps['network'],
    venueSdLan?: EdgeMvSdLanViewData,
  }
}) => {
  const { form, modalFormValues, otherData } = props
  const networkVenueId = otherData.network?.venueId
  const { network, venueSdLan } = otherData

  if (!networkVenueId || !venueSdLan) return

  const updateContent = getNetworkTunnelSdLanUpdateData(
    modalFormValues,
    form.getFieldValue('sdLanAssociationUpdate'),
    otherData.network,
    venueSdLan
  )

  if (!updateContent) return

  const mergedSdlan = mergeSdLanCacheAct(cloneDeep(venueSdLan), updateContent ?? [])
  const isNoChange = isEqualSdLanTunneling(network, originalVenueSdLan, mergedSdlan)

  if(isNoChange) {
    const dataIdx = findIndex(updateContent, { serviceId: venueSdLan.id, venueId: networkVenueId })
    updateContent.splice(dataIdx, 1)
    form.setFieldValue('sdLanAssociationUpdate', updateContent)
  }

  return await new Promise<void | boolean>((resolve) => {
    if (modalFormValues.tunnelType !== NetworkTunnelTypeEnum.SdLan && isSdLanLastNetworkInVenue(venueSdLan.tunneledWlans, network!.venueId)) {
      showSdLanVenueDissociateModal(async () => {
        form.setFieldValue('sdLanAssociationUpdate', updateContent)
        resolve()
      }, () => resolve(false))
    } else {

      const needSdLanConfigConflictCheck = modalFormValues.tunnelType === NetworkTunnelTypeEnum.SdLan
        && isSdLanGuestUtilizedOnDiffVenue(venueSdLan!, network!.id, network!.venueId)

      if (needSdLanConfigConflictCheck) {
        showSdLanGuestFwdConflictModal({
          currentNetworkVenueId: network?.venueId!,
          currentNetworkId: network?.id!,
          currentNetworkName: '',
          activatedDmz: modalFormValues.sdLan.isGuestTunnelEnabled,
          tunneledWlans: venueSdLan!.tunneledWlans,
          tunneledGuestWlans: venueSdLan!.tunneledGuestWlans,
          onOk: async (impactVenueIds: string[]) => {
            if (impactVenueIds.length) {
              // has conflict and confirmed

              let updates: NetworkTunnelSdLanAction[] = updateContent
              impactVenueIds.forEach(impactVenueId => {
                updates = getNetworkTunnelSdLanUpdateData(
                  modalFormValues,
                  updates,
                  {
                    ...otherData.network!,
                    venueId: impactVenueId
                  },
                  venueSdLan) ?? []
              })

              form.setFieldValue('sdLanAssociationUpdate', updates)
            } else {
              form.setFieldValue('sdLanAssociationUpdate', updateContent)
            }

            resolve()
          },
          onCancel: () => resolve(false)
        })
      } else {
        form.setFieldValue('sdLanAssociationUpdate', updateContent)
        resolve()
      }
    }
  })
}

const isTunneledWlansEqual = (wlans1: EdgeSdLanTunneledWlan[] | undefined, wlans2: EdgeSdLanTunneledWlan[] | undefined) => {
  if (wlans1?.length !== wlans2?.length)
    return false

  return wlans1 ? wlans1.every(item => find(wlans2, pick(item, ['venueId', 'networkId']) )) : true
}
const isEqualSdLanTunneling = (
  network: NetworkTunnelActionModalProps['network'],
  original: EdgeMvSdLanViewData | undefined,
  modified: EdgeMvSdLanViewData
) => {
  // `original` will be undefined when the networkVenue is not bounded to SDLAN
  if (isNil(original)) {
    const isNotTunneled = !find(modified.tunneledWlans, { networkId: network?.id, venueId: network?.venueId })
    return isNotTunneled
  }

  const isTunnelWlansNoChange = isTunneledWlansEqual(original?.tunneledWlans, modified.tunneledWlans)
  if(!isTunnelWlansNoChange) return false

  const isTunnelGuestWlansNoChange = isTunneledWlansEqual(original?.tunneledGuestWlans, modified.tunneledGuestWlans)
  return isTunnelGuestWlansNoChange
}

export const handleSoftGreTunnelAction = (props: {
  form: FormInstance,
  networkInfo: NetworkTunnelActionModalProps['network'],
  modalFormValues: NetworkTunnelActionForm
}) => {
  const { form, networkInfo, modalFormValues } = props
  const networkVenueId = networkInfo?.venueId
  const softGreAssociationUpdate = form.getFieldValue('softGreAssociationUpdate') ??
  {} as NetworkTunnelSoftGreAction
  const updateContent = {
    ...softGreAssociationUpdate,
    [`${networkVenueId}`]: { ...modalFormValues.softGre }
  }
  form.setFieldValue('softGreAssociationUpdate', updateContent)
}

export const handleIpsecAction = (props: {
  form: FormInstance,
  networkInfo: NetworkTunnelActionModalProps['network'],
  modalFormValues: NetworkTunnelActionForm
}) => {
  const { form, networkInfo, modalFormValues } = props
  const networkVenueId = networkInfo?.venueId
  const ipsecAssociationUpdate = form.getFieldValue('ipsecAssociationUpdate') ??
  {} as NetworkTunnelIpsecAction
  const updateContent = {
    ...ipsecAssociationUpdate,
    [`${networkVenueId}`]: { ...modalFormValues.ipsec, softGreProfileId: modalFormValues.softGre.newProfileId }
  }
  form.setFieldValue('ipsecAssociationUpdate', updateContent)
}