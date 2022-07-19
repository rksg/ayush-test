
import { useState } from 'react'

import { Button } from 'antd'

export function ToggleButtonInput (props: {
    value?: boolean
    onChange?: (value: boolean) => void
    enableText: React.ReactNode
    disableText: React.ReactNode
  }) {
  const [enabled, setEnabled] = useState(props.value ?? false)
  return <Button
    type='link'
    onClick={() => {
      props.onChange?.(!enabled)
      setEnabled(!enabled)
    }}
  >
    {enabled ? props.enableText : props.disableText}
  </Button>
}