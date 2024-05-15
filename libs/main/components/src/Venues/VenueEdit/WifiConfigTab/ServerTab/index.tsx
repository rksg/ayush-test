import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { useIsConfigTemplateEnabledByType, usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import { ConfigTemplateType, redirectPreviousPage, useConfigTemplate }    from '@acx-ui/rc/utils'
import { useNavigate }                                                    from '@acx-ui/react-router-dom'

import { VenueEditContext, createAnchorSectionItem } from '../..'

import { ApSnmp }      from './ApSnmp'
import { MdnsFencing } from './MdnsFencing/MdnsFencing'
import { Syslog }      from './Syslog'

export interface ServerSettingContext {
  updateSyslog: (() => void),
  discardSyslog: (() => void),
  updateMdnsFencing: (() => void),
  discardMdnsFencing: (() => void),
  updateVenueApSnmp: (() => void),
  discardVenueApSnmp: (() => void),
}

export function ServerTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')
  const { isTemplate } = useConfigTemplate()
  const isSyslogTemplateEnabled = useIsConfigTemplateEnabledByType(ConfigTemplateType.SYSLOG)

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editServerContextData
  } = useContext(VenueEditContext)

  const supportMdnsFencing = useIsSplitOn(Features.MDNS_FENCING)

  const items = []

  if (!isTemplate || isSyslogTemplateEnabled) {
    // eslint-disable-next-line max-len
    items.push(createAnchorSectionItem($t({ defaultMessage: 'Syslog Server' }), 'syslog-server', <Syslog />))
  }

  if (supportMdnsFencing) {
    // eslint-disable-next-line max-len
    items.push(createAnchorSectionItem($t({ defaultMessage: 'mDNS Fencing' }), 'mdns-fencing', <MdnsFencing />))
  }

  if (!isTemplate) {
    items.push(createAnchorSectionItem($t({ defaultMessage: 'AP SNMP' }), 'ap-snmp', <ApSnmp />))
  }


  const handleUpdateSetting = async () => {
    try {
      await editServerContextData?.updateSyslog?.()
      await editServerContextData?.updateMdnsFencing?.()
      await editServerContextData?.updateVenueApSnmp?.()


      setEditContextData({
        ...editContextData,
        isDirty: false
      })
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
