import { Input } from 'antd'

import { EyeOpenSolid, EyeSlashSolid } from '@acx-ui/icons-new'

import type { InputProps } from 'antd/lib/input'


export function PasswordInput (props: InputProps) {
  const passwordIconRender = (visible: boolean) => {
    return visible ? <EyeSlashSolid size='sm' /> : <EyeOpenSolid size='sm' />
  }

  return (
    <Input.Password
      {...props}
      iconRender={passwordIconRender}
    />
  )
}