import { useRef } from 'react'

import { Input, InputRef } from 'antd'
import { useIntl }         from 'react-intl'

import { Button } from '@acx-ui/components'


export default function SocialAuthURL () {
  const { $t } = useIntl()
  const inputKey = useRef<InputRef>(null)
  return (
    <>
      <Input value='https://devalto.ruckuswireless.com/g/ui/social'
        style={{ height: 32, width: 380, marginRight: 10 }}
        ref={inputKey}
        readOnly/>
      <Button onClick={()=>{
        inputKey?.current?.focus()
        inputKey?.current?.select()
        navigator.clipboard.writeText('https://devalto.ruckuswireless.com/g/ui/social')
      }}
      type='secondary'
      >{$t({ defaultMessage: 'Copy to clipboard' })}</Button>
    </>
  )
}

