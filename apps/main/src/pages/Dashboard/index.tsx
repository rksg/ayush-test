import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'

import { Divider, Menu, Space } from 'antd'
import moment                   from 'moment-timezone'
import { DndProvider }          from 'react-dnd'
import { HTML5Backend }         from 'react-dnd-html5-backend'
import { useIntl }              from 'react-intl'

import {
  ClientExperience,
  ConnectedClientsOverTime,
  DidYouKnow,
  IncidentsDashboardv2,
  SwitchesTrafficByVolume,
  SwitchesTrafficByVolumeLegacy,
  TopAppsByTraffic,
  TopEdgesByResources,
  TopEdgesByTraffic,
  TopSwitchesByError,
  TopSwitchesByPoEUsage,
  TopSwitchesByTraffic,
  TopSwitchModels,
  TopWiFiNetworks,
  TrafficByVolume
} from '@acx-ui/analytics/components'
import {
  Button,
  ContentSwitcher,
  ContentSwitcherProps,
  Dropdown,
  GridCol,
  GridRow,
  PageHeader,
  RangePicker,
  Select,
  useLayoutContext
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  GlobeOutlined,
  LockOutlined,
  SettingsOutlined
} from '@acx-ui/icons-new'
import { VenueFilter }      from '@acx-ui/main/components'
import {
  AlarmWidgetV2,
  ClientsWidgetV2,
  DevicesDashboardWidgetV2,
  MapWidgetV2,
  useIsEdgeReady,
  VenuesDashboardWidgetV2
} from '@acx-ui/rc/components'
import {
  Canvas,
  CommonUrlsInfo,
  EdgeUrlsInfo,
  SwitchRbacUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import {
  EdgeScopes,
  RolesEnum,
  SwitchScopes,
  WifiScopes
}                                               from '@acx-ui/types'
import {
  hasCrossVenuesPermission,
  filterByAccess,
  getShowWithoutRbacCheckKey,
  hasPermission,
  hasRoles,
  getUserProfile,
  hasAllowedOperations,
  isCoreTier
} from '@acx-ui/user'
import {
  AnalyticsFilter,
  DateFilter,
  DateRange,
  getDatePickerValues,
  LoadTimeContext,
  getDateRangeFilter,
  getOpsApi,
  useDashboardFilter
} from '@acx-ui/utils'

import { Section, Group }                                                from '../AICanvas/Canvas'
import { CardInfo, layoutConfig }                                        from '../AICanvas/Canvas'
import Layout                                                            from '../AICanvas/components/Layout'
import { DEFAULT_DASHBOARD_ID, getCalculatedColumnWidth, getCanvasData } from '../AICanvas/index.utils'
import { PreviewDashboardModal }                                         from '../AICanvas/PreviewDashboardModal'
import * as CanvasUI                                                     from '../AICanvas/styledComponents'

import { DashboardDrawer }               from './DashboardDrawer'
import { ImportDashboardDrawer }         from './ImportDashboardDrawer'
import { mockDashboardList, mockCanvas } from './mockData'
import * as UI                           from './styledComponents'

interface DashboardFilterContextProps {
  dashboardFilters: AnalyticsFilter;
  setDateFilterState: Dispatch<SetStateAction<DateFilter>>;
}

export interface DashboardInfo {
  id: string
  name: string
  author?: string
  updatedDate?: string
  widgetIds?: string[]
  diffWidgetIds?: string[]
  isLanding?: boolean
  isDefault?: boolean
  key: string
  index: number
}

const DashboardFilterContext = createContext<DashboardFilterContextProps>({
  dashboardFilters: getDateRangeFilter(DateRange.last8Hours) as AnalyticsFilter,
  setDateFilterState: () => {}
})

export const DashboardFilterProvider = ({ children }: { children : React.ReactNode }) => {
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { filters } = useDashboardFilter()
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)
  const dashboardFilters = { ...filters, startDate, endDate, range }

  return (
    <DashboardFilterContext.Provider value={{ dashboardFilters, setDateFilterState }}>
      {children}
    </DashboardFilterContext.Provider>
  )
}

export const useDashBoardUpdatedFilter = () => {
  const context = useContext(DashboardFilterContext)
  return context
}
export default function Dashboard () {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isEdgeEnabled = useIsEdgeReady()
  const isCanvasQ2Enabled = useIsSplitOn(Features.CANVAS_Q2)
  const isCore = isCoreTier(accountTier)

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Wi-Fi' }),
      value: 'ap',
      children: <ApWidgets />
    },
    {
      label: $t({ defaultMessage: 'Switch' }),
      value: 'switch',
      children: <SwitchWidgets />
    },
    ...(isEdgeEnabled ? [
      {
        label: $t({ defaultMessage: 'RUCKUS Edge' }),
        value: 'edge',
        children: <EdgeWidgets />
      }
    ] : [])
  ]

  /**
   * Sets the selected tab value in local storage.
   *
   * @param {string} value - The value of the selected tab.
   * @return {void} This function does not return anything.
   */
  const onTabChange = (value: string): void => {
    localStorage.setItem('dashboard-tab', value)
  }

  const { menuCollapsed } = useLayoutContext()
  const [canvasId, setCanvasId] = useState('')
  const [groups, setGroups] = useState([] as Group[])
  const [sections, setSections] = useState([] as Section[])
  const [dashboardId, setDashboardId] = useState(DEFAULT_DASHBOARD_ID)
  const [dashboardList, setDashboardList] = useState([] as DashboardInfo[])
  const [layout, setLayout] = useState({
    ...layoutConfig,
    calWidth: getCalculatedColumnWidth(menuCollapsed)
  })
  const [shadowCard, setShadowCard] = useState({} as CardInfo)

  //TODO
  useEffect(() => {
    if (isCanvasQ2Enabled) {
      setDashboardList(getDashboardList())
    }
  }, [])

  useEffect(() => {
    if (isCanvasQ2Enabled) {
      setLayout({
        ...layout,
        calWidth: getCalculatedColumnWidth(menuCollapsed)
      })
    }
  }, [menuCollapsed])

  useEffect(() => {
    if (isCanvasQ2Enabled && dashboardId !== DEFAULT_DASHBOARD_ID) {
      //TODO
      const { canvasId, sections, groups } = getCanvasData(mockCanvas)
      if (canvasId && sections) {
        setCanvasId(canvasId)
        setSections(sections)
        setGroups(groups)
      }
    }
  }, [dashboardId])

  const getDashboardList = () => {
    return mockDashboardList.map((item, index) => {
      return {
        ...item,
        key: item.id,
        index,
        isLanding: index === 0,
        isDefault: item.id === DEFAULT_DASHBOARD_ID
      }
    })
  }

  return (
    <DashboardFilterProvider>
      <DashboardPageHeader
        dashboardId={dashboardId}
        setDashboardId={setDashboardId}
        dashboardList={dashboardList}
      />
      {
        dashboardId === DEFAULT_DASHBOARD_ID
          ? <>
            {isCore ? <CoreDashboardWidgets /> : <CommonDashboardWidgets />}
            <Divider dashed
              style={{
                borderColor: 'var(--acx-neutrals-30)',
                margin: '20px 0px 5px 0px' }}/>
            <ContentSwitcher
              tabDetails={tabDetails}
              size='large'
              defaultValue={localStorage.getItem('dashboard-tab') || tabDetails[0].value}
              onChange={onTabChange}
              extra={
                <UI.Wrapper>
                  <TenantLink to={'/reports'}>
                    {$t({ defaultMessage: 'See more reports' })} <UI.ArrowChevronRightIcons />
                  </TenantLink>
                </UI.Wrapper>
              }
            />
            <Divider dashed
              style={{
                borderColor: 'var(--acx-neutrals-30)',
                margin: '20px 0px' }}/>
            <DashboardMapWidget />
          </>
          : <DndProvider backend={HTML5Backend}>
            <div className='grid'>
              <CanvasUI.Grid $type='pageview'>
                <Layout
                  readOnly={true}
                  sections={sections}
                  groups={groups}
                  setGroups={setGroups}
                  compactType={'horizontal'}
                  layout={layout}
                  setLayout={setLayout}
                  canvasId={canvasId}
                  shadowCard={shadowCard}
                  setShadowCard={setShadowCard}
                  containerId='dashboard-canvas-container'
                />
              </CanvasUI.Grid>
            </div>
          </DndProvider>
      }
    </DashboardFilterProvider>
  )
}

function DashboardPageHeader (props: {
  dashboardId: string,
  setDashboardId: (id: string) => void
  dashboardList: DashboardInfo[]
}) {
  const { dashboardId, setDashboardId, dashboardList } = props
  const { dashboardFilters, setDateFilterState } = useDashBoardUpdatedFilter()
  const { onPageFilterChange } = useContext(LoadTimeContext)

  const { startDate , endDate, range } = dashboardFilters
  const { rbacOpsApiEnabled } = getUserProfile()
  const { $t } = useIntl()
  const isEdgeEnabled = useIsEdgeReady()
  const isCanvasQ2Enabled = useIsSplitOn(Features.CANVAS_Q2)
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)

  const [previewData, setPreviewData] = useState([] as Canvas[])
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [dashboardDrawerVisible, setDashboardDrawerVisible] = useState(false)
  const [importDashboardDrawerVisible, setImportDashboardDrawerVisible] = useState(false)

  const hasCreatePermission = hasPermission({
    scopes: [WifiScopes.CREATE, SwitchScopes.CREATE, EdgeScopes.CREATE],
    rbacOpsIds: [
      getOpsApi(WifiRbacUrlsInfo.addAp),
      getOpsApi(SwitchRbacUrlsInfo.addSwitch),
      [
        getOpsApi(EdgeUrlsInfo.addEdge),
        getOpsApi(EdgeUrlsInfo.addEdgeCluster)
      ]
    ]
  })

  const hasAddVenuePermission = rbacOpsApiEnabled ?
    hasAllowedOperations([getOpsApi(CommonUrlsInfo.addVenue)])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) &&
  hasCrossVenuesPermission()

  const hasAddNetworkPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.addNetworkDeep)])
    : hasPermission({ scopes: [WifiScopes.CREATE] }) &&
  hasCrossVenuesPermission()

  const addMenu = <Menu
    expandIcon={<UI.MenuExpandArrow />}
    items={[
      ...(hasAddVenuePermission ? [{
        key: 'add-venue',
        label: <TenantLink to='venues/add'>
          {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        </TenantLink>
      }]: []),
      ...(hasAddNetworkPermission ? [{
        key: 'add-wifi-network',
        label: <TenantLink to='networks/wireless/add'>{
          $t({ defaultMessage: 'Wi-Fi Network' })}
        </TenantLink>
      }] : []),
      ...( hasCreatePermission ? [{
        key: 'add-device',
        label: $t({ defaultMessage: 'Device' }),
        // type: 'group',
        children: [
          ...( hasPermission({ scopes: [WifiScopes.CREATE],
            rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addAp)] }) ? [{
              key: 'add-ap',
              label: <TenantLink to='devices/wifi/add'>
                {$t({ defaultMessage: 'Wi-Fi AP' })}
              </TenantLink>
            }] : []),
          ...( hasPermission({ scopes: [SwitchScopes.CREATE],
            rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addSwitch)]
          }) ? [{
              key: 'add-switch',
              label: <TenantLink to='devices/switch/add'>
                {$t({ defaultMessage: 'Switch' })}
              </TenantLink>
            }] : []),
          ...(isEdgeEnabled &&
            hasPermission({
              scopes: [EdgeScopes.CREATE],
              rbacOpsIds: [
                [
                  getOpsApi(EdgeUrlsInfo.addEdge),
                  getOpsApi(EdgeUrlsInfo.addEdgeCluster)
                ]
              ]
            })) ? [{
              key: 'add-edge',
              label: <TenantLink to='devices/edge/add'>{
                $t({ defaultMessage: 'RUCKUS Edge' })
              }</TenantLink>
            }] : []
        ]
      }] : [])
    ]}
  />

  useEffect(() => {
    onPageFilterChange?.(dashboardFilters, true)
  }, [])

  useEffect(() => {
    onPageFilterChange?.(dashboardFilters)
  }, [dashboardFilters])

  const handleDashboardChange = (value: string) => {
    setDashboardId(value)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePreview = async (id: string) => {
    //TODO: get data by id
    setPreviewData(mockCanvas)
    setPreviewModalVisible(true)
  }

  const DashboardSelector = () => {
    return <>
      <UI.DashboardSelectDropdown />
      <UI.DashboardSelector
        defaultActiveFirstOption
        defaultValue={dashboardId}
        dropdownMatchSelectWidth={true}
        dropdownClassName='dashboard-select-dropdown'
        optionLabelProp='title'
        onChange={handleDashboardChange}
      >{
          dashboardList.map(item => {
            const isDefault = item.id === DEFAULT_DASHBOARD_ID
            const hasUpdated = item.diffWidgetIds && item.diffWidgetIds.length > 0
            const icon = item.author ? <GlobeOutlined size='sm' /> : <LockOutlined size='sm' />
            return <Select.Option
              key={item.id}
              value={item.id}
              title={item.name}
              className={isDefault ? 'default' : (hasUpdated ? 'hasUpdated' : '')}
            >
              { !isDefault && icon }{ item.name }
            </Select.Option>
          })
        }</UI.DashboardSelector>
    </>
  }

  return (<>
    <PageHeader
      title={''}
      titleExtra={isCanvasQ2Enabled &&
      <Space size={7} style={{ alignItems: 'center', lineHeight: 1 }}>
        <DashboardSelector />
        <Button
          data-testid='setting-button'
          ghost={true}
          icon={<SettingsOutlined size='sm' />}
          style={{ minWidth: '16px', width: '16px' }}
          onClick={()=> {
            setDashboardDrawerVisible(true)
          }}
        />
      </Space>}
      extra={[
        ...filterByAccess([
          <Dropdown overlay={addMenu}
            placement={'bottomRight'}
            rbacOpsIds={[
              getOpsApi(WifiRbacUrlsInfo.addAp),
              getOpsApi(SwitchRbacUrlsInfo.addSwitch),
              [
                getOpsApi(EdgeUrlsInfo.addEdge),
                getOpsApi(EdgeUrlsInfo.addEdgeCluster)
              ],
              getOpsApi(WifiRbacUrlsInfo.addNetworkDeep),
              getOpsApi(CommonUrlsInfo.addVenue)
            ]}
            scopeKey={[WifiScopes.CREATE, SwitchScopes.CREATE, EdgeScopes.CREATE]}>{() =>
              <Button type='primary'>{ $t({ defaultMessage: 'Add...' }) }</Button>
            }</Dropdown>
        ]),
        <VenueFilter
          disabled={dashboardId !== DEFAULT_DASHBOARD_ID}
          key={getShowWithoutRbacCheckKey('hierarchy-filter')}
        />,
        dashboardId === DEFAULT_DASHBOARD_ID && <RangePicker
          key={getShowWithoutRbacCheckKey('range-picker')}
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilterState as CallableFunction}
          showTimePicker
          selectionType={range}
          showLast8hours
          maxMonthRange={isDateRangeLimit ? 1 : 3}
        />
      ]}
    />

    { isCanvasQ2Enabled && <>
      <DashboardDrawer
        data={dashboardList}
        visible={dashboardDrawerVisible}
        handlePreview={handlePreview}
        onClose={() => {
          setDashboardDrawerVisible(false)
        }}
        onNextClick={() => {
          setImportDashboardDrawerVisible(true)
        }}
      />

      <ImportDashboardDrawer
        visible={importDashboardDrawerVisible}
        handlePreview={handlePreview}
        onBackClick={() => {
          setDashboardDrawerVisible(true)
          setImportDashboardDrawerVisible(false)
        }}
        onApplyClick={(keys) => {
          //TODO
          console.log(keys) // eslint-disable-line no-console
        }}
        onClose={() => setImportDashboardDrawerVisible(false)}
      />

      <PreviewDashboardModal
        data={previewData}
        visible={previewModalVisible}
        setVisible={setPreviewModalVisible}
      />
    </>}

  </>
  )
}

function ApWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)

  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TrafficByVolume filters={dashboardFilters} vizType={'area'} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={dashboardFilters} vizType={'area'} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopWiFiNetworks filters={dashboardFilters}/>
      </GridCol>
      {!isCore && <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopAppsByTraffic filters={dashboardFilters}/>
      </GridCol>}

    </GridRow>
  )
}

function DashboardMapWidget () {
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '428px' }}>
        <MapWidgetV2 />
      </GridCol>
    </GridRow>
  )
}

function SwitchWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  const supportPortTraffic = useIsSplitOn(Features.SWITCH_PORT_TRAFFIC)
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        {
          supportPortTraffic ?
            <SwitchesTrafficByVolume filters={dashboardFilters} vizType={'area'} />
            :<SwitchesTrafficByVolumeLegacy filters={dashboardFilters} vizType={'area'} />
        }
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByPoEUsage filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByTraffic filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByError filters={dashboardFilters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchModels filters={dashboardFilters}/>
      </GridCol>
    </GridRow>
  )
}

function EdgeWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopEdgesByTraffic filters={dashboardFilters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopEdgesByResources filters={dashboardFilters} />
      </GridCol>
    </GridRow>
  )
}

function CoreDashboardWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '410px' }}>
        <GridRow>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <AlarmWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <VenuesDashboardWidgetV2 />
          </GridCol>
        </GridRow>
        <GridRow style={{ marginTop: '10px' }}>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <DevicesDashboardWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <ClientsWidgetV2 />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '410px' }}>
        <DidYouKnow filters={dashboardFilters}/>
      </GridCol>
    </GridRow>
  )
}


function CommonDashboardWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '410px' }}>
        <GridRow>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <AlarmWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <IncidentsDashboardv2 filters={dashboardFilters} />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <ClientExperience filters={dashboardFilters}/>
          </GridCol>
        </GridRow>
        <GridRow style={{ marginTop: '10px' }}>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <VenuesDashboardWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <DevicesDashboardWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <ClientsWidgetV2 />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '410px' }}>
        <DidYouKnow filters={dashboardFilters}/>
      </GridCol>
    </GridRow>
  )
}
