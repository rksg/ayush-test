import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { AnchorLayout, StepsFormLegacy } from '@acx-ui/components'
import { useIsSplitOn, Features }        from '@acx-ui/feature-toggle'
import {
  ApSnmpRbacUrls,
  MdnsProxyUrls,
  redirectPreviousPage,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useTenantLink }        from '@acx-ui/react-router-dom'
import { hasAllowedOperations } from '@acx-ui/user'
import { getOpsApi }            from '@acx-ui/utils'

import { ApDataContext, ApEditContext } from '..'

import { ApSnmp }          from './ApSnmp'
import { IotController }   from './IotContoller'
import { IotControllerV2 } from './IotControllerV2'
import { MdnsProxy }       from './MdnsProxy/MdnsProxy'




export interface ApNetworkControlContext {
  updateMdnsProxy?: (data?: unknown) => void | Promise<void>
  discardMdnsProxyChanges?: (data?: unknown) => void | Promise<void>

  updateApSnmp?: (data?: unknown) => void | Promise<void>
  discardApSnmpChanges?: (data?: unknown) => void | Promise<void>

  updateApIot?: (data?: unknown) => void | Promise<void>
  discardApIotChanges?: (data?: unknown) => void | Promise<void>
}

export function NetworkControlTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const isIotFeatureEnabled = useIsSplitOn(Features.IOT_MQTT_BROKER_TOGGLE)
  const isIotV2Enabled = useIsSplitOn(Features.IOT_PHASE_2_TOGGLE)

  const activateMdnsProxyApiInfo = MdnsProxyUrls.addMdnsProxyApsRbac
  const deactivateMdnsProxyApiInfo = MdnsProxyUrls.deleteMdnsProxyApsRbac

  const [
    isAllowEditMdnsPorxy,
    isAllowEditApSnmp,
    isAllowEditApIot
  ] = [
    // eslint-disable-next-line max-len
    hasAllowedOperations([[getOpsApi(activateMdnsProxyApiInfo), getOpsApi(deactivateMdnsProxyApiInfo)]]),
    hasAllowedOperations([getOpsApi(ApSnmpRbacUrls.updateApSnmpSettings)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApIot)])
  ]

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData
  } = useContext(ApEditContext)

  const mPorxyTitle = $t({ defaultMessage: 'mDNS Proxy' })
  const apSnmpTitle = $t({ defaultMessage: 'AP SNMP' })
  const apIotTitle = $t({ defaultMessage: 'IoT Controller' })

  const { apCapabilities } = useContext(ApDataContext)
  const isSupportIoT = apCapabilities?.supportIoT ?? false

  const anchorItems = [
    {
      title: mPorxyTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle>
            { mPorxyTitle }
          </StepsFormLegacy.SectionTitle>
          <MdnsProxy isAllowEdit={isAllowEditMdnsPorxy} />
        </>
      )
    },
    {
      title: apSnmpTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle>
            { apSnmpTitle }
          </StepsFormLegacy.SectionTitle>
          <ApSnmp isAllowEdit={isAllowEditApSnmp} />
        </>
      )
    },
    ...((isIotFeatureEnabled && isSupportIoT && !isIotV2Enabled) ? [{
      title: apIotTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle>
            { apIotTitle }
          </StepsFormLegacy.SectionTitle>
          <IotController isAllowEdit={isAllowEditApIot} />
        </>
      )
    }]: []),
    ...((isIotFeatureEnabled && isSupportIoT && isIotV2Enabled) ? [{
      title: apIotTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle>
            { apIotTitle }
          </StepsFormLegacy.SectionTitle>
          <IotControllerV2 isAllowEdit={isAllowEditApIot} />
        </>
      )
    }]: [])
  ]

  const resetEditContextData = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networkControl',
      isDirty: false
    })

    if (editNetworkControlContextData) {
      const newData = { ...editNetworkControlContextData }
      delete newData.updateMdnsProxy
      delete newData.discardMdnsProxyChanges
      delete newData.updateApSnmp
      delete newData.discardApSnmpChanges
      delete newData.updateApIot
      delete newData.discardApIotChanges

      setEditNetworkControlContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {

    try {
      await editNetworkControlContextData.updateMdnsProxy?.()
      await editNetworkControlContextData.updateApSnmp?.()
      await editNetworkControlContextData.updateApIot?.()

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
      await editNetworkControlContextData.discardMdnsProxyChanges?.()
      await editNetworkControlContextData.discardApSnmpChanges?.()
      await editNetworkControlContextData.discardApIotChanges?.()

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
