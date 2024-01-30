/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { List }    from 'antd'
import { useIntl } from 'react-intl'


import { Table, TableProps, Loader, Tooltip, Tabs, Button, cssStr }                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                             from '@acx-ui/feature-toggle'
import { DevicesOutlined, LineChartOutline, ListSolid, MeshSolid }                                            from '@acx-ui/icons'
import { ApGroupTable, ApTable, ApCompatibilityDrawer, retrievedCompatibilitiesOptions }                      from '@acx-ui/rc/components'
import { useApGroupsListQuery, useGetVenueSettingsQuery, useMeshApsQuery, useGetApCompatibilitiesVenueQuery } from '@acx-ui/rc/services'
import {
  useTableQuery,
  APMesh,
  APMeshRole,
  ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { TenantLink }                            from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType }            from '@acx-ui/reports/components'


import {
  ArrowCornerIcon,
  ApSingleIcon,
  SignalDownIcon,
  SignalUpIcon,
  WiredIcon,
  SpanStyle,
  IconThirdTab,
  AlertNote
} from './styledComponents'


function venueNameColTpl (
  name: string, meshRole: string, id: string, intl: ReturnType<typeof useIntl>){
  const icon = {
    [APMeshRole.RAP]: <ArrowCornerIcon />,
    [APMeshRole.MAP]: <ApSingleIcon />,
    [APMeshRole.EMAP]: <WiredIcon />,
    [APMeshRole.DISABLED]: ''
  }
  const tooltipTitle = {
    [APMeshRole.RAP]: intl.$t({ defaultMessage: 'Root AP' }),
    [APMeshRole.MAP]: intl.$t({ defaultMessage: 'Mesh AP' }),
    [APMeshRole.EMAP]: intl.$t({ defaultMessage: 'eMesh AP' }),
    [APMeshRole.DISABLED]: intl.$t({ defaultMessage: 'disabled' })
  }
  return (
    <Tooltip title={tooltipTitle[meshRole as APMeshRole]}>
      <TenantLink to={`devices/wifi/${id}/details/overview`}>
        {icon[meshRole as APMeshRole]}
        {name}
      </TenantLink>
    </Tooltip>
  )
}

const getNamesTooltip = (object: { count: number, names: string[] },
  intl: ReturnType<typeof useIntl>, maxShow = 10) => {
  if (!object || object.count === 0) {
    return
  }

  interface NamesDataType {
    key: React.Key
    name: string
  }
  const data: NamesDataType[] = []
  let names: string[]
  let key: number = 1
  names = object.names.slice(0, maxShow)
  if (names && object.names.length > 0) {
    names.forEach(name => {
      data.push({ key, name })
      key++
    })
    if (object.count > maxShow) {
      const lastRow = intl.$t({
        defaultMessage: 'And {total} more' }, { total: object.count - maxShow })
      data.push({ key, name: lastRow })
    }

    return (<List
      dataSource={data}
      renderItem={item => <List.Item><SpanStyle>{item.name}</SpanStyle></List.Item>}
    />)
  }

  return
}

function getCols (intl: ReturnType<typeof useIntl>) {
  const columns: TableProps<APMesh>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'AP' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      width: 400,
      render: function (_, row) {
        return (
          venueNameColTpl(row.name!, row.meshRole, row.serialNumber, intl)
        )
      }
    },
    {
      key: 'apUpRssi',
      title: intl.$t({ defaultMessage: 'Signal' }),
      dataIndex: 'apUpRssi',
      sorter: false,
      width: 160,
      render: function (_, row) {
        if(row.meshRole !== APMeshRole.RAP && row.meshRole !== APMeshRole.EMAP){
          return (
            <div>
              {row.apUpRssi && <span style={{ paddingRight: '30px' }}>
                <SignalDownIcon />{row.apDownRssi}
              </span>}
              {row.apDownRssi && <span><SignalUpIcon />{row.apDownRssi}</span>}
            </div>
          )
        }
        return
      }
    },
    {
      key: 'apMac',
      title: intl.$t({ defaultMessage: 'Mac Address' }),
      dataIndex: 'apMac',
      sorter: true,
      width: 230,
      align: 'center'
    },
    {
      key: 'model',
      title: intl.$t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true,
      align: 'center'
    },
    {
      key: 'IP',
      title: intl.$t({ defaultMessage: 'IP' }),
      dataIndex: 'IP',
      sorter: true,
      align: 'center'
    },
    {
      key: 'clients',
      title: intl.$t({ defaultMessage: 'Connected clients' }),
      dataIndex: 'clients',
      align: 'center',
      render: function (_, row) {
        if (row.clients && typeof row.clients === 'object') {
          return <Tooltip title={
            getNamesTooltip(row.clients, intl)}>{ row.clients.count || 0}</Tooltip>
        }else{
          return row.clients || 0
        }
      }
    },
    {
      key: 'hops',
      title: intl.$t({ defaultMessage: 'Hop Count' }),
      dataIndex: 'hops',
      align: 'center',
      render: function (_, { hops }) {
        return hops || 0
      }
    }
  ]
  return columns
}

function transformData (data: APMesh[]) {
  return data.map((item: APMesh) => {
    const newItem = { ...item }
    if (item && item.uplink && item.uplink.length > 0) {
      newItem.apUpRssi = item.uplink[0].rssi
    }

    if (item.rssi) {
      newItem.apDownRssi = item.rssi
    }
    if(Array.isArray(item.downlink) && item.downlink.length > 0){
      newItem.children = transformData(item.downlink)
      transformData(item.downlink)
    }
    return newItem
  })
}

export function VenueWifi () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${params.venueId}/venue-details/devices`)

  const isShowApGroupTable = useIsSplitOn(Features.AP_GROUP_TOGGLE)

  const isApCompatibleCheckEnabled = useIsSplitOn(Features.WIFI_COMPATIBILITY_CHECK_TOGGLE)

  const [ enabledMesh, setEnabledMesh ] = useState(false)
  const [ showCompatibilityNote, setShowCompatibilityNote ] = useState(false)
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const apCompatibilityTenantId = sessionStorage.getItem(ACX_UI_AP_COMPATIBILITY_NOTE_HIDDEN_KEY) ?? ''
  const { data: venueWifiSetting } = useGetVenueSettingsQuery({ params })

  const { compatibilitiesFilterOptions, apCompatibilities, incompatible } = useGetApCompatibilitiesVenueQuery(
    {
      params: { venueId: params.venueId },
      payload: { filters: {} }
    },
    {
      skip: !isApCompatibleCheckEnabled,
      selectFromResult: ({ data }) => retrievedCompatibilitiesOptions(data)
    })

  const { apgroupFilterOptions } = useApGroupsListQuery({
    params: { tenantId: params.tenantId }, payload: {
      fields: ['name', 'venueId', 'clients', 'networks', 'venueName', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters: { isDefault: [false], venueId: [params.venueId] }
    }
  }, {
    selectFromResult: ({ data }) => ({
      apgroupFilterOptions: data?.data.map(v => ({ key: v.id, value: v.name })) || true
    })
  })

  useEffect(() => {
    if (venueWifiSetting) {
      setEnabledMesh(!!venueWifiSetting?.mesh?.enabled)
    }
  }, [venueWifiSetting])

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
    return (
      <AlertNote
        data-testid='ap-compatibility-alert-note'
        message={
          <>
            <Tooltip.Info
              isFilled
              iconStyle={{
                height: '16px',
                width: '16px',
                marginRight: '3px',
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
    >
      <Tabs.TabPane key='list'
        tab={<Tooltip title={$t({ defaultMessage: 'Device List' })}>
          <ListSolid />
        </Tooltip>}>
        <ApTable settingsId='venue-ap-table'
          rowSelection={{ type: 'checkbox' }}
          searchable={true}
          enableActions={true}
          enableApCompatibleCheck={isApCompatibleCheckEnabled}
          filterables={{
            deviceGroupId: apgroupFilterOptions,
            featureIncompatible: compatibilitiesFilterOptions
          }}
        />
        {isApCompatibleCheckEnabled &&
          <ApCompatibilityDrawer
            isMultiple
            visible={drawerVisible}
            data={apCompatibilities}
            onClose={() => setDrawerVisible(false)}
          />
        }
      </Tabs.TabPane>
      { enabledMesh && <Tabs.TabPane key='mesh'
        tab={<Tooltip title={$t({ defaultMessage: 'Mesh List' })}>
          <MeshSolid />
        </Tooltip>}>
        <VenueMeshApsTable />
      </Tabs.TabPane>}
      <Tabs.TabPane key='overview'
        tab={<Tooltip title={$t({ defaultMessage: 'Report View' })}>
          <LineChartOutline />
        </Tooltip>}>
        <EmbeddedReport
          reportName={ReportType.ACCESS_POINT}
          rlsClause={`"zoneName" in ('${params?.venueId}')`}
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

export function VenueMeshApsTable () {
  const params = useParams()
  const defaultPayload = {
    fields: [
      'clients',
      'serialNumber',
      'apDownRssis',
      'downlink',
      'IP',
      'apUpRssi',
      'apMac',
      'venueName',
      'meshRole',
      'uplink',
      'venueId',
      'name',
      'apUpMac',
      'apRssis',
      'model',
      'hops',
      'cog'
    ],
    filters: { venueId: [params.venueId] }
  }

  const settingsId = 'venue-mesh-aps-table'
  const tableQuery = useTableQuery({
    useQuery: useMeshApsQuery,
    defaultPayload,
    pagination: { settingsId }
  })

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Table
        settingsId={settingsId}
        columns={getCols(useIntl())}
        dataSource={transformData(tableQuery?.data?.data || [])}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='serialNumber'
      />
    </Loader>
  )

}
