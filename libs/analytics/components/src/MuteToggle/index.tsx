import { useState } from 'react'

import { Switch } from 'antd'

import { Dropdown, Button }      from '@acx-ui/components'
import { ConfigurationOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'

type Overlay = {
  title: string
  content: string
}
interface MuteToggleProps {
  toggleCallback: CallableFunction
  muted: boolean
  overlay: Overlay
}
function MuteToggle ({ toggleCallback, muted, overlay } : MuteToggleProps) {
  const [ isMuted, setIsMuted ] = useState(muted)

  return <Dropdown
    overlay={<UI.MuteIncidentContainer>
      <Dropdown.OverlayTitle>{overlay.title}</Dropdown.OverlayTitle>
      <Switch
        checked={isMuted}
        onChange={async (checked) => {
          setIsMuted(checked)
          toggleCallback(checked)
        }}
      />
      <p>{overlay.content}</p>
    </UI.MuteIncidentContainer>}
  >
    {() => <Button icon={<ConfigurationOutlined />} />}
  </Dropdown>
}
export default MuteToggle
