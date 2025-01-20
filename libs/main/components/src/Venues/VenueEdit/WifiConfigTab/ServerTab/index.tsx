import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy }                                  from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }         from '@acx-ui/feature-toggle'
import { useIsConfigTemplateEnabledByType, usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import { ConfigTemplateType, redirectPreviousPage, useConfigTemplate }    from '@acx-ui/rc/utils'
import { useNavigate }                                                    from '@acx-ui/react-router-dom'

import { VenueEditContext, createAnchorSectionItem } from '../..'

import { ApSnmp }               from './ApSnmp'
import { IotController }        from './IotController'
import { LocationBasedService } from './LocationBasedService'
import { MdnsFencing }          from './MdnsFencing/MdnsFencing'
import { Syslog }               from './Syslog'

export interface ServerSettingContext {
  updateSyslog?: (() => void),
  discardSyslog?: (() => void),
  updateMdnsFencing?: (() => void),
  discardMdnsFencing?: (() => void),
  updateVenueApSnmp?: (() => void),
  discardVenueApSnmp?: (() => void),
  updateVenueIot?: (() => void),
  discardVenueIot?: (() => void),
  updateVenueLbs?: (() => void),
  discardVenueLbs?: (() => void)
}

export function ServerTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')
  const { isTemplate } = useConfigTemplate()
  const isSyslogTemplateEnabled = useIsConfigTemplateEnabledByType(ConfigTemplateType.SYSLOG)
  const isLbsFeatureEnabled = useIsSplitOn(Features.WIFI_EDA_LBS_TOGGLE)
  const isLbsFeatureTierAllowed = useIsTierAllowed(TierFeatures.LOCATION_BASED_SERVICES)
  const supportLbs = isLbsFeatureEnabled && isLbsFeatureTierAllowed
  const isIotFeatureEnabled = useIsSplitOn(Features.IOT_MQTT_BROKER_TOGGLE)

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)

  const items = []

  if (!isTemplate || isSyslogTemplateEnabled) {
    // eslint-disable-next-line max-len
    items.push(createAnchorSectionItem($t({ defaultMessage: 'Syslog Server' }), 'syslog-server', <Syslog />))
  }

  // eslint-disable-next-line max-len
  items.push(createAnchorSectionItem($t({ defaultMessage: 'mDNS Fencing' }), 'mdns-fencing', <MdnsFencing />))

  if (!isTemplate) {
    items.push(createAnchorSectionItem($t({ defaultMessage: 'AP SNMP' }), 'ap-snmp', <ApSnmp />))
  }

  if (isIotFeatureEnabled && !isTemplate) {
    // eslint-disable-next-line max-len
    items.push(createAnchorSectionItem($t({ defaultMessage: 'IoT Controller' }), 'iotController', <IotController />))
  }

  if (supportLbs && !isTemplate) {
    // eslint-disable-next-line max-len
    items.push(createAnchorSectionItem($t({ defaultMessage: 'Location Based Service' }), 'locationBasedService', <LocationBasedService />))
  }

  const handleUpdateSetting = async () => {
    try {
      await editServerContextData?.updateSyslog?.()
      await editServerContextData?.updateMdnsFencing?.()
      await editServerContextData?.updateVenueApSnmp?.()
      await editServerContextData?.updateVenueIot?.()
      await editServerContextData?.updateVenueLbs?.()

      setEditContextData({
        ...editContextData,
        isDirty: false
      })

      // clear update functions avoid to be trigger again
      if (editServerContextData) {
        const newData = { ...editServerContextData }
        delete newData.updateSyslog
        delete newData.updateMdnsFencing
        delete newData.updateVenueApSnmp
        delete newData.updateVenueIot
        delete newData.updateVenueLbs

        setEditServerContextData(newData)
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={handleUpdateSetting}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={items} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
