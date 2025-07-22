import { useEffect, useMemo, useState } from 'react'

import { Form }                           from 'antd'
import { NamePath }                       from 'antd/lib/form/interface'
import { assign, cloneDeep, find, isNil } from 'lodash'
import { useIntl }                        from 'react-intl'


import { Loader }                                                                                  from '@acx-ui/components'
import { showSdLanNetworksTunnelConflictModal, useEdgeSdLanActions, useGetAvailableTunnelProfile } from '@acx-ui/edge/components'
import { Features }                                                                                from '@acx-ui/feature-toggle'
import {
  EdgeMvSdLanActivatedNetworksTable,
  isSdLanLastNetworkInVenue,
  NetworkActivationType,
  NetworkSelectTable,
  showSdLanGuestFwdConflictModal,
  showSdLanVenueDissociateModal,
  useEdgeMvSdLanActions,
  useGetSoftGreScopeVenueMap
} from '@acx-ui/rc/components'
import {
  useGetEdgeFeatureSetsQuery,
  useGetEdgePinViewDataListQuery
} from '@acx-ui/rc/services'
import {
  EdgeMvSdLanViewData,
  hasServicePermission,
  IncompatibilityFeatures,
  Network,
  NetworkTypeEnum,
  ServiceOperation,
  ServiceType,
  useIsEdgeFeatureReady
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
    tunneledGuestWlans,
    tunnelProfileId
  } = data

  const [validationForm] = Form.useForm() // this form is for temp data storage and validation
  const [activatedNetworks, setActivatedNetworks] = useState<NetworkActivationType>()
  const [isActivateUpdating, setIsActivateUpdating] = useState<boolean>(false)

  useEffect(() => {
    validationForm.resetFields()
    setActivatedNetworks(tunneledWlans?.reduce((acc, item) => {
      acc[item.venueId] = acc[item.venueId] || []
      acc[item.venueId].push({
        networkId: item.networkId,
        networkName: item.networkName,
        tunnelProfileId: item.forwardingTunnelProfileId
      })
      return acc
    }, {} as NetworkActivationType))
  }, [validationForm, tunneledWlans])

  const { toggleNetwork } = useEdgeMvSdLanActions()
  const {
    activateSdLanForNetwork,
    removeSdLanFromNetwork
  } = useEdgeSdLanActions()

  const {
    isDataLoading: isTunnelProfileLoading,
    availableTunnelProfiles
  } = useGetAvailableTunnelProfile({ serviceIds: [serviceId] })

  const { requiredFwMap } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: [IncompatibilityFeatures.L2OGRE]
      } }
  }, {
    selectFromResult: ({ data }) => {
      return {
        requiredFwMap: {
          [IncompatibilityFeatures.L2OGRE]: data?.featureSets
            ?.find(item => item.featureName === IncompatibilityFeatures.L2OGRE)?.requiredFw
        }
      }
    }
  })

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

  const allSoftGreVenueMap = useGetSoftGreScopeVenueMap()
  const softGreNetworkIdsOfCurrentVenue = useMemo(() => {
    return allSoftGreVenueMap[sdLanVenueId!]?.flatMap(network => network.networkIds) ?? []
  }, [allSoftGreVenueMap, sdLanVenueId])

  const oldHandleActivateChange = async (
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
          const modalProps = {
            currentNetworkVenueId: sdLanVenueId!,
            currentNetworkId: networkId,
            currentNetworkName: rowData.name!,
            tunneledWlans: tunneledWlans!
          }

          showSdLanGuestFwdConflictModal({
            ...modalProps,
            activatedDmz: checked,
            tunneledGuestWlans,
            isL2oGreReady: false,
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

  const handleFinally = () => {
    setIsActivateUpdating(false)
  }

  const handleActivateChange = async (
    rowData: Network,
    checked: boolean
  ) => {
    const networkId = rowData.id!
    // eslint-disable-next-line max-len
    const defaultTunnelProfileId = tunneledWlans?.find(item => item.networkId === rowData.id)?.forwardingTunnelProfileId ?? ''
    setIsActivateUpdating(true)
    try {
      if(checked) {
        // eslint-disable-next-line max-len
        await activateSdLanForNetwork(serviceId!, sdLanVenueId!, networkId, defaultTunnelProfileId, handleFinally)
      } else {
        if(isSdLanLastNetworkInVenue(tunneledWlans, sdLanVenueId)) {
          showSdLanVenueDissociateModal(async () => {
            await removeSdLanFromNetwork(serviceId!, sdLanVenueId!, networkId, handleFinally)
          }, handleFinally)
        } else {
          await removeSdLanFromNetwork(serviceId!, sdLanVenueId!, networkId, handleFinally)
        }
      }
    } catch(err) {
      handleFinally()
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  const handelTunnelProfileChange = async (
    rowData: Network,
    tunnelProfileId: string,
    namePath?: NamePath
  ) => {
    const newActivatedNetworks = cloneDeep(activatedNetworks ?? {})
    const targetVenueData = newActivatedNetworks[sdLanVenueId!]
    const targetNetworkData = find(targetVenueData, { networkId: rowData.id })
    assign(targetNetworkData, { tunnelProfileId })
    setActivatedNetworks(newActivatedNetworks)
    validationForm.validateFields([namePath!]).then(() => {
      // eslint-disable-next-line max-len
      const currentNetwork = tunneledWlans?.find(item => item.networkId === rowData.id && item.venueId === sdLanVenueId)
      if(currentNetwork?.forwardingTunnelProfileId === tunnelProfileId) {
        // do nothing when the tunnel profile is the same as the current one
        return
      }
      setIsActivateUpdating(true)
      const networkId = rowData.id!
      const modalProps = {
        currentNetworkVenueId: sdLanVenueId!,
        currentNetworkId: networkId,
        currentNetworkName: rowData.name!,
        tunneledWlans: tunneledWlans!
      }

      showSdLanNetworksTunnelConflictModal({
        ...modalProps,
        tunnelProfileId,
        onOk: async (impactVenueIds: string[]) => {
          try{
            if (impactVenueIds.length !== 0) {
              // eslint-disable-next-line max-len
              const actions = [activateSdLanForNetwork(serviceId!, sdLanVenueId!, networkId, tunnelProfileId, handleFinally)]
              actions.push(...impactVenueIds.map(impactVenueId =>
              // eslint-disable-next-line max-len
                activateSdLanForNetwork(serviceId!, impactVenueId, networkId, tunnelProfileId, handleFinally)))
              await Promise.all(actions).catch(() => handleFinally())

              handleFinally()
            } else {
              // eslint-disable-next-line max-len
              await activateSdLanForNetwork(serviceId!, sdLanVenueId!, networkId, tunnelProfileId, handleFinally)
            }
          } catch(err) {
            handleFinally()
            // eslint-disable-next-line no-console
            console.error(err)
          }
        },
        onCancel: () => {
          const newActivatedNetworks = cloneDeep(activatedNetworks ?? {})
          const targetVenueData = newActivatedNetworks[sdLanVenueId!]
          const targetNetworkData = find(targetVenueData, { networkId: rowData.id })
          assign(targetNetworkData, { tunnelProfileId: currentNetwork?.forwardingTunnelProfileId })
          setActivatedNetworks(newActivatedNetworks)
          handleFinally()
        }
      })
    }).catch(() => handleFinally())
  }

  const getDisabledInfo = (_venueId: string, row: Network) => {
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

    return {
      isDisabled: false
    }
  }

  return <Loader states={[{ isLoading: isPinNetworkIdsLoading }]}>
    <Form form={validationForm}>
      {
        isEdgeL2oGreReady ?
          <NetworkSelectTable
            venueId={sdLanVenueId!}
            activated={activatedNetworks}
            onActivateChange={handleActivateChange}
            onTunnelProfileChange={handelTunnelProfileChange}
            pinNetworkIds={pinNetworkIds}
            softGreNetworkIds={softGreNetworkIdsOfCurrentVenue}
            validationFormRef={validationForm}
            dcTunnelProfileId={tunnelProfileId}
            availableTunnelProfiles={availableTunnelProfiles}
            requiredFwMap={requiredFwMap}
            isUpdating={isActivateUpdating || isTunnelProfileLoading}
          />
          :
          <EdgeMvSdLanActivatedNetworksTable
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
            onActivateChange={oldHandleActivateChange}
            isUpdating={isActivateUpdating}
          />
      }
    </Form>
  </Loader>
}
