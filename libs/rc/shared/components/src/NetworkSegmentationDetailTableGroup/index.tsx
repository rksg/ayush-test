import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Tabs }                                                                                        from '@acx-ui/components'
import { useApListQuery, useGetNetworkSegmentationGroupByIdQuery, useGetNetworkSegmentationViewDataListQuery } from '@acx-ui/rc/services'
import { Persona, TableQuery, useTableQuery }                                                                  from '@acx-ui/rc/utils'

import { usePersonaListQuery } from '../usePersonaListQuery'

import { AccessSwitchTable, AccessSwitchTableDataType } from './AccessSwitchTable'
import { ApsTable, defaultApPayload }                   from './ApsTable'
import { AssignedSegmentsTable }                        from './AssignedSegmentsTable'
import { DistSwitchesTable }                            from './DistSwitchesTable'

interface NetworkSegmentationDetailTableGroupProps {
  nsgId: string
}

export const NetworkSegmentationDetailTableGroup = (
  props: NetworkSegmentationDetailTableGroupProps
) => {

  const { nsgId } = props
  const { $t } = useIntl()
  const [isApPayloadReady,setIsApPayloadReady] = useState(false)
  const [accessSwitchData, setAccessSwitchData] = useState<AccessSwitchTableDataType[]>([])
  const {
    data: nsgData,
    isLoading: isNsgDataLoading
  } = useGetNetworkSegmentationGroupByIdQuery({
    params: { serviceId: nsgId }
  })
  const {
    nsgViewData,
    isNsgViewDataLoading
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { id: [nsgId] }
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        nsgViewData: data?.data[0],
        isNsgViewDataLoading: isLoading
      }
    }
  })
  const apListTableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultApPayload,
      filters: { venueId: [''] }
    },option: { skip: !isApPayloadReady }
  })
  const personaListTableQuery = usePersonaListQuery({
    personaGroupId: nsgViewData?.venueInfos[0]?.personaGroupId
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
      filters: { venueId: [nsgViewData?.venueInfos[0]?.venueId??''] }
    })
  }, [nsgViewData])

  useEffect(() => {
    if(apListTableQuery?.payload?.filters?.venueId?.length > 0) {
      setIsApPayloadReady(true)
    }
  }, [apListTableQuery.payload.filters])

  const tabs = {
    aps: {
      title: $t({ defaultMessage: 'APs ({num})' },
        { num: apListTableQuery?.data?.totalCount??0 }),
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
        { num: personaListTableQuery.data?.totalCount??0 }),
      content: <AssignedSegmentsTable
        switchInfo={nsgData?.accessSwitchInfos}
        tableQuery={personaListTableQuery}
      />
    }
  }

  return (
    <Loader states={[
      {
        isLoading: isNsgDataLoading || isNsgViewDataLoading
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
