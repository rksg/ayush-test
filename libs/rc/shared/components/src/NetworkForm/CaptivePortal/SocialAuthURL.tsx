import { useRef } from 'react'

import { Input, InputRef } from 'antd'
import { useIntl }         from 'react-intl'

import { Button } from '@acx-ui/components'



export default function SocialAuthURL (props:{
  redirectURL: string
}) {
  const { $t } = useIntl()
  const { redirectURL } = props
  const inputKey = useRef<InputRef>(null)
  return (
    <>
      <Input value={`https://${redirectURL}/g/ui/social`}
        style={{ height: 32, width: 380, marginRight: 10, background: 'var(--acx-neutrals-15)' }}
        ref={inputKey}
        readOnly/>
      <Button onClick={()=>{
        inputKey?.current?.focus()
        inputKey?.current?.select()
        navigator?.clipboard?.writeText(`https://${redirectURL}/g/ui/social`)
      }}
      type='link'
      >{$t({ defaultMessage: 'Copy to clipboard' })}</Button>
    </>
  )
}

