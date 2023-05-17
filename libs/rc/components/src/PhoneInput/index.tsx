import { useEffect, useRef } from 'react'

import { Input, InputRef } from 'antd'
import 'intl-tel-input/build/css/intlTelInput.css'
import 'intl-tel-input/build/js/utils'
import intlTelInput        from 'intl-tel-input'

import { FlagContainer } from './styledComponents'

interface PhoneInputProps {
    callback?: (value: string) => void,
    onTop: boolean
}

export function PhoneInput ({ callback, onTop }: PhoneInputProps) {
  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (inputRef.current?.input) {
      const iti = intlTelInput(inputRef.current.input, {
        hiddenInput: 'full_phone',
        autoPlaceholder: 'aggressive',
        placeholderNumberType: 'MOBILE',
        preferredCountries: ['us'],
        utilsScript: 'intl-tel-input/js/utils',
        dropdownContainer: onTop ? document.body : undefined,
        customPlaceholder: function (selectedCountryPlaceholder, selectedCountryData) {
          return `+${selectedCountryData.dialCode} ${selectedCountryPlaceholder}`
        }
      })

      const handleChange = () => {
        callback && callback(iti.getNumber())
      }

      inputRef.current.input.addEventListener('change', handleChange)
      inputRef.current.input.addEventListener('keyup', handleChange)
    }
  }, [])

  return (
    <FlagContainer>
      <Input ref={inputRef} style={{ width: '100%' }} />
    </FlagContainer>
  )
}

export default PhoneInput