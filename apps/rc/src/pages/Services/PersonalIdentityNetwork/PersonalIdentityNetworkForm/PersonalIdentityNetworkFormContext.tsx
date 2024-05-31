import { Dispatch, SetStateAction, createContext, useEffect, useState } from 'react'

import { BaseQueryFn, QueryActionCreatorResult, QueryDefinition } from '@reduxjs/toolkit/query'
import { DefaultOptionType }                                      from 'antd/lib/select'
import { useParams }                                              from 'react-router-dom'

import {
  useGetAvailableSwitchesQuery,
  useGetDpskQuery,
  useGetEdgeListQuery,
  useGetNetworkSegmentationViewDataListQuery,
  useGetPersonaGroupByIdQuery,
  useGetPropertyConfigsQuery,
  useGetTunnelProfileViewDataListQuery,
  useVenueNetworkActivationsDataListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  DpskSaveData,
  EdgeDhcpPool,
  EdgeDhcpSetting,
  PersonaGroup,
  SwitchLite,
  TunnelTypeEnum,
  getTunnelProfileOptsWithDefault,
  isDsaeOnboardingNetwork
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
  edgeOptions?: DefaultOptionType[]
  isEdgeOptionsLoading: boolean
  dhcpProfles?: EdgeDhcpSetting[]
  dhcpOptions?: DefaultOptionType[]
  isDhcpOptionsLoading: boolean
  poolMap?: { [key: string]: EdgeDhcpPool[] }
  tunnelProfileOptions?: DefaultOptionType[]
  isTunnelLoading: boolean
  networkOptions?: DefaultOptionType[]
  isNetworkOptionsLoading: boolean
  switchList?: SwitchLite[]
  refetchSwitchesQuery: () =>
    QueryActionCreatorResult<QueryDefinition<unknown, BaseQueryFn, string, unknown>>
  getVenueName: (venueId: string) => string
  getEdgeName: (edgeId: string) => string
  getDhcpName: (dhcpId: string) => string
  getDhcpPoolName: (dhcpId: string, poolId: string) => string
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

// TODO This data provider needs to be fixed when doing PIN RBAC task
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
    }
  )
  const edgeOptionsDefaultPayload = {
    fields: ['name', 'serialNumber'],
    pageSize: 10000,
    sortField: 'name',
    filters: { venueId: [venueId], wanPortEnabled: ['TRUE'] },
    sortOrder: 'ASC'
  }
  const { edgeOptions, isLoading: isEdgeOptionsLoading } = useGetEdgeListQuery(
    { params, payload: edgeOptionsDefaultPayload },
    {
      skip: !Boolean(venueId),
      selectFromResult: ({ data, isLoading }) => {
        return {
          edgeOptions: data?.data.map(item => ({ label: item.name, value: item.serialNumber })),
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
  const { dpskNetworkList, isNetworkLoading } = useVenueNetworkActivationsDataListQuery({
    params: { ...params },
    payload: {
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      venueId: venueId
    }
  }, {
    skip: !Boolean(venueId),
    selectFromResult: ({ data, isLoading }) => {
      return {
        dpskNetworkList: data?.filter(item =>
          item.type === 'dpsk' && !isDsaeOnboardingNetwork(item)),
        isNetworkLoading: isLoading
      }
    }
  })
  const networkIds = dpskNetworkList?.map(item => (item.id))
  const { usedNetworkIds, isUsedNetworkIdsLoading } =
  useGetNetworkSegmentationViewDataListQuery({
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
    .filter(item => item.dpskServiceProfileId === dpskData?.id)
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

  const getEdgeName = (value: string) => {
    return edgeOptions?.find(item => item.value === value)?.label ?? ''
  }

  const getDhcpName = (value: string) => {
    return value
  }

  const getDhcpPoolName = (dhcpId: string, poolId: string) => {
    return dhcpId + poolId
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
        edgeOptions,
        isEdgeOptionsLoading,
        dhcpProfles: [],
        dhcpOptions: [],
        poolMap: {},
        isDhcpOptionsLoading: false,
        tunnelProfileOptions,
        isTunnelLoading,
        networkOptions,
        isNetworkOptionsLoading: isNetworkLoading || isUsedNetworkIdsLoading || isDpskLoading,
        switchList,
        refetchSwitchesQuery,
        getVenueName,
        getEdgeName,
        getDhcpName,
        getDhcpPoolName,
        getTunnelProfileName,
        getNetworksName
      }}
    >
      {props.children}
    </PersonalIdentityNetworkFormContext.Provider>
  )
}