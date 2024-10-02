import { Dispatch, SetStateAction, createContext, useEffect, useState } from 'react'


import { BaseQueryFn, QueryActionCreatorResult, QueryDefinition } from '@reduxjs/toolkit/query'
import { DefaultOptionType }                                      from 'antd/lib/select'
import { find }                                                   from 'lodash'
import { useParams }                                              from 'react-router-dom'

import {
  useGetAvailableSwitchesQuery,
  useGetDpskQuery,
  useGetEdgeClusterListQuery,
  useGetEdgePinViewDataListQuery,
  useGetPersonaGroupByIdQuery,
  useGetPropertyConfigsQuery,
  useGetTunnelProfileViewDataListQuery,
  useVenueNetworkActivationsViewModelListQuery,
  useVenuesListQuery,
  useGetDhcpStatsQuery
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
  getNetworksName: (networkIds: string[]) => (string | undefined)[]
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

export const PersonalIdentityNetworkFormDataProvider = (props: ProviderProps) => {
  const params = useParams()
  const [venueId, setVenueId] = useState('')
  const {
    venueOptions,
    isVenueOptionsLoading
  } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueOptions: data?.data.filter(item => (item.edges ?? 0) > 0)
            .map(item => ({ label: item.name, value: item.id })),
          isVenueOptionsLoading: isLoading
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
    }
  )

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
    }
  )
  const {
    dpskData,
    isDpskLoading
  } = useGetDpskQuery(
    { params: { serviceId: personaGroupData?.dpskPoolId } },
    {
      skip: !!!personaGroupData?.dpskPoolId,
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return {
          dpskData: data,
          isDpskLoading: isLoading || isFetching
        }
      }
    })

  const clusterOptionsDefaultPayload = {
    fields: ['name', 'clusterId'],
    pageSize: 10000,
    sortField: 'name',
    filters: { venueId: [venueId] },
    sortOrder: 'ASC'
  }
  const { clusterOptions, isLoading: isClusterOptionsLoading } = useGetEdgeClusterListQuery(
    { params, payload: clusterOptionsDefaultPayload },
    {
      skip: !Boolean(venueId),
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterOptions: data?.data.map(item => ({ label: item.name, value: item.clusterId })),
          isLoading
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
    payload: {
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      venueId: venueId,
      fields: [
        'id',
        'name',
        'type'
      ]
    }
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

  const networkIds = dpskNetworkList?.map(item => (item.id))
  const { usedNetworkIds, isUsedNetworkIdsLoading } = useGetEdgePinViewDataListQuery({
    payload: {
      filters: { networkIds: networkIds }
    }
  }, {
    skip: !Boolean(networkIds),
    selectFromResult: ({ data, isLoading }) => {
      return {
        usedNetworkIds: data?.data.filter(item => item.id !== params.serviceId)
          .flatMap(item => item.networkIds),
        isUsedNetworkIdsLoading: isLoading
      }
    }
  })
  const networkOptions = dpskNetworkList?.filter(item => !usedNetworkIds?.includes(item.id ?? ''))
    .filter(item => dpskData?.networkIds?.includes(item.id))
    .map(item => ({ label: item.name, value: item.id }))
  const { switchList, refetch: refetchSwitchesQuery } = useGetAvailableSwitchesQuery({
    params: { ...params, venueId }
  }, {
    skip: !venueId,
    selectFromResult: ({ data }) => ({
      switchList: data?.switchViewList
    })
  })

  useEffect(() => {
    if(props.venueId) setVenueId(props.venueId)
  }, [props.venueId])

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

  return (
    <PersonalIdentityNetworkFormContext.Provider
      value={{
        setVenueId,
        venueOptions,
        isVenueOptionsLoading,
        personaGroupId,
        isGetPropertyConfigError,
        isPropertyConfigLoading,
        personaGroupData,
        isPersonaGroupLoading,
        dpskData,
        isDpskLoading,
        clusterOptions,
        isClusterOptionsLoading,
        dhcpList,
        dhcpOptions: dhcpList?.map(item => ({ label: item.serviceName, value: item.id })),
        isDhcpOptionsLoading,
        tunnelProfileOptions,
        isTunnelLoading,
        networkOptions,
        isNetworkOptionsLoading: isNetworkLoading || isUsedNetworkIdsLoading || isDpskLoading,
        switchList,
        refetchSwitchesQuery,
        getVenueName,
        getClusterName,
        getDhcpName,
        getTunnelProfileName,
        getNetworksName
      }}
    >
      {props.children}
    </PersonalIdentityNetworkFormContext.Provider>
  )
}