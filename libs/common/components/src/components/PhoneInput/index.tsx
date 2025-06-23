import { useEffect, useRef } from 'react'

import { Form, Input, InputRef } from 'antd'
import 'intl-tel-input/build/js/utils'
import intlTelInput              from 'intl-tel-input'

export interface PhoneInputProps {
  name: string | string[]
  callback?: (value: string) => void
  onTop: boolean,
  defaultCountryCode?: string
}

export function PhoneInput ({ callback, name, onTop, defaultCountryCode }: PhoneInputProps) {
  const inputRef = useRef<InputRef>(null)
  const form = Form.useFormInstance()

  useEffect(() => {
    if (inputRef.current?.input) {
      const iti = intlTelInput(inputRef.current.input, {
        nationalMode: false,
        hiddenInput: 'full_phone',
        autoPlaceholder: 'aggressive',
        placeholderNumberType: 'MOBILE',
        preferredCountries: ['us'],
        dropdownContainer: onTop ? document.body : undefined
      })

      const handleChange = () => {
        callback && callback(iti.getNumber())
      }

      inputRef.current.input.addEventListener('change', handleChange)
      inputRef.current.input.addEventListener('keyup', handleChange)

      if(form.getFieldValue(name)) {
        iti.getNumber()
      } else {
        defaultCountryCode && iti.setCountry(defaultCountryCode)
      }
      return () => {
        iti && iti.destroy()
      }
    }
    return
  }, [name])

  return (
    <Form.Item name={name}>
      <Input ref={inputRef} style={{ width: '100%' }} />
    </Form.Item>
  )
}

