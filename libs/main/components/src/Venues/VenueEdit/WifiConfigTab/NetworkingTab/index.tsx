import { useContext, useEffect, useState } from 'react'

import { Button, Space } from 'antd'
import { isEmpty }       from 'lodash'
import { useIntl }       from 'react-intl'

import { AnchorLayout, StepsFormLegacy, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                      from '@acx-ui/icons'
import { useEnforcedStatus, usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import { useLazyApListQuery }                              from '@acx-ui/rc/services'
import {
  VenueApModelCellular,
  redirectPreviousPage,
  WifiRbacUrlsInfo,
  VenueConfigTemplateUrlsInfo,
  useConfigTemplate,
  ConfigTemplateType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }   from '@acx-ui/user'
import {
  directedMulticastInfo,
  getOpsApi
} from '@acx-ui/utils'

import { VenueUtilityContext }                  from '..'
import { useVenueConfigTemplateOpsApiSwitcher } from '../../../venueConfigTemplateApiSwitcher'
import { VenueEditContext }                     from '../../index'

import { CellularOptionsForm } from './CellularOptions/CellularOptionsForm'
import { DirectedMulticast }   from './DirectedMulticast'
import { LanPorts }            from './LanPorts'
import { MeshNetwork }         from './MeshNetwork'
import { RadiusOptions }       from './RadiusOptions'
import { SmartMonitor }        from './SmartMonitor'


export interface NetworkingSettingContext {
  cellularData: VenueApModelCellular,
  updateCellular?: ((cellularData: VenueApModelCellular) => void),
  updateMesh?: (() => void),
  updateDirectedMulticast?: (() => void),
  updateLanPorts?: (() => void),
  discardLanPorts?: (() => void),
  updateRadiusOptions?: (() => void),
  updateSmartMonitor?: (() => void)
}

export function NetworkingTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')
  const { tenantId, venueId } = useParams()
  const { isTemplate } = useConfigTemplate()

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isSmartMonitorFFEnabled = useIsSplitOn(Features.WIFI_SMART_MONITOR_DISABLE_WLAN_TOGGLE)
  const isLegacyLanPortEnabled = useIsSplitOn(Features.LEGACY_ETHERNET_PORT_TOGGLE)
  const isEthernetPortTemplate = useIsSplitOn(Features.ETHERNET_PORT_TEMPLATE_TOGGLE)
  const isShowLanPortSettings = !isTemplate || isEthernetPortTemplate || isLegacyLanPortEnabled

  const [hasCellularAps, setHasCellularAps] = useState(false)

  const { venueApCaps } = useContext(VenueUtilityContext)

  const [ getApList ] = useLazyApListQuery()
  const { getEnforcedStepsFormProps } = useEnforcedStatus(ConfigTemplateType.VENUE)

  useEffect(() => {
    if (venueApCaps) {
      let apModels = venueApCaps.apModels
        .filter(apCapability => apCapability.canSupportCellular === true)
        .map(apCapability => apCapability.model) as string[]

      const cellurlarApModelNames = isEmpty(apModels)? ['M510'] : apModels
      let filters = { model: cellurlarApModelNames, venueId: [venueId] }

      const payload = {
        fields: ['name', 'model', 'venueId', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC',
        filters
      }

      if (getApList) {
        getApList({
          params: { tenantId },
          payload,
          enableRbac: isWifiRbacEnabled
        }, true).unwrap().then((res) => {
          const { data } = res || {}
          setHasCellularAps(!!(data?.length > 0))
        })
      }
    }
  }, [venueApCaps])

  const lanPortOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueLanPorts,
    VenueConfigTemplateUrlsInfo.updateVenueLanPortsRbac
  )
  const meshOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueMesh,
    VenueConfigTemplateUrlsInfo.updateVenueMeshRbac
  )
  const dMulticastOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueMesh,
    VenueConfigTemplateUrlsInfo.updateVenueMeshRbac
  )
  const smartMonitorOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueSmartMonitor,
    VenueConfigTemplateUrlsInfo.updateVenueApSmartMonitorSettings
  )
  const radiusOptionsOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueRadiusOptions,
    VenueConfigTemplateUrlsInfo.updateVenueRadiusOptionsRbac
  )

  const [
    isAllowEditLanPort,
    isAllowEditMesh,
    isAllowEditDMulticast,
    isAllowEditCellular,
    isAllowEditSmartMonitor,
    isAllowEditRADIUSOptions
  ] = [
    hasAllowedOperations([lanPortOpsApi]),
    hasAllowedOperations([meshOpsApi]),
    hasAllowedOperations([dMulticastOpsApi]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateVenueCellularSettings)]),
    hasAllowedOperations([smartMonitorOpsApi]),
    hasAllowedOperations([radiusOptionsOpsApi])
  ]

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)

  const items = [...(isShowLanPortSettings ? [{
    title: $t({ defaultMessage: 'LAN Ports' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='lan-ports'>
        { $t({ defaultMessage: 'LAN Ports' }) }
      </StepsFormLegacy.SectionTitle>
      <LanPorts isAllowEdit={isAllowEditLanPort}/>
    </>
  }] : []), {
    title: $t({ defaultMessage: 'Mesh Network' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='mesh-network'>
        { $t({ defaultMessage: 'Mesh Network' }) }
      </StepsFormLegacy.SectionTitle>
      <MeshNetwork isAllowEdit={isAllowEditMesh}/>
    </>
  },
  {
    title: $t({ defaultMessage: 'Directed Multicast' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='directed-multicast'>
        {<Space align='baseline'>
          { $t({ defaultMessage: 'Directed Multicast' }) }
          <Tooltip
            title={$t( directedMulticastInfo )}
            placement='right'>
            <Button type='text'
              style={{ height: '18px', width: '18px' }}
              icon={
                <QuestionMarkCircleOutlined style={{ height: 'inherit', width: 'inherit' }}/>}
            />
          </Tooltip>
        </Space>
        }
      </StepsFormLegacy.SectionTitle>
      <DirectedMulticast isAllowEdit={isAllowEditDMulticast} />
    </> },
  ...(hasCellularAps? [{
    title: $t({ defaultMessage: 'Cellular Options' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='cellular-options'>
        { $t({ defaultMessage: 'Cellular Options' }) }
      </StepsFormLegacy.SectionTitle>
      <CellularOptionsForm isAllowEdit={isAllowEditCellular} />
    </> }] : []),
  ...(isSmartMonitorFFEnabled? [{
    title: $t({ defaultMessage: 'Smart Monitor' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='smart-monitor'>
        { $t({ defaultMessage: 'Smart Monitor' }) }
      </StepsFormLegacy.SectionTitle>
      <SmartMonitor isAllowEdit={isAllowEditSmartMonitor} />
    </> }] : []),
  {
    title: $t({ defaultMessage: 'RADIUS Options' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='radius-options'>
        { $t({ defaultMessage: 'RADIUS Options' }) }
      </StepsFormLegacy.SectionTitle>
      <RadiusOptions isAllowEdit={isAllowEditRADIUSOptions} />
    </>
  }]

  const handleUpdateAllSettings = async () => {
    try {
      await editNetworkingContextData?.updateLanPorts?.()
      await editNetworkingContextData?.updateCellular?.(editNetworkingContextData.cellularData)
      await editNetworkingContextData?.updateMesh?.()
      await editNetworkingContextData?.updateDirectedMulticast?.()
      await editNetworkingContextData?.updateRadiusOptions?.()
      await editNetworkingContextData?.updateSmartMonitor?.()

      setEditContextData?.({
        ...editContextData,
        unsavedTabKey: 'networking',
        isDirty: false
      })

      // clear update functions avoid to be trigger again
      if (editNetworkingContextData) {
        const newData = { ...editNetworkingContextData }
        delete newData.updateLanPorts
        delete newData.updateCellular
        delete newData.updateMesh
        delete newData.updateDirectedMulticast
        delete newData.updateRadiusOptions
        delete newData.updateSmartMonitor

        setEditNetworkingContextData(newData)
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={handleUpdateAllSettings}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      {...getEnforcedStepsFormProps('StepsFormLegacy')}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={items} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
