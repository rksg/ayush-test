import { useState } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { useMuteIncidentsMutation, MutationResponse } from '@acx-ui/analytics/components'
import { calculateSeverity }                          from '@acx-ui/analytics/utils'
import { Incident }                                   from '@acx-ui/analytics/utils'
import { Dropdown, Card, showToast }                  from '@acx-ui/components'
import { ConfigurationOutlined }                      from '@acx-ui/icons'
import { TenantLink }                                 from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

function MuteIncident ({ incident } : { incident: Incident }) {
  const { $t } = useIntl()
  const [ isMuted, setIsMuted ] = useState(incident.isMuted)
  const [ muteIncident ] = useMuteIncidentsMutation()

  return <Dropdown
    overlay={<Card title={$t({ defaultMessage: 'Mute Incident' })}>
      <UI.MuteIncidentContainer>
        <Switch
          checked={isMuted}
          onChange={async (checked) => {
            setIsMuted(checked)
            const { id, code, severity } = incident
            const { data: { toggleMute } } = await muteIncident(
              { id, code, priority: calculateSeverity(severity), mute: checked }
            ) as unknown as MutationResponse
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
          }}
        />
        <p>
          {/* eslint-disable max-len */}
          {$t({ defaultMessage: 'While this incident is muted, it will be hidden in the UI. You can unmute this incident via setting icon in the' })}
        &nbsp;
          <TenantLink to='/analytics/incidents'>
            {$t({ defaultMessage: 'incidents table' })}
          </TenantLink>
          {/* eslint-enable max-len */}
        </p>
      </UI.MuteIncidentContainer>
    </Card>}
  >
    {() => <UI.IconContainer><ConfigurationOutlined /></UI.IconContainer>}
  </Dropdown>
}
export default MuteIncident
