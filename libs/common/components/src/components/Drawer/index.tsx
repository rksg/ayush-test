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
  Omit<AntDrawerProps,
    'title'|'placement'|'extra'|'footerStyle'|'maskClosable'|'maskStyle'|'mask'|'closeIcon'>,
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

let currentDrawer: {
  ref: RefObject<boolean> | null,
  onClose: CallableFunction | null
} = { ref: null, onClose: null }

export function useCloseOutsideClick (
  onClose: CallableFunction,
  footer: ReactNode | undefined,
  visible: boolean
) {
  const wasVisible = useRef<boolean>(false)
  useEffect(() => {
    if (!footer && visible && !wasVisible.current && currentDrawer?.ref !== wasVisible) {
      currentDrawer?.onClose?.()
      currentDrawer = { ref: wasVisible, onClose }
    }
    wasVisible.current = visible
  }, [onClose, footer, visible])
  useEffect(() => {
    return () => {
      if (currentDrawer?.ref === wasVisible) {
        wasVisible.current = false
        currentDrawer = { ref: null, onClose: null }
      }
    }
  }, [])
}

export const Drawer = (props: DrawerProps) => {
  const { title, icon, subTitle, onBackClick, ...rest } = props
  const headerProps = { title, icon, subTitle, onBackClick }
  const onClose = (event: ReactMouseEvent | KeyboardEvent) => props.onClose?.(event)
  useCloseOutsideClick(onClose, props.footer, Boolean(props.visible))
  return <UI.Drawer
    {...rest}
    title={<Header {...headerProps}/>}
    placement='right'
    mask={false}
    maskStyle={{ background: 'none' }}
    maskClosable={false}
    width={props.width || '336px'}
    closeIcon={<CloseSymbol />}
  />
}

interface FormFooterProps {
  showAddAnother?: boolean
  showSaveButton?: boolean
  onCancel: () => void
  onSave?: (checked: boolean) => Promise<void>
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
        {showSaveButton && onSave && <Button
          loading={loading}
          onClick={() => {
            setLoading(true)
            onSave(checked).finally(() => setLoading(false))
          }}
          type='primary'
        >
          {buttonLabel.save}
        </Button>}
      </div>
    </>
  )
}

Drawer.FormFooter = FormFooter
