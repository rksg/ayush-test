import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsForm }    from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { redirectPreviousPage }       from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../'

import { ApSnmp }         from './ApSnmp'
import { BonjourFencing } from './BonjourFencing/BonjourFencing'
import { Syslog }         from './Syslog'

export interface ServerSettingContext {
  updateSyslog: (() => void),
  discardSyslog: (() => void),
  updateBonjourFencing: (() => void),
  discardBonjourFencing: (() => void),
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

  const supportBonjourFencing = useIsSplitOn(Features.BONJOUR_FENCING)
  const supportApSnmp = useIsSplitOn(Features.AP_SNMP)

  const items = [{
    title: $t({ defaultMessage: 'Syslog Server' }),
    content: <>
      <StepsForm.SectionTitle id='syslog-server'>
        { $t({ defaultMessage: 'Syslog Server' }) }
      </StepsForm.SectionTitle>
      <Syslog />
    </>
  }]

  if (supportBonjourFencing) {
    items.push({
      title: $t({ defaultMessage: 'mDNS Fencing' }),
      content: <>
        <StepsForm.SectionTitle id='bonjour-fencing'>
          { $t({ defaultMessage: 'mDNS Fencing' }) }
        </StepsForm.SectionTitle>
        <BonjourFencing />
      </>
    })
  }

  if (supportApSnmp) {
    items.push({
      title: $t({ defaultMessage: 'AP SNMP' }),
      content: <>
        <StepsForm.SectionTitle id='ap-snmp'>
          { $t({ defaultMessage: 'AP SNMP' }) }
        </StepsForm.SectionTitle>
        <ApSnmp/>
      </>
    })
  }


  const handleUpdateSetting = async () => {
    try {
      await editServerContextData?.updateSyslog?.()
      await editServerContextData?.updateBonjourFencing?.()
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
    <StepsForm
      onFinish={handleUpdateSetting}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <AnchorLayout items={items} offsetTop={275} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}
