import { Dispatch, SetStateAction, createContext, useCallback, useEffect, useMemo, useState } from 'react'

import { BaseQueryFn, QueryActionCreatorResult, QueryDefinition } from '@reduxjs/toolkit/query'
import { DefaultOptionType }                                      from 'antd/lib/select'
import { find, isNil, union, uniq }                               from 'lodash'
import { useParams }                                              from 'react-router-dom'

import {
  useGetAvailableSwitchesQuery,
  useGetEdgeClusterListQuery,
  useGetEdgePinViewDataListQuery,
  useGetPersonaGroupByIdQuery,
  useGetPropertyConfigsQuery,
  useGetTunnelProfileViewDataListQuery,
  useVenueNetworkActivationsViewModelListQuery,
  useVenuesListQuery,
  useGetDhcpStatsQuery,
  useGetEdgeMvSdLanViewDataListQuery,
  useLazyGetDpskQuery
} from '@acx-ui/rc/services'
import {
  DhcpStats,
  DpskSaveData,
  PersonaGroup,
  SwitchLite,
  TunnelTypeEnum,
  getTunnelProfileOptsWithDefault,
  isDsaeOnboardingNetwork,
  NetworkTypeEnum
} from '@acx-ui/rc/utils'

export interface PersonalIdentityNetworkFormContextType {
  setVenueId: Dispatch<SetStateAction<string>>
  venueOptions?: DefaultOptionType[]
  isVenueOptionsLoading: boolean
  personaGroupId?: string
  isGetPropertyConfigError?: boolean
  isPropertyConfigLoading?: boolean
  personaGroupData?: PersonaGroup
  isPersonaGroupLoading: boolean
  dpskData?: DpskSaveData
  isDpskLoading: boolean
  clusterOptions?: DefaultOptionType[]
  isClusterOptionsLoading: boolean
  dhcpList?: DhcpStats[]
  dhcpOptions?: DefaultOptionType[]
  isDhcpOptionsLoading: boolean
  tunnelProfileOptions?: DefaultOptionType[]
  isTunnelLoading: boolean
  networkOptions?: DefaultOptionType[]
  isNetworkOptionsLoading: boolean
  switchList?: SwitchLite[]
  refetchSwitchesQuery: () =>
    QueryActionCreatorResult<QueryDefinition<unknown, BaseQueryFn, string, unknown>>
  getVenueName: (venueId: string) => string
  getClusterName: (edgeClusterId: string) => string
  getDhcpName: (dhcpId: string) => string
  getTunnelProfileName: (tunnelId: string) => string
  getNetworksName: (networkIds: string[]) => (string | undefined)[],
  addNetworkCallback: (dpskPoolId: string) => void
}

// eslint-disable-next-line max-len
export const PersonalIdentityNetworkFormContext = createContext({} as PersonalIdentityNetworkFormContextType)

type ProviderProps = React.PropsWithChildren<{
  venueId?: string
}>

const venueOptionsDefaultPayload = {
  fields: [
    'name',
    'id',
    'edges'
  ],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const tunnelProfileDefaultPayload = {
  fields: ['name', 'id', 'type'],
  filters: {
    type: [TunnelTypeEnum.VXLAN]
  },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const clusterDataDefaultPayload = {
  fields: ['name', 'clusterId', 'venueId'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const activtatedVenueNetworksPayload = {
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC',
  fields: [ 'id', 'name', 'type' ]
}

export const PersonalIdentityNetworkFormDataProvider = (props: ProviderProps) => {
  const params = useParams()
  const [venueId, setVenueId] = useState('')
  const [dpskData, setDpskData] = useState<DpskSaveData | undefined>(undefined)

  const [getDpsk] = useLazyGetDpskQuery()

  const {
    usedSdlanClusterIds,
    usedSdlanTunneledVenueIds,
    usedSdlanNetworkIds,
    isSdlanLoading
  } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['venueId', 'edgeClusterId', 'guestEdgeClusterId', 'tunneledWlans'],
      pageSize: 10000
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      const allSdLans = data?.data ?? []
      return {
        usedSdlanClusterIds: Array.from(new Set(
          allSdLans.flatMap(sdLan => [sdLan.edgeClusterId, sdLan.guestEdgeClusterId])
            .filter(id => !!id))),
        usedSdlanTunneledVenueIds: Array.from(new Set([
          ...allSdLans.flatMap(sdlan => sdlan.tunneledWlans ?? [])
            .map(wlan => wlan.venueId)
            .filter(id => !!id)
        ])),
        usedSdlanNetworkIds: Array.from(new Set(
          allSdLans.flatMap(sdlan => sdlan.tunneledWlans ?? [])
            .map(wlan => wlan.networkId)
            .filter(id => !!id))),
        isSdlanLoading: isLoading
      }
    }
  })

  const {
    personaGroupId,
    isGetPropertyConfigError,
    isPropertyConfigLoading
  } = useGetPropertyConfigsQuery(
    { params: { venueId } },
    {
      skip: !!!venueId,
      selectFromResult: ({ data, isError, isLoading, isFetching }) => {
        return {
          personaGroupId: data?.personaGroupId,
          isGetPropertyConfigError: isError,
          isPropertyConfigLoading: isLoading || isFetching
        }
      }
    })

  const { dhcpList, isDhcpOptionsLoading } = useGetDhcpStatsQuery({
    payload: { pageSize: 10000 }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        dhcpList: data?.data,
        isDhcpOptionsLoading: isLoading
      }
    }
  })

  const {
    personaGroupData,
    isPersonaGroupLoading
  } = useGetPersonaGroupByIdQuery(
    { params: { groupId: personaGroupId } },
    {
      skip: !!!personaGroupId,
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return {
          personaGroupData: data,
          isPersonaGroupLoading: isLoading || isFetching
        }
      }
    })

  const { tunnelProfileOptions, isTunnelLoading } = useGetTunnelProfileViewDataListQuery({
    payload: tunnelProfileDefaultPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        tunnelProfileOptions: getTunnelProfileOptsWithDefault(data?.data, TunnelTypeEnum.VXLAN),
        isTunnelLoading: isLoading
      }
    }
  })

  const { dpskNetworkList, isNetworkLoading } = useVenueNetworkActivationsViewModelListQuery({
    params: { ...params },
    payload: { ...activtatedVenueNetworksPayload, venueId: venueId }
  }, {
    skip: !Boolean(venueId),
    selectFromResult: ({ data, isLoading }) => {
      return {
        dpskNetworkList: data?.data?.filter(item =>
          item.nwSubType === NetworkTypeEnum.DPSK && !isDsaeOnboardingNetwork(item)),
        isNetworkLoading: isLoading
      }
    }
  })

  const { usedVenueIds, usedNetworkIds, isUsedNetworkIdsLoading } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'venueId', 'tunneledWlans'],
      filters: {}
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      const otherData = data?.data.filter(i => i.id !== params.serviceId)
      return {
        usedVenueIds: otherData?.map(i => i.venueId!),
        // eslint-disable-next-line max-len
        usedNetworkIds: otherData?.flatMap(item => item.tunneledWlans?.map(nw => nw.networkId) ?? []),
        isUsedNetworkIdsLoading: isLoading
      }
    }
  })

  const { switchList, refetch: refetchSwitchesQuery } = useGetAvailableSwitchesQuery({
    params: { ...params, venueId }
  }, {
    skip: !venueId,
    selectFromResult: ({ data }) => ({
      switchList: data?.switchViewList
    })
  })

  const networkOptions = useMemo(() => {
    // eslint-disable-next-line max-len
    if (isNil(dpskData?.networkIds) || (isNil(usedNetworkIds) && usedSdlanNetworkIds.length === 0)) return []

    return dpskNetworkList?.filter(item => !usedNetworkIds?.includes(item.id ?? ''))
      .filter(item => dpskData?.networkIds?.includes(item.id))
      .filter(item => !usedSdlanNetworkIds.includes(item.id))
      .map(item => ({ label: item.name, value: item.id }))
  }, [dpskData?.networkIds, dpskNetworkList, usedNetworkIds, usedSdlanNetworkIds])


  const {
    venues, isVenueOptionsLoading
  } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data, isLoading }) => {
        return {
          venues: data?.data.filter(item => (item.edges ?? 0) > 0)
            .map(item => ({ label: item.name, value: item.id })),
          isVenueOptionsLoading: isLoading
        }
      }
    })

  const { clusterData, isLoading: isClusterDataLoading } = useGetEdgeClusterListQuery(
    { params, payload: { ...clusterDataDefaultPayload } },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterData: data?.data
            .map(item => ({ label: item.name, value: item.clusterId, venueId: item.venueId })),
          isLoading
        }
      }
    })

  const usedSdlanVenueIds = useMemo(() => {
    const sdlanClusterVenueIds = clusterData?.filter(item =>
      usedSdlanClusterIds.includes(item.value))
      .map(item => item.venueId)
    return uniq(union(usedSdlanTunneledVenueIds, sdlanClusterVenueIds))
  }, [usedSdlanTunneledVenueIds, usedSdlanClusterIds])

  const venueOptions = useMemo(() => {
    return venues?.filter(item =>
      !(usedSdlanVenueIds.includes(item.value) || usedVenueIds?.includes(item.value))
    )
  }, [venues, usedVenueIds, usedSdlanVenueIds])

  const clusterOptions = useMemo(() => {
    return clusterData?.filter(item =>
      !usedSdlanClusterIds.includes(item.value) && venueId === item.venueId) ?? []
  }, [venueId, usedSdlanClusterIds])

  useEffect(() => {
    if(props.venueId) setVenueId(props.venueId)
  }, [props.venueId])

  useEffect(() => {
    if (!personaGroupData?.dpskPoolId) return
    getDpsk({ params: { serviceId: personaGroupData?.dpskPoolId } }).unwrap()
      .then(data => {
        setDpskData(data)
      })
  }, [personaGroupData?.dpskPoolId])

  const isDpskLoading = !!personaGroupData?.dpskPoolId && isNil(dpskData)

  const getVenueName = (value: string) => {
    return venueOptions?.find(item => item.value === value)?.label ?? ''
  }

  const getClusterName = (value: string) => {
    return clusterOptions?.find(item => item.value === value)?.label ?? ''
  }

  const getDhcpName = (value: string) => {
    return find(dhcpList, { id: value })?.serviceName ?? ''
  }

  const getTunnelProfileName = (value: string) => {
    return tunnelProfileOptions?.find(item => item.value === value)?.label ?? ''
  }

  const getNetworksName = (value: string[]) => {
    return networkOptions?.filter(item => value.includes(item.value ?? ''))
      .map(item => item.label) ?? []
  }

  const addNetworkCallback = useCallback((dpskPoolId?: string) => {
    getDpsk({ params: { serviceId: dpskPoolId } }).unwrap()
      .then(data => {
        setDpskData(data)
      })
  }, [getDpsk])

  return (
    <PersonalIdentityNetworkFormContext.Provider
      value={{
        setVenueId,
        venueOptions,
        isVenueOptionsLoading: isVenueOptionsLoading || isSdlanLoading,
        personaGroupId,
        isGetPropertyConfigError,
        isPropertyConfigLoading,
        personaGroupData,
        isPersonaGroupLoading,
        dpskData,
        isDpskLoading,
        clusterOptions,
        isClusterOptionsLoading: isClusterDataLoading || isSdlanLoading,
        dhcpList,
        dhcpOptions: dhcpList?.map(item => ({ label: item.serviceName, value: item.id })),
        isDhcpOptionsLoading,
        tunnelProfileOptions,
        isTunnelLoading,
        networkOptions,
        isNetworkOptionsLoading: isNetworkLoading || isUsedNetworkIdsLoading || isDpskLoading
          || isSdlanLoading,
        switchList,
        refetchSwitchesQuery,
        getVenueName,
        getClusterName,
        getDhcpName,
        getTunnelProfileName,
        getNetworksName,
        addNetworkCallback
      }}
    >
      {props.children}
    </PersonalIdentityNetworkFormContext.Provider>
  )
}