
import { useEffect, useRef, useState } from 'react'

import { Button } from '@acx-ui/components'

export function ToggleButton (props: {
    value?: boolean
    onChange?: (value: boolean) => void
    enableText: React.ReactNode
    disableText: React.ReactNode
  }) {
  const isControlled = useRef(props.value !== undefined).current
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!isControlled) return
    // prevent switching from controlled > uncontrolled
    if (props.value === undefined) return
    setEnabled(props.value)
  }, [isControlled, props.value])

  return <Button
    type='link'
    onClick={() => {
      props.onChange?.(!enabled)
      if (!isControlled) setEnabled(!enabled)
    }}
  >
    {enabled ? props.enableText : props.disableText}
  </Button>
}
