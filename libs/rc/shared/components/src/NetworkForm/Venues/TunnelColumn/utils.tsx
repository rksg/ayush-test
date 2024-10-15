import { FormInstance } from 'antd'

import { EdgeMvSdLanViewData, NetworkTunnelSdLanAction, NetworkTunnelSoftGreAction } from '@acx-ui/rc/utils'

import {
  isSdLanGuestUtilizedOnDiffVenue,
  isSdLanLastNetworkInVenue,
  showSdLanVenueDissociateModal
} from '../../../EdgeSdLan/edgeSdLanUtils'
import { showSdLanGuestFwdConflictModal }                                                from '../../../EdgeSdLan/SdLanGuestFwdConflictModal'
import { NetworkTunnelActionForm, NetworkTunnelActionModalProps, NetworkTunnelTypeEnum } from '../../../NetworkTunnelActionModal'
import { getNetworkTunnelSdLanUpdateData }                                               from '../../utils'


export const handleSdLanTunnelAction = async (props: {
  form: FormInstance,
  modalFormValues: NetworkTunnelActionForm,
  otherData: {
    network: NetworkTunnelActionModalProps['network'],
    venueSdLan?: EdgeMvSdLanViewData
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

  return await new Promise<void | boolean>((resolve) => {
  // eslint-disable-next-line max-len
    if (modalFormValues.tunnelType !== NetworkTunnelTypeEnum.SdLan && isSdLanLastNetworkInVenue(venueSdLan.tunneledWlans, network!.venueId)) {
      showSdLanVenueDissociateModal(async () => {
        form.setFieldValue('sdLanAssociationUpdate', updateContent)
        resolve()
      }, () => resolve(false))
    } else {
      // eslint-disable-next-line max-len
      const needSdLanConfigConflictCheck = modalFormValues.tunnelType === NetworkTunnelTypeEnum.SdLan
        && isSdLanGuestUtilizedOnDiffVenue(venueSdLan!, network!.id, network!.venueId)

      if (needSdLanConfigConflictCheck) {
        showSdLanGuestFwdConflictModal({
          currentNetworkVenueId: network?.venueId!,
          currentNetworkId: network?.id!,
          currentNetworkName: '',
          activatedGuest: modalFormValues.sdLan.isGuestTunnelEnabled,
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