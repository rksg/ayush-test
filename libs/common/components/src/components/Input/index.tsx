import { Input } from 'antd'

import { EyeOpenSolid, EyeSlashSolid } from '@acx-ui/icons'

import type { InputProps } from 'antd/lib/input'


export function PasswordInput (props: InputProps) {
  const passwordIconRender = (visible: boolean) => {
    return visible ? <EyeSlashSolid/> : <EyeOpenSolid />
  }

  return (
    <Input.Password
      {...props}
      iconRender={passwordIconRender}
    />
  )
}