import { useState } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { useMuteIncidentsMutation }    from '@acx-ui/analytics/components'
import { calculateSeverity }           from '@acx-ui/analytics/utils'
import { Incident }                    from '@acx-ui/analytics/utils'
import { Dropdown, showToast, Button } from '@acx-ui/components'
import { ConfigurationOutlined }       from '@acx-ui/icons'
import { TenantLink }                  from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

type MuteIncidentResponse = {
  toggleMute: { success: boolean; errorCode: string; errorMsg: string; }
}
function MuteIncident ({ incident } : { incident: Incident }) {
  const { $t } = useIntl()
  const [ isMuted, setIsMuted ] = useState(incident.isMuted)
  const [ muteIncident ] = useMuteIncidentsMutation()

  return <Dropdown
    overlay={<UI.MuteIncidentContainer>
      <Dropdown.OverlayTitle>{$t({ defaultMessage: 'Mute Incident' })}</Dropdown.OverlayTitle>
      <Switch
        checked={isMuted}
        onChange={async (checked) => {
          setIsMuted(checked)
          const { id, code, severity } = incident
          const { toggleMute } = await muteIncident(
            { id, code, priority: calculateSeverity(severity), mute: checked }
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
        }}
      />
      <p>
        {/* eslint-disable max-len */}
        {$t({ defaultMessage: 'While this incident is muted, it will be hidden in the UI. You can unmute this incident via setting icon in the {link}.' }, { link: <TenantLink to='/analytics/incidents'>{$t({ defaultMessage: 'incidents table' })}</TenantLink> })}
        {/* eslint-enable max-len */}
      </p>
    </UI.MuteIncidentContainer>}
  >
    {() => <Button icon={<ConfigurationOutlined />} />}
  </Dropdown>
}
export default MuteIncident
