import { useContext, useEffect, useState } from 'react'

import { Button, Space, Tooltip } from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { AnchorLayout, StepsFormLegacy }                          from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                             from '@acx-ui/icons'
import { redirectPreviousPage }                                   from '@acx-ui/rc/utils'
import { useTenantLink }                                          from '@acx-ui/react-router-dom'
import { directedMulticastInfo }                                  from '@acx-ui/utils'

import { ApDataContext, ApEditContext } from '..'

import { DirectedMulticast } from './DirectedMulticast'
import { IpSettings }        from './IpSettings/IpSettings'
import { LanPorts }          from './LanPorts'
import { ApMesh }            from './Mesh'

export interface ApNetworkingContext {
  updateIpSettings?: (data?: unknown) => void | Promise<void>
  discardIpSettingsChanges?: (data?: unknown) => void | Promise<void>

  updateLanPorts?: (data?: unknown) => void | Promise<void>
  discardLanPortsChanges?: (data?: unknown) => void | Promise<void>

  updateMesh?: (data?: unknown) => void | Promise<void>
  discardMeshChanges?: (data?: unknown) => void | Promise<void>

  updateDirectedMulticast?: (data?: unknown) => void | Promise<void>
  discardDirectedMulticastChanges?: (data?: unknown) => void | Promise<void>
}

export function NetworkingTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApEditContext)

  const { apCapabilities } = useContext(ApDataContext)

  const supportStaticIpSettings = useIsSplitOn(Features.AP_STATIC_IP)
  const isTierAllowMeshEnhancement = useIsTierAllowed(TierFeatures.BETA_MESH)
  const isFeatureOnMeshEnhancement = useIsSplitOn(Features.MESH_ENHANCEMENTS)
  const supportMeshEnhancement = isTierAllowMeshEnhancement && isFeatureOnMeshEnhancement
  const supportDirectedMulticast = useIsSplitOn(Features.DIRECTED_MULTICAST)

  const [isSupportMesh, setIsSupportMesh] = useState(false)

  useEffect(() => {
    if (apCapabilities) {
      setIsSupportMesh(!!(apCapabilities?.supportMesh))
    }
  }, [apCapabilities])

  const ipSettingTitle = $t({ defaultMessage: 'IP Settings' })
  const lanPortsTitle = $t({ defaultMessage: 'LAN Ports' })
  const meshTitle = $t({ defaultMessage: 'Mesh' })
  const direcedtMulticastTitle = $t({ defaultMessage: 'Directed Multicast' })

  const anchorItems = [
    ...(supportStaticIpSettings? [{
      title: ipSettingTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='ip-settings'>
            { ipSettingTitle }
          </StepsFormLegacy.SectionTitle>
          <IpSettings />
        </>
      )
    }] : []),
    {
      title: lanPortsTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='lan-ports'>
            { lanPortsTitle }
          </StepsFormLegacy.SectionTitle>
          <LanPorts />
        </>
      )
    },
    ...((supportMeshEnhancement && isSupportMesh)? [{
      title: meshTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='mesh'>
            { meshTitle }
          </StepsFormLegacy.SectionTitle>
          <ApMesh />
        </>
      )

    }] : []),
    ...(supportDirectedMulticast? [{
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
          <DirectedMulticast />
        </>
      )
    }]: [])
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

      setEditNetworkingContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {

    try {
      await editNetworkingContextData.updateIpSettings?.()
      await editNetworkingContextData.updateLanPorts?.()
      await editNetworkingContextData.updateMesh?.()
      await editNetworkingContextData.updateDirectedMulticast?.()

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
        <AnchorLayout items={anchorItems} offsetTop={275} />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )

}
