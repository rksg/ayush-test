import { CSSProperties, forwardRef, ReactNode, useEffect, useRef, useState } from 'react'

import { Switch } from 'antd'

import * as UI from './styledComponents'

export type FieldsetProps = {
  children: ReactNode
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
  style?: CSSProperties
  switchStyle?: CSSProperties
}

export const Fieldset = forwardRef<HTMLElement, FieldsetProps>(({
  onChange,
  className,
  style,
  switchStyle,
  ...props
}: FieldsetProps, ref) => {
  const isControlled = useRef(props.checked !== undefined).current
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!isControlled) return
    // prevent switching from controlled > uncontrolled
    if (props.checked === undefined) return
    setChecked(props.checked)
  }, [isControlled, props.checked])

  const handleChange = (checked: boolean) => {
    onChange?.(checked)
    if (!isControlled) setChecked(checked)
  }

  return (
    <UI.Fieldset {...{ className, style }} $checked={checked} disabled={props.disabled}>
      <UI.Legend>
        <label>
          {props.label}
          <Switch
            ref={ref}
            disabled={props.disabled}
            style={switchStyle}
            checked={checked}
            onChange={handleChange}
          />
        </label>
      </UI.Legend>
      {checked && props.children}
    </UI.Fieldset>
  )
})
