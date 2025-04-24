import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { useIdentityListQuery }                                                      from '@acx-ui/cloudpath/components'
import { Loader, Tabs }                                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { PersonalIdentityNetworkApiVersion, useApListQuery, useGetEdgePinByIdQuery } from '@acx-ui/rc/services'
import { Persona, TableQuery, transformDisplayNumber, useTableQuery }                from '@acx-ui/rc/utils'


import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { AccessSwitchTable, AccessSwitchTableDataType } from './AccessSwitchTable'
import { ApsTable, defaultApPayload }                   from './ApsTable'
import { AssignedSegmentsTable }                        from './AssignedSegmentsTable'
import { DistSwitchesTable }                            from './DistSwitchesTable'

interface PersonalIdentityNetworkDetailTableGroupProps {
  pinId: string
}

export const PersonalIdentityNetworkDetailTableGroup = (
  props: PersonalIdentityNetworkDetailTableGroupProps
) => {

  const { pinId } = props
  const { $t } = useIntl()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isL2GreEnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  const [isApPayloadReady,setIsApPayloadReady] = useState(false)
  const [accessSwitchData, setAccessSwitchData] = useState<AccessSwitchTableDataType[]>([])
  const {
    data: pinData,
    isLoading: isPinDataLoading
  } = useGetEdgePinByIdQuery({
    params: { serviceId: pinId },
    customHeaders: isL2GreEnabled ? PersonalIdentityNetworkApiVersion.v1001 : undefined
  })

  const apListTableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultApPayload,
      filters: { venueId: [''] }
    },
    option: { skip: !isApPayloadReady },
    enableRbac: isWifiRbacEnabled
  })
  const personaListTableQuery = useIdentityListQuery({
    personaGroupId: pinData?.personaGroupId
  }) as TableQuery<Persona, { keyword: string, groupId: string }, unknown>

  useEffect(() => {
    if(pinData) {
      setAccessSwitchData(pinData.accessSwitchInfos?.map(as => ({
        ...as,
        distributionSwitchName: pinData.distributionSwitchInfos
          ?.find(ds => ds.id === as.distributionSwitchId)?.name || ''
      })))
    }
  }, [pinData])

  useEffect(() => {
    apListTableQuery.setPayload({
      ...defaultApPayload,
      filters: { venueId: [pinData?.venueId ?? ''] }
    })
  }, [pinData])

  useEffect(() => {
    if(apListTableQuery?.payload?.filters?.venueId?.length > 0) {
      setIsApPayloadReady(true)
    }
  }, [apListTableQuery.payload.filters])

  const tabs = {
    aps: {
      title: $t({ defaultMessage: 'APs ({num})' },
        { num: transformDisplayNumber(apListTableQuery?.data?.totalCount) }),
      content: <ApsTable tableQuery={apListTableQuery}/>
    },
    distSwitches: {
      title: $t({ defaultMessage: 'Dist. Switches ({num})' },
        { num: pinData?.distributionSwitchInfos.length }),
      content: <DistSwitchesTable dataSource={pinData?.distributionSwitchInfos} />
    },
    accessSwitches: {
      title: $t({ defaultMessage: 'Access Switches ({num})' },
        { num: pinData?.accessSwitchInfos.length }),
      content: <AccessSwitchTable dataSource={accessSwitchData} />
    },
    assignedSegments: {
      title: $t({ defaultMessage: 'Assigned Segments ({num})' },
        { num: transformDisplayNumber(personaListTableQuery.data?.totalCount) }),
      content: <AssignedSegmentsTable
        venueId={pinData?.venueId ?? ''}
        switchInfo={pinData?.accessSwitchInfos}
        tableQuery={personaListTableQuery}
      />
    }
  }

  return (
    <Loader states={[
      {
        isLoading: isPinDataLoading
      },
      apListTableQuery,
      personaListTableQuery
    ]}>
      <Tabs
        type='third'
      >
        {Object.keys(tabs)
          .map((key) =>
            <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
              {tabs[key as keyof typeof tabs].content}
            </Tabs.TabPane>)}
      </Tabs>
    </Loader>
  )
}
