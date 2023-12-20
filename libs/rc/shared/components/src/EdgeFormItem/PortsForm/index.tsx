import { ReactNode, useContext, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, Tabs, TabsType }                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { useGetEdgeLagsStatusListQuery, useGetEdgePortListWithStatusQuery } from '@acx-ui/rc/services'
import { appendIsLagPortOnPortConfig }                                      from '@acx-ui/rc/utils'
import { useTenantId }                                                      from '@acx-ui/utils'

import { EditContext } from '../EdgeEditContext'

import Lag          from './Lag'
import PortsGeneral from './PortsGeneral'
import SubInterface from './SubInterface'

export enum EdgePortTabEnum {
  PORTS_GENERAL = 'ports-general',
  LAG = 'lag',
  SUB_INTERFACE = 'sub-interface'
}
export interface EdgePortsFormProps {
  serialNumber: string
  onTabChange: (tabID: string) => void
  onCancel: () => void
  activeSubTab?: string
  filterTabs?: EdgePortTabEnum[]
  tabsType?: TabsType
}

export const EdgePortsForm = (props: EdgePortsFormProps) => {
  const {
    serialNumber,
    onTabChange,
    onCancel,
    activeSubTab,
    filterTabs = [],
    tabsType
  } = props
  const { $t } = useIntl()
  const tenantId = useTenantId()
  const isEdgeLagEnabled = useIsSplitOn(Features.EDGE_LAG)
  const {
    activeSubTab: activeSubTabInContext,
    setActiveSubTab: setActiveSubTabInContext,
    formControl
  } = useContext(EditContext)
  const { isDirty } = formControl

  useEffect(() => {
    if (activeSubTab) {
      setActiveSubTabInContext({
        key: activeSubTab as string,
        title: tabs[activeSubTab as keyof typeof tabs].title
      })
    }
  }, [activeSubTab])

  const {
    data: portsWithStatusData,
    isLoading: isPortStatusLoading,
    isFetching: isPortStatusFetching
  } = useGetEdgePortListWithStatusQuery({
    params: { serialNumber, tenantId },
    payload: {
      fields: ['port_id','ip'],
      filters: { serialNumber: [serialNumber] }
    }
  })

  const {
    data: lagData,
    isLoading: isLagLoading,
    isFetching: isLagFetching
  } = useGetEdgeLagsStatusListQuery({
    params: { serialNumber },
    payload: {
      sortField: 'lagId',
      sortOrder: 'ASC'
    }
  }, {
    skip: !isEdgeLagEnabled
  })

  const portDataWitIsLag = appendIsLagPortOnPortConfig(portsWithStatusData, lagData?.data)

  const tabs = {
    [EdgePortTabEnum.PORTS_GENERAL]: {
      title: $t({ defaultMessage: 'Ports General' }),
      content: <PortsGeneral
        serialNumber={serialNumber}
        data={portDataWitIsLag ?? []}
        onCancel={onCancel}
      />
    },
    ...(
      isEdgeLagEnabled ?
        {
          [EdgePortTabEnum.LAG]: {
            title: $t({ defaultMessage: 'LAG' }),
            content: <Lag
              serialNumber={serialNumber}
              lagStatusList={lagData?.data || []}
              isLoading={isLagLoading}
              portList={portDataWitIsLag}
            />
          }
        } : {} as { title: string, content: ReactNode }
    ),
    [EdgePortTabEnum.SUB_INTERFACE]: {
      title: $t({ defaultMessage: 'Sub-Interface' }),
      content: <SubInterface
        serialNumber={serialNumber}
        portData={portDataWitIsLag ?? []}
        lagData={lagData?.data || []}
      />
    }
  }

  filterTabs.forEach(tabID => {
    _.unset(tabs, tabID)
  })

  const handleTabChange = (tabID: string) => {
    onTabChange(tabID)
  }

  return (
    <Tabs
      destroyInactiveTabPane={true}
      onChange={handleTabChange}
      defaultActiveKey={Object.keys(tabs)[0]}
      activeKey={activeSubTab}
      type={tabsType ?? 'card'}
    >
      {Object.keys(tabs)
        .map((key) =>
          <Tabs.TabPane
            tab={`${tabs[key as keyof typeof tabs].title}
              ${(activeSubTabInContext.key === key && isDirty) ? '*' : ''}`}
            key={key}
          >
            <Loader states={[{
              isLoading: isPortStatusLoading || isLagLoading,
              isFetching: isPortStatusFetching || isLagFetching }]}
            >
              {tabs[key as keyof typeof tabs].content}
            </Loader>
          </Tabs.TabPane>)}
    </Tabs>
  )
}