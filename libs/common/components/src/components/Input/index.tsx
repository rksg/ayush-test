import React from 'react'

import { Input } from 'antd'

import { EyeOpenSolid, EyeSlashSolid } from '@acx-ui/icons-new'

import type { InputProps, InputRef } from 'antd/lib/input'

export const PasswordInput = React.forwardRef<InputRef, InputProps>((props, ref) => {
  const passwordIconRender = (visible: boolean) => {
    return visible ? <EyeSlashSolid size='sm' /> : <EyeOpenSolid size='sm' />
  }

  return (
    <Input.Password
      ref={ref}
      {...props}
      iconRender={passwordIconRender}
    />
  )
})
