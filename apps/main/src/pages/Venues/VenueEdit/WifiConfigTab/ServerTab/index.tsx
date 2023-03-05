import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm }    from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../'

import { BonjourFencing } from './BonjourFencing/BonjourFencing'
import { Syslog }         from './Syslog'

export interface ServerSettingContext {
  updateSyslog: (() => void),
  discardSyslog: (() => void),
  updateBonjourFencing: (() => void),
  discardBonjourFencing: (() => void)
}

export function ServerTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { venueId } = params
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')

  const {
    editContextData,
    setEditContextData,
    editServerContextData
  } = useContext(VenueEditContext)

  const supportBonjourFencing = useIsSplitOn(Features.BONJOUR_FENCING)
  //const supportApSnmp = useIsSplitOn(Features.AP_SNMP)

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
      title: $t({ defaultMessage: 'Bonjour Fencing' }),
      content: <>
        <StepsForm.SectionTitle id='bonjour-fencing'>
          { $t({ defaultMessage: 'Bonjour Fencing' }) }
        </StepsForm.SectionTitle>
        <BonjourFencing />
      </>
    })
  }
  /*
  if (supportApSnmp) {
    items.push({
      title: $t({ defaultMessage: 'AP SNMP' }),
      content: <>
        <StepsForm.SectionTitle id='ap-snmp'>
          { $t({ defaultMessage: 'AP SNMP' }) }
        </StepsForm.SectionTitle>
        <div>AP SNMP</div>
      </>
    })
  }
  */

  const handleUpdateSetting = async () => {
    try {
      await editServerContextData?.updateSyslog?.()
      await editServerContextData?.updateBonjourFencing?.()

      setEditContextData({
        ...editContextData,
        isDirty: false
      })

    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <StepsForm
      onFinish={handleUpdateSetting}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
      })}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <AnchorLayout items={items} offsetTop={275} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}
