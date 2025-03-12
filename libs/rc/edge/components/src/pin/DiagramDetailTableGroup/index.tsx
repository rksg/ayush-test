import { useEffect, useRef, useState } from 'react'

import { Typography, Space } from 'antd'
import { useIntl }           from 'react-intl'

import { Card }                                   from '@acx-ui/components'
import { useIsSplitOn, Features }                 from '@acx-ui/feature-toggle'
import { useApListQuery, useGetEdgePinByIdQuery } from '@acx-ui/rc/services'
import { Persona, TableQuery, useTableQuery }     from '@acx-ui/rc/utils'

import { usePersonaListQuery }                     from '../../identityGroup'
import { PersonalIdentityNetworkDetailTableGroup } from '../PersonalIdentityNetworkDetailTableGroup'
import { defaultApPayload }                        from '../PersonalIdentityNetworkDetailTableGroup/ApsTable'
import  TopologyDiagram                            from '../TopologyDiagram'
import { PinDetailTableGroupTabType }              from '../type'

import * as UI from './styledComponents'

interface DiagramDetailTableGroupProps {
  pinId: string
}

export const DiagramDetailTableGroup = (props: DiagramDetailTableGroupProps) => {
  const { pinId } = props
  const { $t } = useIntl()

  const tableDetailsGroupRef = useRef<{
    setCurrentTab: (tab: string) => void
      }>()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const [isApPayloadReady,setIsApPayloadReady] = useState(false)

  const {
    data: pinData,
    isLoading: isPinDataLoading
  } = useGetEdgePinByIdQuery({
    params: { serviceId: pinId }
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
    personaGroupId: pinData?.personaGroupId
  }) as TableQuery<Persona, { keyword: string, groupId: string }, unknown>

  useEffect(() => {
    if (!pinData?.venueId) return

    apListTableQuery.setPayload({
      ...defaultApPayload,
      filters: { venueId: [pinData?.venueId] }
    })
  }, [pinData])

  useEffect(() => {
    if(!!apListTableQuery?.payload?.filters?.venueId[0]) {
      setIsApPayloadReady(true)
    }
  }, [apListTableQuery.payload?.filters])

  const handleDiagramOnClick = (componentType: PinDetailTableGroupTabType) => {
    tableDetailsGroupRef.current?.setCurrentTab(componentType as string)
  }

  return <Space direction='vertical' style={{ width: '100%' }}>
    <Card >
      <Typography.Text strong>
        {$t({ defaultMessage: 'Network Topology' })}
      </Typography.Text>
      <TopologyDiagram
        pinData={pinData}
        apCount={apListTableQuery.data?.totalCount}
        identityCount={personaListTableQuery.data?.totalCount}
        onClick={handleDiagramOnClick}
        // eslint-disable-next-line max-len
        isLoading={isPinDataLoading || apListTableQuery.isLoading || personaListTableQuery.isLoading}
      />
    </Card>
    <Card>
      <UI.InstancesMargin>
        <Typography.Title level={2}>
          {$t({ defaultMessage: 'Instances' })}
        </Typography.Title>
        <div style={{ minHeight: '300px' }}>
          <PersonalIdentityNetworkDetailTableGroup
            ref={tableDetailsGroupRef}
            pinData={pinData}
            apListTableQuery={apListTableQuery}
            personaListTableQuery={personaListTableQuery}
            isLoading={isPinDataLoading}
          />
        </div>
      </UI.InstancesMargin>
    </Card>
  </Space>
}
