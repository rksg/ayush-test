import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Tabs }                                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                     from '@acx-ui/feature-toggle'
import { useApListQuery, useGetEdgePinByIdQuery }                     from '@acx-ui/rc/services'
import { Persona, TableQuery, transformDisplayNumber, useTableQuery } from '@acx-ui/rc/utils'

import { usePersonaListQuery } from '../usePersonaListQuery'

import { AccessSwitchTable, AccessSwitchTableDataType } from './AccessSwitchTable'
import { ApsTable, defaultApPayload }                   from './ApsTable'
import { AssignedSegmentsTable }                        from './AssignedSegmentsTable'
import { DistSwitchesTable }                            from './DistSwitchesTable'

interface PersonalIdentitNetworkDetailTableGroupProps {
  nsgId: string
}

export const PersonalIdentityNetworkDetailTableGroup = (
  props: PersonalIdentitNetworkDetailTableGroupProps
) => {

  const { nsgId } = props
  const { $t } = useIntl()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const [isApPayloadReady,setIsApPayloadReady] = useState(false)
  const [accessSwitchData, setAccessSwitchData] = useState<AccessSwitchTableDataType[]>([])
  const {
    data: nsgData,
    isLoading: isNsgDataLoading
  } = useGetEdgePinByIdQuery({
    params: { serviceId: nsgId }
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
  const personaListTableQuery = usePersonaListQuery({
    personaGroupId: nsgData?.personaGroupId
  }) as TableQuery<Persona, { keyword: string, groupId: string }, unknown>

  useEffect(() => {
    if(nsgData) {
      setAccessSwitchData(nsgData.accessSwitchInfos?.map(as => ({
        ...as,
        distributionSwitchName: nsgData.distributionSwitchInfos
          ?.find(ds => ds.id === as.distributionSwitchId)?.name || ''
      })))
    }
  }, [nsgData])

  useEffect(() => {
    apListTableQuery.setPayload({
      ...defaultApPayload,
      filters: { venueId: [nsgData?.venueId ?? ''] }
    })
  }, [nsgData])

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
        { num: nsgData?.distributionSwitchInfos.length }),
      content: <DistSwitchesTable dataSource={nsgData?.distributionSwitchInfos} />
    },
    accessSwitches: {
      title: $t({ defaultMessage: 'Access Switches ({num})' },
        { num: nsgData?.accessSwitchInfos.length }),
      content: <AccessSwitchTable dataSource={accessSwitchData} />
    },
    assignedSegments: {
      title: $t({ defaultMessage: 'Assigned Segments ({num})' },
        { num: transformDisplayNumber(personaListTableQuery.data?.totalCount) }),
      content: <AssignedSegmentsTable
        venueId={nsgData?.venueId ?? ''}
        switchInfo={nsgData?.accessSwitchInfos}
        tableQuery={personaListTableQuery}
      />
    }
  }

  return (
    <Loader states={[
      {
        isLoading: isNsgDataLoading
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
