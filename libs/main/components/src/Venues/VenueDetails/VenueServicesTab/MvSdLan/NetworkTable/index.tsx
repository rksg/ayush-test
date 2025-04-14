import { useState } from 'react'

import { isNil }   from 'lodash'
import { useIntl } from 'react-intl'


import { Loader }         from '@acx-ui/components'
import { Features }       from '@acx-ui/feature-toggle'
import {
  EdgeSdLanP2ActivatedNetworksTable,
  isSdLanLastNetworkInVenue,
  showSdLanGuestFwdConflictModal,
  showSdLanVenueDissociateModal,
  useEdgeMvSdLanActions,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import { useGetEdgePinViewDataListQuery } from '@acx-ui/rc/services'
import {
  EdgeMvSdLanViewData,
  hasServicePermission,
  Network,
  NetworkTypeEnum,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export const NetworkTable = ({ data }: { data: EdgeMvSdLanViewData }) => {
  const { venueId: sdLanVenueId }= useParams()
  const { $t } = useIntl()
  const isEdgePinHaReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeL2oGreReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  const {
    id: serviceId,
    isGuestTunnelEnabled,
    tunneledWlans,
    tunneledGuestWlans
  } = data

  const [isActivateUpdating, setIsActivateUpdating] = useState<boolean>(false)
  const { toggleNetwork } = useEdgeMvSdLanActions()

  const { pinNetworkIds, isPinNetworkIdsLoading } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'venueId', 'tunneledWlans'],
      filters: {}
    }
  }, {
    skip: !isEdgePinHaReady,
    selectFromResult: ({ data, isLoading }) => {
      return {
        // eslint-disable-next-line max-len
        pinNetworkIds: data?.data?.flatMap(item => item.tunneledWlans?.map(nw => nw.networkId) ?? []),
        isPinNetworkIdsLoading: isLoading
      }
    }
  })

  const handleActivateChange = async (
    fieldName: string,
    rowData: Network,
    checked: boolean
  ) => {
    const networkId = rowData.id!
    setIsActivateUpdating(true)

    const handleFinally = () => {
      setIsActivateUpdating(false)
    }

    // eslint-disable-next-line max-len
    if ((fieldName === 'activatedNetworks' && !checked) && isSdLanLastNetworkInVenue(tunneledWlans, sdLanVenueId)) {
      showSdLanVenueDissociateModal(async () => {
        await toggleNetwork(serviceId!, sdLanVenueId!, networkId, checked, false, handleFinally)
      }, handleFinally)
    } else {
      try {
      // network with vlan pooling enabled cannot be a SD-LAN guest network
        const isVlanPooling = !isNil(rowData.vlanPool)
        // eslint-disable-next-line max-len
        const isGuestNetworkAction = fieldName === 'activatedGuestNetworks' || (fieldName === 'activatedNetworks' && checked && !isVlanPooling)

        // eslint-disable-next-line max-len
        if ( isGuestTunnelEnabled && rowData.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL && isGuestNetworkAction) {
          const isFwdGuest = !(fieldName === 'activatedGuestNetworks' && !checked)

          showSdLanGuestFwdConflictModal({
            currentNetworkVenueId: sdLanVenueId!,
            currentNetworkId: networkId,
            currentNetworkName: rowData.name!,
            activatedDmz: checked,
            tunneledWlans,
            tunneledGuestWlans,
            isL2oGreReady: isEdgeL2oGreReady,
            onOk: async (impactVenueIds: string[]) => {

              if (impactVenueIds.length !== 0) {
              // eslint-disable-next-line max-len
                const actions = [toggleNetwork(serviceId!, sdLanVenueId!, networkId, true, isFwdGuest)]
                actions.push(...impactVenueIds.map(impactVenueId =>
                  toggleNetwork(serviceId!, impactVenueId, networkId, true, isFwdGuest)))
                await Promise.all(actions)

                handleFinally()
              } else {
              // eslint-disable-next-line max-len
                await toggleNetwork(serviceId!, sdLanVenueId!, networkId, true, isFwdGuest, handleFinally)
              }
            },
            onCancel: handleFinally
          })
        } else {
          await toggleNetwork(serviceId!, sdLanVenueId!, networkId, checked, false, handleFinally)
        }
      } catch(err) {
        handleFinally()
        // eslint-disable-next-line no-console
        console.error(err)
      }
    }
  }

  const getDisabledInfo = (_venueId: string,
    row: Network,
    isGuestSwitchBtn: boolean
  ) => {
    // eslint-disable-next-line max-len
    const hasEdgeUpdatePermission = hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.EDIT })

    if (!hasEdgeUpdatePermission) {
      return {
        isDisabled: true,
        tooltip: $t({ defaultMessage: 'No permission on this' })
      }
    }

    if (pinNetworkIds?.includes(row.id)) {
      return {
        isDisabled: true,
        // eslint-disable-next-line max-len
        tooltip: $t({ defaultMessage: 'This network already used in Personal Identity Network, cannot be SD-LAN traffic network.' })
      }
    }

    const isSdLanLastNetwork = (tunneledWlans?.length ?? 0) <= 1
    if (!tunneledWlans || isGuestSwitchBtn || !isSdLanLastNetwork) return

    const isTheLastOne = tunneledWlans[0].networkId === row.id

    return {
      isDisabled: isTheLastOne,
      tooltip: isTheLastOne
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' })
        : undefined
    }
  }

  return <Loader states={[{ isLoading: isPinNetworkIdsLoading }]}>
    <EdgeSdLanP2ActivatedNetworksTable
      columnsSetting={[{
        key: 'name',
        title: $t({ defaultMessage: 'Network' }),
        tooltip: undefined
      }]}
      venueId={sdLanVenueId!}
      isGuestTunnelEnabled={isGuestTunnelEnabled!}
      activated={tunneledWlans
        ?.filter(network => network.venueId === sdLanVenueId)
        .map(network => network.networkId)}
      activatedGuest={tunneledGuestWlans
        ?.filter(network => network.venueId === sdLanVenueId)
        .map(network => network.networkId)}
      disabled={getDisabledInfo}
      onActivateChange={handleActivateChange}
      isUpdating={isActivateUpdating}
    />
  </Loader>
}