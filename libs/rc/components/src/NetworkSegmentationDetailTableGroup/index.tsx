import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Tabs }                                                                                                                   from '@acx-ui/components'
import { useApListQuery, useGetNetworkSegmentationGroupByIdQuery, useGetNetworkSegmentationViewDataListQuery, useSearchPersonaListQuery } from '@acx-ui/rc/services'
import { useTableQuery }                                                                                                                  from '@acx-ui/rc/utils'

import { AccessSwitchTable, AccessSwitchTableDataType } from './AccessSwitchTable'
import { defaultApPayload }                             from './ApsTable'
import { ApsTable }                                     from './ApsTable'
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
  const [isPersonaPayloadReady,setIsPersonaPayloadReady] = useState(false)
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
  const personaListTableQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: '',
      groupId: ''
    },option: { skip: !isPersonaPayloadReady }
  })

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
    personaListTableQuery.setPayload({
      keyword: '',
      groupId: nsgViewData?.venueInfos[0]?.personaGroupId??''
    })
  }, [nsgViewData])

  useEffect(() => {
    if(apListTableQuery?.payload?.filters?.venueId?.length > 0) {
      setIsApPayloadReady(true)
    }
  }, [apListTableQuery.payload.filters])

  useEffect(() => {
    if(personaListTableQuery?.payload?.groupId) {
      setIsPersonaPayloadReady(true)
    }
  }, [personaListTableQuery.payload.groupId])

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
        switchInfo={nsgData?.distributionSwitchInfos}
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
