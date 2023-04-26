import { KeyboardEvent, MouseEvent as ReactMouseEvent, RefObject, useRef, useEffect, useState, ReactNode } from 'react'

import {  DrawerProps as AntDrawerProps } from 'antd'
import Checkbox, { CheckboxChangeEvent }  from 'antd/lib/checkbox'
import { useIntl }                        from 'react-intl'

import { CloseSymbol, ArrowBack } from '@acx-ui/icons'

import { Button } from '../Button'

import * as UI from './styledComponents'

interface DrawerHeaderProps {
  title: string,
  icon?: React.ReactNode,
  subTitle?: string,
  onBackClick?: () => void
}

export interface DrawerProps extends
  Omit<AntDrawerProps, 'title'|'placement'|'extra'|'footerStyle'>,
  DrawerHeaderProps {}

const Header = (props: DrawerHeaderProps) => {
  return <>
    {props.onBackClick
      ? <UI.BackButton onClick={props.onBackClick}><ArrowBack/>Back</UI.BackButton>
      : null
    }
    <UI.Title>
      {props.icon ? props.icon : null}
      {props.title}
    </UI.Title>
    {props.subTitle ? <UI.SubTitle>{props.subTitle}</UI.SubTitle> : null}
  </>
}

export function useCloseOutsideClick (
  ref: RefObject<HTMLDivElement | null>,
  onClose: CallableFunction,
  mask: boolean,
  footer: ReactNode | undefined
) {
  useEffect(() => {
    if (mask) return
    if (footer) return
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target && ref.current) {
        const isOutsideClick = !target.closest('div[class="ant-drawer-content-wrapper"]')
        if (isOutsideClick) {
          onClose?.()
        }
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [onClose, ref, mask, footer])
}

export const Drawer = (props: DrawerProps) => {
  const { title, icon, subTitle, onBackClick, mask = false, ...rest } = props
  const headerProps = { title, icon, subTitle, onBackClick }
  const ref = useRef<HTMLDivElement | null>(null)
  const onClose = (event: ReactMouseEvent | KeyboardEvent) => props.onClose?.(event)
  useCloseOutsideClick(ref, onClose, mask, props.footer)
  return (
    <div ref={ref}>
      <UI.Drawer
        {...rest}
        title={<Header {...headerProps}/>}
        placement='right'
        mask={mask}
        maskStyle={{ background: 'none' }}
        maskClosable={mask}
        width={props.width || '336px'}
        closeIcon={<CloseSymbol />}
      />
    </div>
  )
}

interface FormFooterProps {
  showAddAnother?: boolean
  showSaveButton?: boolean
  onCancel: () => void
  onSave: (checked: boolean) => Promise<void>
  buttonLabel?: {
    addAnother?: string
    cancel?: string
    save?: string
  }
}

const FormFooter = (props: FormFooterProps) => {
  const { $t } = useIntl()
  const [ loading, setLoading ] = useState(false)
  const {
    showAddAnother = false,
    showSaveButton = true,
    onCancel,
    onSave
  } = props
  const buttonLabel = {
    ...{
      addAnother: $t({ defaultMessage: 'Add another' }),
      cancel: $t({ defaultMessage: 'Cancel' }),
      save: $t({ defaultMessage: 'Save' })
    },
    ...props.buttonLabel
  }
  const [checked, setChecked] = useState(false)
  return (
    <>
      <div>
        {showAddAnother && <Checkbox
          onChange={(e: CheckboxChangeEvent) => setChecked(e.target.checked)}
          checked={checked}
          children={buttonLabel.addAnother}
        />}
      </div>
      <div>
        <Button onClick={onCancel}>
          {buttonLabel.cancel}
        </Button>
        {showSaveButton && <Button
          loading={loading}
          onClick={() => {
            setLoading(true)
            onSave(checked).finally(() => setLoading(false))
          }}
          type={'secondary'}
        >
          {buttonLabel.save}
        </Button>}
      </div>
    </>
  )
}

Drawer.FormFooter = FormFooter
