import { useState } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { calculateSeverity } from '@acx-ui/analytics/utils'
import { Incident }          from '@acx-ui/analytics/utils'
import { showToast }         from '@acx-ui/components'
import { TenantLink }        from '@acx-ui/react-router-dom'

import { DetailsActions }           from '../../DetailsActions'
import { useMuteIncidentsMutation } from '../../IncidentTable/services'

type MuteIncidentResponse = {
  toggleMute: { success: boolean; errorCode: string; errorMsg: string; }
}
export function MuteIncident ({ incident } : { incident: Incident }) {
  const { $t } = useIntl()
  const [ muteIncident ] = useMuteIncidentsMutation()
  const [ isMuted, setIsMuted ] = useState(incident.isMuted)

  const toggleCallback = async (checked: boolean) => {
    const { id, code, severity } = incident
    const { toggleMute } = await muteIncident(
      [{ id, code, priority: calculateSeverity(severity), mute: checked }]
    ).unwrap() as unknown as MuteIncidentResponse
    if (toggleMute.success) {
      showToast({
        type: 'success',
        content: $t(
          { defaultMessage: 'Incident {state} successfully' },
          { state: checked ? 'muted' : 'unmuted' }
        )
      })
    } else {
      showToast({ type: 'error', content: toggleMute.errorMsg })
    }
  }

  return <DetailsActions overlayElements={[
    {
      title: $t({ defaultMessage: 'Mute Incident' }),
      content: <>
        <Switch
          checked={isMuted}
          onChange={async (checked) => {
            setIsMuted(checked)
            toggleCallback(checked)
          }}
        />
        <p>{
        /* eslint-disable max-len */
          $t({ defaultMessage: 'While this incident is muted, it will be hidden in the UI. You can unmute this incident via setting icon in the {link}.' },
            { link: <TenantLink to='/analytics/incidents'>{$t({ defaultMessage: 'incidents table' })}</TenantLink> })
        /* eslint-enable max-len */
        }</p>
      </>
    }
  ]}/>
}

