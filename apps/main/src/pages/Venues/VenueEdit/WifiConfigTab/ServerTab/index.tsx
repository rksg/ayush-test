import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm }    from '@acx-ui/components'
import { useHasRoles }                           from '@acx-ui/rbac'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../'

import { Syslog } from './Syslog'

export interface ServerSettingContext {
  updateSyslog: (() => void)
  discardSyslog: (() => void)
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

  const items = [{
    title: $t({ defaultMessage: 'Syslog Server' }),
    content: <>
      <StepsForm.SectionTitle id='syslog-server'>
        { $t({ defaultMessage: 'Syslog Server' }) }
      </StepsForm.SectionTitle>
      <Syslog />
    </>
  }]

  const handleUpdateSetting = async () => {
    try {
      await editServerContextData?.updateSyslog?.()
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
      buttonLabel={{ submit: useHasRoles('READ_ONLY')? '' : $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <AnchorLayout items={items} offsetTop={275} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}
