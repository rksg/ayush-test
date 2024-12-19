import { forwardRef, useImperativeHandle, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Tabs }                                     from '@acx-ui/components'
import { PersonalIdentityNetworks, transformDisplayNumber } from '@acx-ui/rc/utils'

import { PinDetailTableGroupTabType } from '../type'

import { AccessSwitchTable }                        from './AccessSwitchTable'
import { ApsTable, ApTableProps }                   from './ApsTable'
import { AssignedSegmentsTable, PersonaTableProps } from './AssignedSegmentsTable'
import { DistSwitchesTable }                        from './DistSwitchesTable'
import { NetworksTable }                            from './NetworksTable'

export interface PersonalIdentityNetworkDetailTableGroupProps {
  pinData: PersonalIdentityNetworks | undefined,
  apListTableQuery: ApTableProps['tableQuery'],
  personaListTableQuery: PersonaTableProps['tableQuery'],
  isLoading?: boolean
}

// eslint-disable-next-line max-len
export const PersonalIdentityNetworkDetailTableGroup = forwardRef((props: PersonalIdentityNetworkDetailTableGroupProps, ref) => {
  const { pinData, apListTableQuery, personaListTableQuery, isLoading = false } = props
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState<PinDetailTableGroupTabType>()

  const networkIds = pinData?.tunneledWlans?.map(t => t.networkId)
  const accessSwitchData = pinData?.accessSwitchInfos?.map(as => ({
    ...as,
    distributionSwitchName: pinData.distributionSwitchInfos
      ?.find(ds => ds.id === as.distributionSwitchId)?.name || ''
  }))

  const tabs = {
    [PinDetailTableGroupTabType.NETWORK]: {
      title: $t({ defaultMessage: 'Networks ({num})' },
        { num: transformDisplayNumber(networkIds?.length) }),
      content: <NetworksTable networkIds={networkIds}/>
    },
    [PinDetailTableGroupTabType.AP]: {
      title: $t({ defaultMessage: 'APs ({num})' },
        { num: transformDisplayNumber(apListTableQuery?.data?.totalCount) }),
      content: <ApsTable tableQuery={apListTableQuery}/>
    },
    [PinDetailTableGroupTabType.DS]: {
      title: $t({ defaultMessage: 'Dist. Switches ({num})' },
        { num: pinData?.distributionSwitchInfos.length }),
      content: <DistSwitchesTable dataSource={pinData?.distributionSwitchInfos} />
    },
    [PinDetailTableGroupTabType.AS]: {
      title: $t({ defaultMessage: 'Access Switches ({num})' },
        { num: pinData?.accessSwitchInfos.length }),
      content: <AccessSwitchTable dataSource={accessSwitchData} />
    },
    [PinDetailTableGroupTabType.IDENTITY]: {
      title: $t({ defaultMessage: 'Assigned Segments ({num})' },
        { num: transformDisplayNumber(personaListTableQuery.data?.totalCount) }),
      content: <AssignedSegmentsTable
        venueId={pinData?.venueId ?? ''}
        switchInfo={pinData?.accessSwitchInfos}
        tableQuery={personaListTableQuery}
      />
    }
  }

  useImperativeHandle(ref, () => ({
    setCurrentTab
  }))

  const handleTabChange = (val: string) => {
    setCurrentTab(val as PinDetailTableGroupTabType)
  }

  return (
    <Loader states={[
      { isLoading },
      apListTableQuery,
      personaListTableQuery
    ]}>
      <Tabs
        type='third'
        activeKey={currentTab}
        onChange={handleTabChange}
      >
        {Object.keys(tabs)
          .map((key) =>
            <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
              {tabs[key as keyof typeof tabs].content}
            </Tabs.TabPane>)}
      </Tabs>
    </Loader>
  )
})
