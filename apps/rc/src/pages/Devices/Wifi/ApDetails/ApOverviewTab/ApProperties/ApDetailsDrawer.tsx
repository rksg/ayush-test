/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Button, Divider, Tooltip } from 'antd'
import { capitalize, includes }     from 'lodash'
import { useIntl }                  from 'react-intl'

import { Drawer, Descriptions, PasswordInput } from '@acx-ui/components'
import { get }                                 from '@acx-ui/config'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import {
  defaultSwitchPayload,
  EditPortDrawer,
  getInactiveTooltip,
  isLAGMemberPort,
  SwitchLagModal,
  SwitchLagParams,
  isOperationalSwitchPort,
  isStackPort
} from '@acx-ui/rc/components'
import {
  useGetVenueQuery,
  useGetVenueSettingsQuery,
  useGetApValidChannelQuery,
  useSwitchListQuery,
  useLazySwitchPortlistQuery,
  useLazyGetLagListQuery,
  useGetApOperationalQuery,
  useGetFlexAuthenticationProfilesQuery
} from '@acx-ui/rc/services'
import { useLazyGetApLldpNeighborsQuery, useLazyGetApNeighborsQuery } from '@acx-ui/rc/services'
import {
  ApDetails,
  ApVenueStatusEnum,
  ApViewModel,
  DeviceGps,
  gpsToFixed,
  APPropertiesAFCPowerStateRender,
  Lag,
  SwitchRow,
  SwitchPortViewModelQueryFields,
  SwitchPortViewModel,
  SwitchPortStatus,
  SwitchRbacUrlsInfo,
  useApContext,
  ApLldpNeighbor,
  ApRfNeighbor } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                from '@acx-ui/react-router-dom'
import { SwitchScopes }                         from '@acx-ui/types'
import { useUserProfileContext, hasPermission } from '@acx-ui/user'
import { getOpsApi, CatchErrorResponse }        from '@acx-ui/utils'

import { useGetApCapabilities } from '../../../hooks'
import { NewApNeighborTypes }   from '../../ApNeighbors/constants'
import { useApNeighbors }       from '../../ApNeighbors/useApNeighbors'

import { ApCellularProperties } from './ApCellularProperties'
import * as UI                  from './styledComponents'

interface ApDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentAP: ApViewModel,
  apDetails: ApDetails
}

const useGetApPassword = (currentAP: ApViewModel) => {
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const params = {
    venueId: currentAP?.venueId,
    serialNumber: currentAP?.serialNumber
  }

  const { data: venueSettings } = useGetVenueSettingsQuery({ params },
    { skip: isUseRbacApi || !currentAP?.venueId })

  const { data: venueRbacApSetings } = useGetApOperationalQuery({ params, enableRbac: isUseRbacApi },
    { skip: !isUseRbacApi || !currentAP?.venueId })

  return isUseRbacApi ? venueRbacApSetings?.loginPassword : venueSettings?.apPassword
}


export const ApDetailsDrawer = (props: ApDetailsDrawerProps) => {
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const portLinkEnabled = useIsSplitOn(Features.SWITCH_PORT_HYPERLINK)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchAPPortLinkEnabled = useIsSplitOn(Features.SWITCH_AP_PORT_HYPERLINK)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const isDisplayMoreApPoePropertiesEnabled = useIsSplitOn(Features.WIFI_DISPLAY_MORE_AP_POE_PROPERTIES_TOGGLE)
  const AFC_Featureflag = get('AFC_FEATURE_ENABLED').toLowerCase() === 'true'

  const { serialNumber, venueId } = useApContext()

  const { $t } = useIntl()
  const routeParams = useParams()

  const { data: userProfile } = useUserProfileContext()
  const [ switchPortlist ] = useLazySwitchPortlistQuery()
  const [ getLagList ] = useLazyGetLagListQuery()

  const { visible, setVisible, currentAP, apDetails } = props
  const [switchPort, setSwitchPort] = useState<React.ReactNode>(currentAP?.switchPort)
  const [editLag, setEditLag] = useState([] as Lag[])
  const [editLagModalVisible, setEditLagModalVisible] = useState(false)
  const [editPortDrawerVisible, setEditPortDrawerVisible] = useState(false)
  const [selectedPorts, setSelectedPorts] = useState([] as SwitchPortStatus[])
  const [lagDrawerParams, setLagDrawerParams] = useState({} as SwitchLagParams)

  const { APSystem, cellularInfo: currentCellularInfo } = currentAP?.apStatusData || {}
  const ipTypeDisplay = (APSystem?.ipType) ? ` [${capitalize(APSystem?.ipType)}]` : ''

  const params = {
    venueId: currentAP?.venueId,
    serialNumber: currentAP?.serialNumber
  }
  const { data: apValidChannels } = useGetApValidChannelQuery({ params, enableRbac: isUseRbacApi },
    { skip: !params.venueId })


  const { data: apCapabilities } = useGetApCapabilities({
    params,
    modelName: currentAP?.model,
    enableRbac: isUseRbacApi })

  const { data: venueData } = useGetVenueQuery({ params, enableRbac: isUseRbacApi }, { skip: !params.venueId })

  const { authenticationProfiles } = useGetFlexAuthenticationProfilesQuery({
    payload: {
      pageSize: 10000,
      sortField: 'profileName',
      sortOrder: 'ASC'
    }
  }, {
    skip: !isSwitchFlexAuthEnabled,
    selectFromResult: ( { data } ) => ({
      authenticationProfiles: data?.data
    })
  })

  const apNeighborQuery = isUseRbacApi ?
    useLazyGetApNeighborsQuery :
    useLazyGetApLldpNeighborsQuery
  const [ getApNeighbors, getApNeighborsStates ] = apNeighborQuery()
  const { handleApiError } = useApNeighbors('lldp', serialNumber!, socketHandler, venueId)

  const { data: switchList } = useSwitchListQuery({
    params: { tenantId: routeParams.tenantId },
    payload: {
      ...defaultSwitchPayload,
      pageSize: 10000,
      filters: { venueId: [currentAP?.venueId], id: [currentAP?.switchId] }
    },
    enableAggregateStackMember: false,
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !isSwitchFlexAuthEnabled || !currentAP?.venueId
  })

  const apPassword = useGetApPassword(currentAP)

  const fetchSwitchDetails = async () => {
    if (!portLinkEnabled || !hasPermission({
      scopes: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.savePortsSetting)]
    })) {
      return
    }

    const { data: switchPortsData } = await switchPortlist({
      params: { tenantId: routeParams.tenantId },
      payload: {
        filters: { switchId: [currentAP.switchId] },
        sortField: 'portIdentifierFormatted',
        sortOrder: 'ASC',
        page: 1,
        pageSize: 10000,
        fields: SwitchPortViewModelQueryFields
      },
      enableRbac: isSwitchRbacEnabled
    })

    const portData = switchPortsData?.data.filter((item: SwitchPortViewModel) => item.portIdentifier === currentAP?.switchPort)[0]
    const disablePortEdit = portData && (!isOperationalSwitchPort(portData) || isStackPort(portData))

    if (disablePortEdit) {
      const tooltip = portData ? getInactiveTooltip(portData) :
        $t({
          defaultMessage:
              'The port cannot be edited since it is on a switch that is not operational'
        })

      setSwitchPort(<Tooltip title={tooltip}> {currentAP?.switchPort} </Tooltip>)
    } else if(portData) {
      const onEditLag = async () => {
        const { data: lagList } = await getLagList({
          params: {
            ...routeParams,
            switchId: portData.switchMac,
            venueId: portData.venueId
          },
          enableRbac: isSwitchRbacEnabled
        })
        const lagData = lagList?.find((item: Lag) =>
          item.lagId?.toString() === portData.lagId) as Lag

        setLagDrawerParams({
          switchMac: portData.switchMac,
          serialNumber: portData.switchSerial
        })
        setEditLag([lagData])
        setEditPortDrawerVisible(false)
        setEditLagModalVisible(true)
      }

      const onEditPort = () => {
        setSelectedPorts([portData])
        setEditLagModalVisible(false)
        setEditPortDrawerVisible(true)
      }

      const onClickHandler = isLAGMemberPort(portData) ? onEditLag : onEditPort

      setSwitchPort(<Button type='link' onClick={onClickHandler} data-testid='portButton'>
        {currentAP?.switchPort} </Button>)
    }
  }

  useEffect(() => {
    if (currentAP?.switchId) {
      fetchSwitchDetails()
    }
  }, [currentAP])

  const onClose = () => {
    setVisible(false)
  }

  const displayAFCInfo = () => {

    //let displayContent = (<></>)
    const { supportTriRadio=false, isOutdoor=false } = apCapabilities ?? {}

    const enableAFC = apValidChannels?.afcEnabled
    const { apRadioDeploy, apStatusData } = currentAP ?? {}

    if ([AFC_Featureflag, supportTriRadio, enableAFC, (apRadioDeploy === '2-5-6')].every(Boolean)) {
      //displayContent = (<Descriptions.Item
      return (<Descriptions.Item
        label={$t({ defaultMessage: 'AFC Power State' })}
        children={
          APPropertiesAFCPowerStateRender(apStatusData?.afcInfo, apRadioDeploy, isOutdoor)
        }
      />)
    }

    return null
  }

  const poeClassDisplayMap = {
    'class 0': '802.3af 15.4 W',
    'class 1': '802.3af 4.0 W',
    'class 2': '802.3af 7.0 W',
    'class 3': '802.3af 15.4 W',
    'class 4': '802.3at 30 W',
    'class 5': '802.3bt 45 W',
    'class 6': '802.3bt 60 W',
    'class 7': '802.3bt 75 W',
    'class 8': '802.3bt 90 W'
  } as const

  const currentAPNeighbor = getApNeighborsStates.data?.neighbors?.find(
    (n: ApLldpNeighbor | ApRfNeighbor) => 'lldpPowerType' in n && n.lldpPowerType != null
  ) as ApLldpNeighbor
  const poeClass = currentAPNeighbor?.lldpClass
  const powerConsumption = currentAPNeighbor?.lldpPSEAllocPowerVal

  const getPoePortSpeed = (): string | undefined => {
    const poePortId = apCapabilities?.lanPorts
      ?.find(port => port.isPoePort)?.id

    const phyLink = (currentAP as ApViewModel).apStatusData?.lanPortStatus
      ?.find(item =>
        (parseInt(item.port, 10) + 1) === parseInt(poePortId as string, 10)
      )?.phyLink?.split(' ')[1]
    return phyLink
  }

  const getPoeClassDesc = (lldpClass: string | null | undefined): string => {
    if (!lldpClass) return '--'
    const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
    const mappedValue = poeClassDisplayMap[lldpClass as keyof typeof poeClassDisplayMap] || lldpClass
    const lldpClassCapitalized = capitalizeFirstLetter(lldpClass)
    return mappedValue ? `${lldpClassCapitalized} (${mappedValue})` : lldpClass
  }

  const getAllocPowerVal = (lldpPSEAllocPowerVal: string | null | undefined): string => {
    if (!lldpPSEAllocPowerVal) return '--'
    return `${Number(lldpPSEAllocPowerVal) / 1000} mW`
  }

  async function socketHandler () {
    try {
      await getApNeighbors({
        params: { serialNumber, venueId },
        payload: {
          filters: [{ type: NewApNeighborTypes.LLDP_NEIGHBOR }],
          page: 1,
          pageSize: 10000
        }
      }).unwrap()
    } catch (error) {
      handleApiError(error as CatchErrorResponse)
    }
  }

  const PropertiesTab = () => {
    return (<>
      <Descriptions labelWidthPercent={50}>
        <Descriptions.Item
          label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
          children={
            <TenantLink to={`/venues/${currentAP?.venueId}/venue-details/overview`}>
              {currentAP?.venueName}
            </TenantLink>
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'AP Group' })}
          children={
            currentAP?.deviceGroupName || $t({ defaultMessage: 'None' })
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Description' })}
          children={
            apDetails?.description || $t({ defaultMessage: 'None' })
          }
        />
        {/* <Descriptions.Item  TODO: Wait tags feature support
          label={$t({ defaultMessage: 'Tags:' })}
          children={
            currentAP?.tags || '--'
          }
        /> */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'GPS Coordinates' })}
          children={
            getGpsFieldStatus(apDetails.deviceGps as DeviceGps, currentAP.venueId)
          }
        />
      </Descriptions>
      <Divider/>
      <Descriptions labelWidthPercent={50}>
        {
          (userProfile?.support || userProfile?.var || userProfile?.dogfood) && apPassword &&
          <Descriptions.Item
            label={$t({ defaultMessage: 'Admin Password' })}
            children={<UI.DetailsPassword>
              <PasswordInput
                readOnly
                bordered={false}
                value={apPassword}
              />
            </UI.DetailsPassword>}
          />
        }
        <Descriptions.Item
          label={$t({ defaultMessage: 'S/N' })}
          children={
            currentAP?.serialNumber || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'MAC Address' })}
          children={
            (currentAP?.apMac && (currentAP?.apMac !== currentAP?.serialNumber)) ? currentAP.apMac : '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={
            (currentAP?.IP)? `${currentAP.IP}${ipTypeDisplay}` : '--'
          }
        />
        { includes(ipTypeDisplay, 'Static') && (
          <>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Network Mask' })}
              children={
                APSystem?.netmask || '--'
              }
            />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Gateway' })}
              children={
                APSystem?.gateway || '--'
              }
            />
          </>
        )}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Primary DNS' })}
          children={
            APSystem?.primaryDnsServer || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Secondary DNS' })}
          children={
            APSystem?.secondaryDnsServer || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Ext. IP Address' })}
          children={
            currentAP?.extIp || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Model' })}
          children={
            currentAP?.model || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Type' })}
          children={
            currentAP?.deviceModelType || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Version' })}
          children={
            currentAP?.fwVersion || '--'
          }
        />
        {displayAFCInfo()}
      </Descriptions>
      {
        currentAP?.isMeshEnable && (
          <>
            <Divider/>
            <Descriptions labelWidthPercent={50}>
              <Descriptions.Item
                label={$t({ defaultMessage: 'Mesh Role' })}
                children={
                  currentAP?.meshRole ?
                    (currentAP.meshRole === 'DISABLED' || currentAP.meshRole === 'DOWN') ? currentAP.meshRole :
                      currentAP.meshRole + $t({ defaultMessage: ' ({hops} hop)' }, { hops: currentAP.hops }) :
                    $t({ defaultMessage: 'AP' })
                }
              />
              { currentAP?.rootAP?.name &&
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Root AP' })}
                  children={
                    <TenantLink to={`/devices/wifi/${currentAP.rootAP.serialNumber}/details/overview`}>
                      {currentAP.rootAP.name}
                    </TenantLink>
                  }
                />
              }
              {
                currentAP?.apDownRssi &&
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Signal to previous hop' })}
                  children={
                    currentAP?.apDownRssi
                  }
                />
              }
              {
                currentAP?.apUpRssi &&
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Signal from previous hop' })}
                  children={
                    currentAP?.apUpRssi
                  }
                />
              }
            </Descriptions>
          </>
        )
      }
      {
        <>
          <Divider/>
          <Descriptions labelWidthPercent={50}>
            { isSwitchAPPortLinkEnabled && switchPort && (
              <Descriptions.Item
                label={$t({ defaultMessage: 'Switch Port' })}
                children={switchPort}
              />
            )}
            {
              isDisplayMoreApPoePropertiesEnabled && (
                <><Descriptions.Item
                  label={$t({ defaultMessage: 'PoE Port Speed' })}
                  children={getPoePortSpeed()} /><Descriptions.Item
                  label={$t({ defaultMessage: 'PoE Class' })}
                  children={getPoeClassDesc(poeClass)} /><Descriptions.Item
                  label={$t({ defaultMessage: 'Power Consumption' })}
                  children={getAllocPowerVal(powerConsumption)} />
                </>
              )}
          </Descriptions>
        </>
      }
      {
        currentAP.deviceStatusSeverity === ApVenueStatusEnum.OPERATIONAL &&
        <>
          <Divider/>
          <Descriptions labelWidthPercent={50}>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Uptime' })}
              children={currentAP?.uptime}
            />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Last Seen' })}
              children={currentAP?.lastSeenTime}
            />
          </Descriptions>
        </>
      }
      {
        currentCellularInfo &&
         <>
           <Divider/>
           <ApCellularProperties currentCellularInfo={currentCellularInfo} currentAP={currentAP} />
         </>
      }
    </>)
  }

  const getGpsFieldStatus = (deviceGps: DeviceGps, venueId: string) => {
    if (deviceGps?.latitude && deviceGps?.longitude) {
      return deviceGps.latitude+ ', ' + deviceGps.longitude
    } else if (venueId) {
      const latitude = gpsToFixed(venueData?.address.latitude)
      const longitude = gpsToFixed(venueData?.address.longitude)
      return <>{ latitude + ', ' + longitude } <br/> {$t({ defaultMessage: '(As <venueSingular></venueSingular>)' }) }</>
    } else {
      return '--'
    }
  }

  return (
    <><Drawer
      title={$t({ defaultMessage: 'AP Properties' })}
      visible={visible}
      onClose={onClose}
      children={<PropertiesTab />}
      width={'400px'}
    />
    {editLagModalVisible && <SwitchLagModal
      isEditMode={true}
      editData={editLag}
      visible={editLagModalVisible}
      setVisible={setEditLagModalVisible}
      params={lagDrawerParams}
      type='drawer'
    />}
    {editPortDrawerVisible && <EditPortDrawer
      key='edit-port'
      visible={editPortDrawerVisible}
      setDrawerVisible={setEditPortDrawerVisible}
      isCloudPort={selectedPorts.map(item => item.cloudPort).includes(true)}
      isMultipleEdit={selectedPorts?.length > 1}
      isVenueLevel={false}
      selectedPorts={selectedPorts}
      switchList={switchList?.data as SwitchRow[]}
      authProfiles={authenticationProfiles}
    />
    }
    </>
  )
}


