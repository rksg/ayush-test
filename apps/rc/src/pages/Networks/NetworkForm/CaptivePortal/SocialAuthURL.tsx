import { useEffect, useRef, useState } from 'react'

import { Input, InputRef } from 'antd'
import { useIntl }         from 'react-intl'

import { Button }               from '@acx-ui/components'
import { useGlobalValuesQuery } from '@acx-ui/rc/services'


export default function SocialAuthURL () {
  const { $t } = useIntl()
  const inputKey = useRef<InputRef>(null)
  const globalValues= useGlobalValuesQuery({})
  const [redirectURL, setRedirectURL]=useState('')
  useEffect(()=>{
    if(globalValues){
      setRedirectURL(globalValues?.data?.['CAPTIVE_PORTAL_DOMAIN_NAME']||'')
    }
  }, [globalValues])
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

