import { useContext, useEffect, useRef, useState } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import {
  Loader,
  StepsFormLegacy,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useEnhanceNetworkVenueTableQuery,
  useEnhanceNetworkVenueTableV2Query,
  useNetworkVenueListV2Query,
  useNewNetworkVenueTableQuery,
  useScheduleSlotIndexMap
} from '@acx-ui/rc/services'
import {
  aggregateApGroupPayload,
  ApGroupModalState,
  ConfigTemplateType,
  EdgeMvSdLanViewData,
  generateDefaultNetworkVenue,
  IsNetworkSupport6g,
  NetworkSaveData,
  NetworkTunnelSoftGreAction,
  NetworkVenue,
  RadioTypeEnum,
  SchedulerTypeEnum,
  SchedulingModalState,
  useConfigTemplate,
  useTableQuery,
  Venue
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { useEnforcedStatus }                                                    from '../../configTemplates'
import { checkSdLanScopedNetworkDeactivateAction, useSdLanScopedNetworkVenues } from '../../EdgeSdLan/useEdgeSdLanActions'
import { NetworkApGroupDialog }                                                 from '../../NetworkApGroupDialog'
import {
  NetworkTunnelActionDrawer,
  NetworkTunnelActionModal,
  NetworkTunnelActionModalProps,
  useGetIpsecScopeVenueMap,
  useGetSoftGreScopeVenueMap
} from '../../NetworkTunnelActionModal'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum }     from '../../NetworkTunnelActionModal/types'
import { NetworkVenueScheduleDialog }                         from '../../NetworkVenueScheduleDialog'
import { transformAps, transformRadios, transformScheduling } from '../../pipes/apGroupPipes'
import { useIsEdgeFeatureReady }                              from '../../useEdgeActions'
import NetworkFormContext                                     from '../NetworkFormContext'
import { hasControlnetworkVenuePermission }                   from '../utils'

import { useTunnelColumn }                                                       from './TunnelColumn/useTunnelColumn'
import { handleIpsecAction, handleSdLanTunnelAction, handleSoftGreTunnelAction } from './TunnelColumn/utils'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'


const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'description',
    'city',
    'country',
    'networks',
    'aggregatedApStatus',
    'radios',
    'aps',
    'activated',
    'vlan',
    'scheduling',
    'switches',
    'switchClients',
    'latitude',
    'longitude',
    'mesh',
    'status'
  ]
}

const defaultRbacPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'description',
    'city',
    'country',
    'networks',
    'aggregatedApStatus',
    'radios',
    'aps',
    'activated',
    'vlan',
    'scheduling',
    'switches',
    'switchClients',
    'latitude',
    'longitude',
    'mesh',
    'status',
    'isOweMaster',
    'owePairNetworkId',
    'venueApGroups',
    'isEnforced'
  ],
  searchTargetFields: ['name']
}

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

const useNetworkVenueList = () => {
  const params = useParams()

  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const isUseNewRbacNetworkVenueApi = useIsSplitOn(Features.WIFI_NETWORK_VENUE_QUERY)

  const networkId = resolvedRbacEnabled? (params.networkId ?? getNetworkId()) : getNetworkId()

  const nonRbacTableQuery = useTableQuery({
    useQuery: useNetworkVenueListV2Query,
    apiParams: { networkId: networkId! },
    defaultPayload: {
      ...defaultPayload,
      isTemplate: isTemplate
    },
    option: { skip: resolvedRbacEnabled }
  })

  const rbacTableQuery = useTableQuery({
    useQuery: isApCompatibilitiesByModel
      ? (isUseNewRbacNetworkVenueApi
        ? useEnhanceNetworkVenueTableV2Query
        : useEnhanceNetworkVenueTableQuery)
      : useNewNetworkVenueTableQuery,
    apiParams: { networkId: networkId! },
    defaultPayload: {
      ...defaultRbacPayload,
      isTemplate: isTemplate
    },
    option: { skip: !resolvedRbacEnabled || !networkId }
  })

  return resolvedRbacEnabled ? rbacTableQuery : nonRbacTableQuery
}

interface schedule {
  [key: string]: string
}

interface VenuesProps {
  defaultActiveVenues?: string[]
}

export function Venues (props: VenuesProps) {
  const { defaultActiveVenues } = props

  const { isTemplate } = useConfigTemplate()

  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isEdgePinEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeL2oGreReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isSupport6gOWETransition = useIsSplitOn(Features.WIFI_OWE_TRANSITION_FOR_6G)
  const isIpSecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const default6gEnablementToggle = useIsSplitOn(Features.WIFI_AP_DEFAULT_6G_ENABLEMENT_TOGGLE)

  const form = Form.useFormInstance()
  const { cloneMode, data, setData, editMode } = useContext(NetworkFormContext)

  const activatedNetworkVenues: NetworkVenue[] = Form.useWatch('venues')
  const softGreAssociationUpdate = Form.useWatch('softGreAssociationUpdate')
  const params = useParams()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)

  const prevIsWPA3securityRef = useRef(false)
  const isWPA3security = IsNetworkSupport6g(data, { isSupport6gOWETransition })

  const { $t } = useIntl()
  const tableQuery = useNetworkVenueList()

  const [tableData, setTableData] = useState<Venue[]>([])

  const {
    addNetworkVenueOpsAPi,
    deleteNetworkVenueOpsAPi,
    hasActivateNetworkVenuePermission,
    hasUpdateNetworkVenuePermission
  } = hasControlnetworkVenuePermission(isTemplate)

  // AP group form
  const [apGroupModalState, setApGroupModalState] = useState<ApGroupModalState>({
    visible: false
  })

  const [scheduleModalState, setScheduleModalState] = useState<SchedulingModalState>({
    visible: false
  })
  const [tunnelModalState, setTunnelModalState] = useState<NetworkTunnelActionModalProps>({
    visible: false
  } as NetworkTunnelActionModalProps)

  const isDefaultVenueSetted = useRef(false)

  // hooks for tunnel column - start
  const sdLanScopedNetworkVenues = useSdLanScopedNetworkVenues(params.networkId)
  const softGreVenueMap = useGetSoftGreScopeVenueMap()
  const ipsecVenueMap = useGetIpsecScopeVenueMap()
  const tunnelColumn = useTunnelColumn({
    network: data,
    sdLanScopedNetworkVenues,
    softGreVenueMap,
    setTunnelModalState,
    ipsecVenueMap
  })
  // hooks for tunnel column - end

  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus(ConfigTemplateType.VENUE)

  useEffect(() => {
    // need to make sure table data is ready.
    // should avoid triggering in editMode/cloneMode
    // eslint-disable-next-line max-len
    if(isDefaultVenueSetted.current || !defaultActiveVenues?.length || !data || !tableData?.length || editMode || cloneMode) return

    defaultActiveVenues.forEach(defaultVenueId => {
      handleActivateVenue(true, [{ id: defaultVenueId } as Venue])
    })
    isDefaultVenueSetted.current = true

  }, [defaultActiveVenues, data, tableData])

  const handleVenueSaveData = (newSelectedNetworkVenues: NetworkVenue[]) => {
    setData && setData({ ...data, venues: newSelectedNetworkVenues })
    form.setFieldsValue({ venues: newSelectedNetworkVenues })
  }

  const handleActivateVenue = (isActivate: boolean, rows: Venue[]) => {
    let newSelectedNetworkVenues: NetworkVenue[] = [...(activatedNetworkVenues ?? [])]
    if (isActivate) {
      const newActivatedNetworkVenues: NetworkVenue[] =
        rows.map(row => {
          const newNetworkVenue = generateDefaultNetworkVenue(row.id, row.networkId as string)
          if (isWPA3security) {
            newNetworkVenue.allApGroupsRadioTypes?.push(RadioTypeEnum._6_GHz)
          }
          return newNetworkVenue
        })

      // eslint-disable-next-line max-len
      newSelectedNetworkVenues = _.uniqBy([...newSelectedNetworkVenues, ...newActivatedNetworkVenues], 'venueId')
    } else {
      const handleVenuesIds = rows.map(row => row.id)
      _.remove(newSelectedNetworkVenues, v => handleVenuesIds.includes(v.venueId as string))
    }

    handleVenueSaveData(newSelectedNetworkVenues)
    setTableDataActivate(tableData, newSelectedNetworkVenues.map(i=>i.venueId))
  }

  const setTableDataActivate = (dataOfTable: Venue[], selectedVenueIds: (string|undefined)[]) => {
    const data:Venue[] = []

    dataOfTable.forEach(item => {
      let activated = { isActivated: false }
      if(selectedVenueIds.find(id => id === item.id)) {
        activated.isActivated = true
      }
      item.activated = activated
      data.push(item)
    })
    setTableData(data)
  }

  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      rbacOpsIds: [addNetworkVenueOpsAPi],
      visible: (selectedRows) => {
        const enabled = selectedRows.some((item)=>{
          return item.mesh && item.mesh.enabled && data && data.enableDhcp
        })
        return !enabled
      },
      disabled: (selectedRows) => hasEnforcedItem(selectedRows),
      tooltip: (selectedRows) => getEnforcedActionMsg(selectedRows),
      onClick: (rows) => {
        handleActivateVenue(true, rows)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      rbacOpsIds: [deleteNetworkVenueOpsAPi],
      visible: (selectedRows) => {
        const enabled = selectedRows.some((item)=>{
          return item.mesh && item.mesh.enabled && data && data.enableDhcp
        })
        return !enabled
      },
      disabled: (selectedRows) => hasEnforcedItem(selectedRows),
      tooltip: (selectedRows) => getEnforcedActionMsg(selectedRows),
      onClick: (rows) => {
        checkSdLanScopedNetworkDeactivateAction(sdLanScopedNetworkVenues.networkVenueIds,
          rows.map(item => item.id),
          () => {
            handleActivateVenue(false, rows)
          })
      }
    }
  ]

  useEffect(()=>{
    if(tableQuery.data && activatedNetworkVenues){

      const currentTableData = tableQuery.data.data.map(item => {
        item = cloneMode ? _.omit(item, 'networkId') : item

        const targetNetworkVenue = activatedNetworkVenues.find(nv => nv.venueId === item.id)

        return {
          ...item,
          deepVenue: targetNetworkVenue,
          // work around of read-only records from RTKQ
          activated: targetNetworkVenue ? { isActivated: true } : { ...item.activated }
        }
      })

      setTableDataActivate(currentTableData, activatedNetworkVenues.map(v=>v.venueId))
    }
  }, [tableQuery.data, activatedNetworkVenues])

  useEffect(()=>{
    if(data && (activatedNetworkVenues === undefined || activatedNetworkVenues?.length === 0)) {
      if(cloneMode){
        const venuesData = data?.venues?.map(item => {
          return { ...item, networkId: null, id: null }
        })
        form.setFieldsValue({ venues: venuesData })
      }else{
        form.setFieldsValue({ venues: data.venues })
      }
    }
  }, [data])

  useEffect(()=>{
    if(data && activatedNetworkVenues?.length > 0 && !softGreAssociationUpdate && softGreVenueMap) {
      const originalNetworkId = data.id
      if(cloneMode && originalNetworkId){
        const updateContent = {} as NetworkTunnelSoftGreAction
        activatedNetworkVenues?.forEach(item => {
          const venueId = item.venueId
          if (venueId) {
            // eslint-disable-next-line max-len
            const softGreVenue = softGreVenueMap[venueId]?.find(sg => sg.networkIds.includes(originalNetworkId))
            if (softGreVenue) {
            // eslint-disable-next-line max-len
              updateContent[`${venueId}`] = { newProfileId: softGreVenue.profileId, newProfileName: softGreVenue.profileName, oldProfileId: '' }
            }
          }
        })

        if (!_.isEmpty(updateContent)) {
          form.setFieldValue('softGreAssociationUpdate', updateContent)
        }
      }
    }
  }, [form, data, cloneMode, activatedNetworkVenues, softGreVenueMap, softGreAssociationUpdate])

  useEffect(() => {
    if (data?.wlan) {
      const isSupport6G = IsNetworkSupport6g(data, { isSupport6gOWETransition })
      if (prevIsWPA3securityRef.current === true && !isSupport6G) {
        if (activatedNetworkVenues?.length > 0) {
          // remove radio 6g when wlanSecurity is changed from WPA3 to others
          const newActivatedNetworkVenues = activatedNetworkVenues.map(venue => {
            const { allApGroupsRadioTypes, apGroups } = venue
            if (allApGroupsRadioTypes && allApGroupsRadioTypes.includes(RadioTypeEnum._6_GHz)) {
              allApGroupsRadioTypes.splice(allApGroupsRadioTypes.indexOf(RadioTypeEnum._6_GHz), 1)
            }
            if (apGroups && apGroups.length > 0) {
              apGroups.forEach(apGroup => {
                if (apGroup.radioTypes && apGroup.radioTypes.includes(RadioTypeEnum._6_GHz)) {
                  apGroup.radioTypes.splice(apGroup.radioTypes.indexOf(RadioTypeEnum._6_GHz), 1)
                }
              })
            }
            return venue
          })

          handleVenueSaveData(newActivatedNetworkVenues)
          setTableDataActivate(tableData, newActivatedNetworkVenues.map(i=>i.venueId))
        }
      // eslint-disable-next-line max-len
      } else if (default6gEnablementToggle && prevIsWPA3securityRef.current === false && isSupport6G) {
        if (activatedNetworkVenues?.length > 0) {
          // add 6G when switching to WPA3
          const newActivatedNetworkVenues = activatedNetworkVenues.map(venue => {
            const { allApGroupsRadioTypes, apGroups } = venue
            if (allApGroupsRadioTypes && !allApGroupsRadioTypes.includes(RadioTypeEnum._6_GHz)) {
              allApGroupsRadioTypes.push(RadioTypeEnum._6_GHz)
            }
            if (apGroups && apGroups.length > 0) {
              apGroups.forEach(apGroup => {
                if (apGroup.radioTypes && !apGroup.radioTypes.includes(RadioTypeEnum._6_GHz)) {
                  apGroup.radioTypes.push(RadioTypeEnum._6_GHz)
                }
              })
            }
            return venue
          })

          handleVenueSaveData(newActivatedNetworkVenues)
          setTableDataActivate(tableData, newActivatedNetworkVenues.map(i => i.venueId))
        }
      }
      prevIsWPA3securityRef.current = isSupport6G
    }
  }, [data?.wlan])

  const scheduleSlotIndexMap = useScheduleSlotIndexMap(tableData, isMapEnabled)

  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'city',
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      sorter: true
    },
    {
      key: 'country',
      title: $t({ defaultMessage: 'Country' }),
      dataIndex: 'country',
      sorter: true
    },
    {
      key: 'network',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: ['networks', 'count'],
      align: 'center'
    },
    {
      key: 'aggregatedApStatus',
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      dataIndex: 'aggregatedApStatus',
      align: 'center',
      render: function (_, row) {
        if (!row.aggregatedApStatus) { return 0 }
        return Object
          .values(row.aggregatedApStatus)
          .reduce((a, b) => a + b, 0)
      }
    },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      render: function (_, row) {
        let disabled = false
        let title = ''
        if (hasActivateNetworkVenuePermission) {
          if (data && data.enableDhcp && row.mesh && row.mesh.enabled){
            disabled = true
            // eslint-disable-next-line max-len
            title = $t({ defaultMessage: 'You cannot activate the DHCP service on this <venueSingular></venueSingular> because it already enabled mesh setting' })
          } else if (hasEnforcedItem([row])) {
            disabled = true
            title = getEnforcedActionMsg([row])
          }
        }

        return <Tooltip
          title={title}
          placement='bottom'>
          <Switch
            disabled={!hasActivateNetworkVenuePermission || disabled}
            checked={Boolean(row.activated?.isActivated)}
            onClick={(checked, event) => {
              event.stopPropagation()
              if (!checked) {
                checkSdLanScopedNetworkDeactivateAction(sdLanScopedNetworkVenues.networkVenueIds,
                  [row.id],
                  () => {
                    handleActivateVenue(false, [row])
                  })
              } else {
                handleActivateVenue(checked, [row])
              }
            }}
          /></Tooltip>

      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (_, row) {
        return transformAps(
          getCurrentVenue(row),
          data as NetworkSaveData,
          (e) => handleClickApGroups(row, e),
          !hasUpdateNetworkVenuePermission,
          row?.incompatible
        )
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (_, row) {
        return transformRadios(
          getCurrentVenue(row),
          data as NetworkSaveData,
          (e) => handleClickApGroups(row, e),
          !hasUpdateNetworkVenuePermission
        )
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (_, row) {
        return transformScheduling(
          getCurrentVenue(row),
          scheduleSlotIndexMap[row.id],
          (e) => handleClickScheduling(row, e),
          !hasUpdateNetworkVenuePermission
        )
      }
    },
    ...tunnelColumn
  ]

  const getCurrentVenue = (row: Venue) => {
    if (!row.activated.isActivated) {
      return
    }
    const venueId = row.id
    // Need to get deepVenue from data(NetworkFormContext) since this table doesn't post data immediately
    return data?.venues?.find(v => v.venueId === venueId)
  }

  const handleClickScheduling = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setScheduleModalState({
      visible: true,
      venue: row,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleClickApGroups = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setApGroupModalState({
      visible: true,
      venueName: row.name,
      network: data,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleApGroupFormFinish = (name: string, newData: FormFinishInfo) => {
    if (name === 'networkApGroupForm') {
      let oldData = _.cloneDeep(apGroupModalState.networkVenue)
      const payload = aggregateApGroupPayload(newData, oldData, true)

      let selectedVenues = data?.venues?.map((row) => {
        if(row.venueId ===payload.venueId) {
          return { ...row, ...payload }
        } else {return row}
      })

      if(selectedVenues) {
        handleVenueSaveData(selectedVenues)
      }
      setApGroupModalState({
        visible: false
      })
    }
  }

  const handleCancel = () => {
    setApGroupModalState({
      visible: false
    })
    setScheduleModalState({
      visible: false
    })
  }

  const handleCloseTunnelModal = () =>
    setTunnelModalState({ visible: false } as NetworkTunnelActionModalProps)

  const handleScheduleFormFinish = (name: string, info: FormFinishInfo) => {
    let scheduleData = _.cloneDeep(scheduleModalState.networkVenue)

    const scheduler = info.values?.scheduler
    const { type, ...weekdaysData } = scheduler || {}

    let tmpScheduleList: schedule = { type }

    if ( type === SchedulerTypeEnum.ALWAYS_OFF) {
      handleActivateVenue(false, [scheduleModalState.venue! as Venue])
      setScheduleModalState({
        visible: false
      })
      return
    }

    if (type === SchedulerTypeEnum.CUSTOM) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let map: { [key: string]: any } = weekdaysData
      for (let key in map) {
        let scheduleList: string[] = []
        for(let i = 0; i < 96; i++){
          scheduleList.push('0')
        }
        map[key].forEach((item: string) => {
          const value = parseInt(item.split('_')[1], 10)
          scheduleList[value] = '1'
        })
        tmpScheduleList[key] = scheduleList.join('')
      }
    }

    const payload = _.assign(scheduleData, { scheduler: tmpScheduleList })

    let selectedVenues = data?.venues?.map((row) => {
      if(row.venueId ===payload.venueId) {
        return { ...row, ...payload }
      } else {return row}
    })

    if(selectedVenues) {
      handleVenueSaveData(selectedVenues)
    }
    setScheduleModalState({
      visible: false
    })
  }

  const handleNetworkTunnelActionFinish = async (
    modalFormValues: NetworkTunnelActionForm,
    otherData: {
      network: NetworkTunnelActionModalProps['network'],
      venueSdLan?: EdgeMvSdLanViewData,
      isL2greReady?: boolean
    }
  ) => {
    try {
      const args = {
        form,
        modalFormValues,
        networkInfo: otherData.network,
        otherData
      }
      if (isSoftGreEnabled
        && modalFormValues.tunnelType === NetworkTunnelTypeEnum.SoftGre) {
        handleSoftGreTunnelAction(args)
        if (isIpSecEnabled) {
          handleIpsecAction(args)
        }
      }

      if(modalFormValues.tunnelType === NetworkTunnelTypeEnum.SdLan) {
        const networkVenueId = otherData.network?.venueId ?? ''
        // eslint-disable-next-line max-len
        const originalVenueSdLan = sdLanScopedNetworkVenues.sdLansVenueMap[networkVenueId]?.[0]
        args.otherData.isL2greReady = isEdgeL2oGreReady
        const shouldCloseModal = await handleSdLanTunnelAction(originalVenueSdLan, args)
        if (shouldCloseModal !== false)
          handleCloseTunnelModal()
      }
    }catch (e) {
      console.error('Error on handleNetworkTunnelActionFinish', e)  // eslint-disable-line no-console
      handleCloseTunnelModal()
    }
  }

  const allowedRowActions = filterByAccess(rowActions)

  return (
    <>
      <StepsFormLegacy.Title>
        { $t({ defaultMessage: '<VenuePlural></VenuePlural>' }) }
      </StepsFormLegacy.Title>
      <p>
        { $t({ defaultMessage: 'Select <venuePlural></venuePlural> to activate this network' }) }
      </p>
      <Form.Item name='venues'>
        <Loader states={[tableQuery]}>
          <Table
            rowKey='id'
            rowActions={allowedRowActions}
            rowSelection={(allowedRowActions.length > 0) &&{
              type: 'checkbox'
            }}
            columns={columns}
            dataSource={tableData}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
          <Form.Provider
            onFormFinish={handleApGroupFormFinish}
          >
            <NetworkApGroupDialog
              {...apGroupModalState}
              tenantId={params.tenantId}
              formName='networkApGroupForm'
              onCancel={handleCancel}
            />
          </Form.Provider>
          <Form.Provider
            onFormFinish={handleScheduleFormFinish}
          >
            <NetworkVenueScheduleDialog
              {...scheduleModalState}
              formName='networkVenueScheduleForm'
              network={data}
              onCancel={handleCancel}
            />
          </Form.Provider>
          {(isEdgeSdLanMvEnabled || isSoftGreEnabled) && tunnelModalState.visible &&
          <>
            {!isIpSecEnabled &&
            <NetworkTunnelActionModal
              {...tunnelModalState}
              onFinish={handleNetworkTunnelActionFinish}
              onClose={handleCloseTunnelModal}/>}
            {isIpSecEnabled &&
            <NetworkTunnelActionDrawer
              {...tunnelModalState}
              onFinish={handleNetworkTunnelActionFinish}
              onClose={handleCloseTunnelModal}/>}
          </>
          }
        </Loader>
      </Form.Item>
      {isEdgePinEnabled && <Form.Item hidden name={['sdLanAssociationUpdate']}></Form.Item>}
      {isSoftGreEnabled && <Form.Item hidden name={['softGreAssociationUpdate']}></Form.Item>}
      {isSoftGreEnabled && isIpSecEnabled &&
        <Form.Item hidden name={['ipsecAssociationUpdate']}></Form.Item>}
    </>
  )
}
