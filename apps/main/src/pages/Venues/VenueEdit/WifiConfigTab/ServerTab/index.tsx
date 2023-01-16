import { useContext, useState } from 'react'

import { useIntl } from 'react-intl'

import { showToast, StepsForm, Tabs }            from '@acx-ui/components'
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

  const [currentTab, setCurrentTab] = useState('Syslog')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const handleUpdateSetting = async () => {
    try {
      editServerContextData?.updateSyslog?.()
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
        <Tabs onChange={onTabChange}
          activeKey={currentTab}
          type='third'>
          <Tabs.TabPane tab={$t({ defaultMessage: 'Syslog' })} key='Syslog' />
        </Tabs>
        <div style={{ display: currentTab === 'Syslog' ? 'block' : 'none' }}>
          <Syslog />
        </div>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

