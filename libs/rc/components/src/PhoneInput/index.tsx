import { useEffect, useRef } from 'react'

import { Form, Input, InputRef } from 'antd'
import 'intl-tel-input/build/css/intlTelInput.css'
import 'intl-tel-input/build/js/utils'
import intlTelInput              from 'intl-tel-input'

import { FlagContainer } from './styledComponents'

interface PhoneInputProps {
  name: string
  callback?: (value: string) => void
  onTop: boolean
}

export function PhoneInput ({ callback, name, onTop }: PhoneInputProps) {
  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (inputRef.current?.input) {
      const input = document.querySelector(`#phone_${name}`)
      if(input && window.intlTelInputGlobals.getInstance(input)){
        const iti = window.intlTelInputGlobals.getInstance(input)
        initialise(iti)
      }else{
        const iti = intlTelInput(inputRef.current.input, {
          nationalMode: false,
          hiddenInput: 'full_phone',
          autoPlaceholder: 'aggressive',
          placeholderNumberType: 'MOBILE',
          preferredCountries: ['us'],
          utilsScript: 'intl-tel-input/js/utils',
          dropdownContainer: onTop ? document.body : undefined
        })

        initialise(iti)
      }

      function initialise (iti: intlTelInput.Plugin) {
        if (inputRef.current?.input) {
          const handleChange = () => {
            callback && callback(iti.getNumber())
          }
          inputRef.current.input.addEventListener('change', handleChange)
          inputRef.current.input.addEventListener('keyup', handleChange)
        }
      }
    }
  }, [])

  return (
    <FlagContainer>
      <Form.Item name={name}>
        <Input ref={inputRef} style={{ width: '100%' }} id={`phone_${name}`} />
      </Form.Item>
    </FlagContainer>
  )
}

export default PhoneInput