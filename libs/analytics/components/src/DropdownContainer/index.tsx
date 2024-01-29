import React, { useState } from 'react'

import { Divider, Switch } from 'antd'

import { Dropdown, Button }      from '@acx-ui/components'
import { ConfigurationOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'

type Overlay = {
  title: string
  content: string | React.ReactNode
}
interface DropdownContainerProps {
  toggleCallback: CallableFunction
  muted: boolean
  overlay: Overlay
  extraOverlay?: Overlay
}
function DropdownContainer (
  { toggleCallback, muted, overlay, extraOverlay } : DropdownContainerProps) {
  const [ isMuted, setIsMuted ] = useState(muted)

  return <Dropdown
    overlay={<UI.DropdownContainer>
      {extraOverlay && <>
        <Dropdown.OverlayTitle>{extraOverlay.title}</Dropdown.OverlayTitle>
        {extraOverlay.content}
      </>}
      <Divider />
      <Dropdown.OverlayTitle>{overlay.title}</Dropdown.OverlayTitle>
      <Switch
        checked={isMuted}
        onChange={async (checked) => {
          setIsMuted(checked)
          toggleCallback(checked)
        }}
      />
      <p>{overlay.content}</p>
    </UI.DropdownContainer>}
  >
    {() => <Button icon={<ConfigurationOutlined />} />}
  </Dropdown>
}
export default DropdownContainer
