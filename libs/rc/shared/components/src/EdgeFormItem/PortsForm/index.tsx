import { ReactNode, useContext, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, Tabs, TabsType }        from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { useGetEdgeLagsStatusListQuery } from '@acx-ui/rc/services'

import { EditContext } from '../EdgeEditContext'

import Lag                                                    from './Lag'
import { EdgePortsDataContext, EdgePortsDataContextProvider } from './PortDataProvider'
import PortsGeneral                                           from './PortsGeneral'
import SubInterface                                           from './SubInterface'

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

const EdgePhysicalPortsForm = (props: EdgePortsFormProps) => {
  const {
    serialNumber,
    onTabChange,
    onCancel,
    activeSubTab,
    filterTabs = [],
    tabsType
  } = props
  const { $t } = useIntl()
  const isEdgeLagEnabled = useIsSplitOn(Features.EDGE_LAG)
  const portsCxtData = useContext(EdgePortsDataContext)

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

  const tabs = {
    [EdgePortTabEnum.PORTS_GENERAL]: {
      title: $t({ defaultMessage: 'Ports General' }),
      content: <PortsGeneral
        serialNumber={serialNumber}
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
              isLoading={isLagLoading || isLagFetching}
            />
          }
        } : {} as { title: string, content: ReactNode }
    ),
    [EdgePortTabEnum.SUB_INTERFACE]: {
      title: $t({ defaultMessage: 'Sub-Interface' }),
      content: <SubInterface
        serialNumber={serialNumber}
        portData={portsCxtData.portData!}
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
            {tabs[key as keyof typeof tabs].content}
          </Tabs.TabPane>)}
    </Tabs>
  )
}

export const EdgePortsForm = (props: EdgePortsFormProps) => {
  return <EdgePortsDataContextProvider serialNumber={props.serialNumber}>
    <EdgePhysicalPortsForm {...props}/>
  </EdgePortsDataContextProvider>
}