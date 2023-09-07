import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { redirectPreviousPage }          from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }    from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../'

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
  const basePath = useTenantLink('/venues/')

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editServerContextData
  } = useContext(VenueEditContext)

  const supportMdnsFencing = useIsSplitOn(Features.MDNS_FENCING)
  const supportApSnmp = useIsSplitOn(Features.AP_SNMP)

  const items = [{
    title: $t({ defaultMessage: 'Syslog Server' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='syslog-server'>
        { $t({ defaultMessage: 'Syslog Server' }) }
      </StepsFormLegacy.SectionTitle>
      <Syslog />
    </>
  }]

  if (supportMdnsFencing) {
    items.push({
      title: $t({ defaultMessage: 'mDNS Fencing' }),
      content: <>
        <StepsFormLegacy.SectionTitle id='mdns-fencing'>
          { $t({ defaultMessage: 'mDNS Fencing' }) }
        </StepsFormLegacy.SectionTitle>
        <MdnsFencing />
      </>
    })
  }

  if (supportApSnmp) {
    items.push({
      title: $t({ defaultMessage: 'AP SNMP' }),
      content: <>
        <StepsFormLegacy.SectionTitle id='ap-snmp'>
          { $t({ defaultMessage: 'AP SNMP' }) }
        </StepsFormLegacy.SectionTitle>
        <ApSnmp/>
      </>
    })
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
        <AnchorLayout items={items} offsetTop={113} />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
