import { useContext, useEffect, useState } from 'react'

import { Button, Space, Tooltip } from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { AnchorLayout, StepsFormLegacy }          from '@acx-ui/components'
import { useIsSplitOn, Features }                 from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }             from '@acx-ui/icons'
import { redirectPreviousPage, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { useTenantLink }                          from '@acx-ui/react-router-dom'
import { hasAllowedOperations }                   from '@acx-ui/user'
import { directedMulticastInfo, getOpsApi }       from '@acx-ui/utils'

import { ApDataContext, ApEditContext } from '..'

import { DirectedMulticast } from './DirectedMulticast'
import { IpSettings }        from './IpSettings/IpSettings'
import { LanPorts }          from './LanPorts'
import { ApMesh }            from './Mesh'
import { SmartMonitor }      from './SmartMonitor'

export interface ApNetworkingContext {
  updateIpSettings?: (data?: unknown) => void | Promise<void>
  discardIpSettingsChanges?: (data?: unknown) => void | Promise<void>

  updateLanPorts?: (data?: unknown) => void | Promise<void>
  discardLanPortsChanges?: (data?: unknown) => void | Promise<void>

  updateMesh?: (data?: unknown) => void | Promise<void>
  discardMeshChanges?: (data?: unknown) => void | Promise<void>

  updateDirectedMulticast?: (data?: unknown) => void | Promise<void>
  discardDirectedMulticastChanges?: (data?: unknown) => void | Promise<void>

  updateSmartMonitor?: (data?: unknown) => void | Promise<void>
  discardSmartMonitorChanges?: (data?: unknown) => void | Promise<void>
}

export function NetworkingTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const isSmartMonitorFFEnabled = useIsSplitOn(Features.WIFI_SMART_MONITOR_DISABLE_WLAN_TOGGLE)
  const supportR370 = useIsSplitOn(Features.WIFI_R370_TOGGLE)

  const [
    isAllowEditIpSettings,
    isAllowEditLanPort,
    isAllowEditMesh,
    isAllowEditDMulticast,
    isAllowEditSmartMonitor
  ] = [
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApNetworkSettings)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApLanPorts)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApMeshSettings)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApDirectedMulticast)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApSmartMonitor)])
  ]

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApEditContext)

  const { apCapabilities } = useContext(ApDataContext)

  const [isSupportMesh, setIsSupportMesh] = useState(false)
  const [isSupportSmartMonitor, setIsSupportSmartMonitor] = useState(false)

  useEffect(() => {
    if (apCapabilities) {
      setIsSupportMesh(!!(apCapabilities?.supportMesh))
      setIsSupportSmartMonitor(!!(apCapabilities?.supportSmartMonitor))
    }
  }, [apCapabilities])

  const ipSettingTitle = $t({ defaultMessage: 'IP Settings' })
  const lanPortsTitle = $t({ defaultMessage: 'LAN Ports' })
  const meshTitle = $t({ defaultMessage: 'Mesh' })
  const direcedtMulticastTitle = $t({ defaultMessage: 'Directed Multicast' })
  const smartMonitorTitle = $t({ defaultMessage: 'Smart Monitor' })

  const anchorItems = [
    {
      title: ipSettingTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='ip-settings'>
            { ipSettingTitle }
          </StepsFormLegacy.SectionTitle>
          <IpSettings isAllowEdit={isAllowEditIpSettings} />
        </>
      )
    },
    {
      title: lanPortsTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='lan-ports'>
            { lanPortsTitle }
          </StepsFormLegacy.SectionTitle>
          <LanPorts isAllowEdit={isAllowEditLanPort} />
        </>
      )
    },
    ...(isSupportMesh? [{
      title: meshTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='mesh'>
            { meshTitle }
          </StepsFormLegacy.SectionTitle>
          <ApMesh isAllowEdit={isAllowEditMesh} />
        </>
      )

    }] : []),
    {
      title: direcedtMulticastTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='directed-multicast'>
            {<Space align='baseline'>
              { direcedtMulticastTitle }
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
        </>
      )
    },
    ...((isSmartMonitorFFEnabled && (!supportR370 || isSupportSmartMonitor)) ? [{
      title: smartMonitorTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='smart-monitor'>
            { smartMonitorTitle }
          </StepsFormLegacy.SectionTitle>
          <SmartMonitor isAllowEdit={isAllowEditSmartMonitor} />
        </>
      )
    }] : [])
  ]

  const resetEditContextData = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networking',
      isDirty: false
    })

    if (editNetworkingContextData) {
      const newData = { ...editNetworkingContextData }
      delete newData.updateIpSettings
      delete newData.discardIpSettingsChanges
      delete newData.updateLanPorts
      delete newData.discardLanPortsChanges
      delete newData.updateMesh
      delete newData.discardMeshChanges
      delete newData.updateDirectedMulticast
      delete newData.discardDirectedMulticastChanges
      delete newData.updateSmartMonitor
      delete newData.discardSmartMonitorChanges

      setEditNetworkingContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {

    try {
      await editNetworkingContextData.updateIpSettings?.()
      await editNetworkingContextData.updateLanPorts?.()
      await editNetworkingContextData.updateMesh?.()
      await editNetworkingContextData.updateDirectedMulticast?.()
      await editNetworkingContextData.updateSmartMonitor?.()

      resetEditContextData()

      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/wifi/${params.serialNumber}/details/overview`
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscardChanges = async () => {
    try {
      await editNetworkingContextData.discardIpSettingsChanges?.()
      await editNetworkingContextData.discardLanPortsChanges?.()
      await editNetworkingContextData.discardMeshChanges?.()
      await editNetworkingContextData.discardDirectedMulticastChanges?.()
      await editNetworkingContextData.discardSmartMonitorChanges?.()

      resetEditContextData()

      redirectPreviousPage(navigate, previousPath, basePath)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() => handleDiscardChanges()}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )

}
