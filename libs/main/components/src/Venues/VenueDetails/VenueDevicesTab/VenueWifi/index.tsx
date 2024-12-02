/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'


import { Tooltip, Tabs, Button, cssStr } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import {
  DevicesOutlined,
  LineChartOutline,
  ListSolid,
  MeshSolid
}  from '@acx-ui/icons'
import {
  ApGroupTable,
  ApTable,
  ApCompatibilityDrawer,
  retrievedCompatibilitiesOptions,
  retrievedApCompatibilitiesOptions,
  useApGroupsFilterOpts,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import {
  useGetVenueSettingsQuery,
  useGetApCompatibilitiesVenueQuery,
  useGetVenueMeshQuery,
  useGetVenueApCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY,
  IncompatibleFeatureLevelEnum
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType }            from '@acx-ui/reports/components'

import { CompatibilityCheck }      from './CompatibilityCheck'
import { IconThirdTab, AlertNote } from './styledComponents'
import { RbacVenueMeshApsTable }   from './VenueMeshApsTable/RbacVenueMeshApsTable'
import { VenueMeshApsTable }       from './VenueMeshApsTable/VenueMeshApsTable'

const useIsMeshEnabled = (venueId: string | undefined) => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { data: venueWifiSetting } = useGetVenueSettingsQuery(
    { params: { venueId } },
    { skip: isWifiRbacEnabled })

  const { data: venueMeshSettings } = useGetVenueMeshQuery({
    params: { venueId } },
  { skip: !isWifiRbacEnabled })

  return (isWifiRbacEnabled
    ? venueMeshSettings?.enabled
    : venueWifiSetting?.mesh?.enabled) ?? false
}

const useGetCompatibilitiesOptions = (venueId: string) => {
  const isSupportApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const oldFilterData = useGetApCompatibilitiesVenueQuery(
    {
      params: { venueId },
      payload: { filters: {} }
    }, {
      skip: isSupportApCompatibilitiesByModel,
      selectFromResult: ({ data }) => retrievedApCompatibilitiesOptions(data)
    })

  const newFilterData = useGetVenueApCompatibilitiesQuery(
    {
      params: { venueId },
      payload: {
        filters: {
          venueIds: [ venueId ],
          featureLevels: [IncompatibleFeatureLevelEnum.VENUE]
        },
        page: 1,
        pageSize: 10
      }
    }, {
      skip: !isSupportApCompatibilitiesByModel,
      selectFromResult: ({ data }) => retrievedCompatibilitiesOptions(data)
    }
  )

  const filterData = isSupportApCompatibilitiesByModel? newFilterData : oldFilterData
  return filterData

}

export function VenueWifi () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const { venueId } = params
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/devices`)

  const isEnableWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  const isShowApGroupTable = useIsSplitOn(Features.AP_GROUP_TOGGLE)

  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const [ showCompatibilityNote, setShowCompatibilityNote ] = useState(false)
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const apCompatibilityTenantId = sessionStorage.getItem(ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY) ?? ''
  const enabledMesh = useIsMeshEnabled(venueId)

  const { compatibilitiesFilterOptions, apCompatibilities, incompatible } = useGetCompatibilitiesOptions(venueId!)

  const apgroupFilterOptions = useApGroupsFilterOpts({ isDefault: [false], venueId: [venueId] })

  useEffect(() => {
    if (incompatible > 0) {
      if (apCompatibilityTenantId !== params.tenantId) {
        setShowCompatibilityNote(true)
      }
    }
  }, [incompatible])

  const onCategoryTabChange = (tab: string) => {
    const { activeSubTab } = params
    activeSubTab && navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeSubTab}/${tab}`
    })
  }

  const clickCloseNote = () => {
    if (params.tenantId) {
      sessionStorage.setItem(ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY, params.tenantId)
      setShowCompatibilityNote(false)
    }
  }

  const alertNote = () => {
    return isEdgeCompatibilityEnabled && venueId
      ? <CompatibilityCheck venueId={venueId} />
      : (
        <AlertNote
          data-testid='ap-compatibility-alert-note'
          message={
            <>
              <Tooltip.Info
                isFilled
                iconStyle={{
                  height: '16px',
                  width: '16px',
                  marginRight: '6px',
                  marginBottom: '-3px',
                  color: cssStr('--acx-accents-orange-50')
                }} />
              <span style={{ lineHeight: '28px' }}>
                {$t({
                  defaultMessage:
          '{total} access points are not compatible with certain Wi-Fi features.' },
                { total: incompatible })}
              </span>
              <Button
                data-testid='ap-compatibility-alert-note-open'
                type='link'
                style={{ fontSize: '12px', marginBottom: '4px' }}
                onClick={() => {
                  setDrawerVisible(true)
                }}>
                {$t({ defaultMessage: 'See details' })}
              </Button>
            </>}
          type='info'
          closable
          onClose={clickCloseNote} />
      )
  }

  return (
    <IconThirdTab
      activeKey={params?.categoryTab}
      defaultActiveKey='list'
      onChange={onCategoryTabChange}
      tabBarExtraContent={showCompatibilityNote? alertNote(): []}
      destroyInactiveTabPane
    >
      <Tabs.TabPane key='list'
        tab={<Tooltip title={$t({ defaultMessage: 'Device List' })}>
          <ListSolid />
        </Tooltip>}>
        <ApTable settingsId='venue-ap-table'
          rowSelection={{ type: 'checkbox' }}
          searchable={true}
          enableActions={true}
          enableApCompatibleCheck={true}
          filterables={{
            deviceGroupId: apgroupFilterOptions,
            featureIncompatible: compatibilitiesFilterOptions
          }}
        />
        <ApCompatibilityDrawer
          isMultiple
          visible={drawerVisible}
          data={apCompatibilities}
          onClose={() => setDrawerVisible(false)}
        />
      </Tabs.TabPane>
      { enabledMesh && <Tabs.TabPane key='mesh'
        tab={<Tooltip title={$t({ defaultMessage: 'Mesh List' })}>
          <MeshSolid />
        </Tooltip>}>
        {isEnableWifiRbac ? <RbacVenueMeshApsTable /> : <VenueMeshApsTable />}
      </Tabs.TabPane>}
      <Tabs.TabPane key='overview'
        tab={<Tooltip title={$t({ defaultMessage: 'Report View' })}>
          <LineChartOutline />
        </Tooltip>}>
        <EmbeddedReport
          reportName={ReportType.ACCESS_POINT}
          rlsClause={`"zoneName" in ('${venueId}')`}
        />
      </Tabs.TabPane>
      { isShowApGroupTable && (
        <Tabs.TabPane key='apgroup'
          tab={<Tooltip title={$t({ defaultMessage: 'AP Group List' })}>
            <DevicesOutlined />
          </Tooltip>}>
          <ApGroupTable rowSelection={{ type: 'checkbox' }}
            searchable={true}
            enableActions={true}
          />
        </Tabs.TabPane>
      )}
    </IconThirdTab>
  )
}