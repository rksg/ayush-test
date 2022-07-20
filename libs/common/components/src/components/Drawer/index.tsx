import { Drawer as AntdDrawer, DrawerProps as AntdDrawerProps } from 'antd'

import { CloseSymbol, ArrowBack } from '@acx-ui/icons'

import * as UI from './styledComponents'

interface DrawerHeaderProps {
  title: string,
  icon?: React.ReactNode,
  subtitle?: string,
  OnBackClick?: () => void
}

export interface DrawerProps extends
  Omit<AntdDrawerProps, 'title'|'placement'|'extra'>, DrawerHeaderProps {}

const Header = (props: DrawerHeaderProps) => {
  return <>
    {props.OnBackClick
      ? <UI.BackButton onClick={props.OnBackClick}><ArrowBack/>Back</UI.BackButton>
      : null
    }
    <UI.Title>
      {props.icon ? props.icon : null}
      {props.title}
    </UI.Title>
    {props.subtitle ? <UI.SubTitle>{props.subtitle}</UI.SubTitle> : null}
  </>
}

export const Drawer = (props: DrawerProps) => {
  const { title, icon, subtitle, OnBackClick, ...rest } = props
  const headerProps = { title, icon, subtitle, OnBackClick }
  return (
    <AntdDrawer
      {...rest}
      title={<Header {...headerProps}/>}
      placement='right'
      mask={false}
      width={props.width || '400px'}
      closeIcon={<CloseSymbol />}
    />
  )
}
