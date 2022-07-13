import { Drawer as AntdDrawer, DrawerProps as AntdDrawerProps } from 'antd'

import { CloseSymbol } from '@acx-ui/icons'

export interface DrawerProps extends Omit<AntdDrawerProps, 'placement'> {
}

export const Drawer = (props: DrawerProps) => {
  return (
    <AntdDrawer
      {...props}
      placement='right'
      mask={false}
      width={'400px'}
      closeIcon={<CloseSymbol />}
    />
  )
}
