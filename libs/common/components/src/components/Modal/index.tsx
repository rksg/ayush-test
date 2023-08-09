import { useLayoutEffect, useRef, useState } from 'react'

import { ModalProps as AntModalProps } from 'antd'
import { useIntl }                     from 'react-intl'

import { CloseSymbol } from '@acx-ui/icons'

import { Button, ButtonProps } from '../Button'

import * as UI from './styledComponents'

export enum ModalType {
  Default = 'default',
  ModalStepsForm = 'modalStepsForm'
}

interface ModalProps extends AntModalProps {
  type?: ModalType,
  title: string
  subTitle?: string
}

function HasStepsFormContainer (props: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasStepsForm, setHasStepsForm] = useState(false)
  useLayoutEffect(() => {
    //.ant-pro-steps-form: <StepsFormLegacy />, .ant-steps: <StepsForm />
    setHasStepsForm(Boolean(
      ref.current?.querySelector('.ant-pro-steps-form') || ref.current?.querySelector('.ant-steps')
    ))
  })
  const className = [props.className, hasStepsForm ? 'has-steps-form' : '']
    .filter(Boolean)
    .join(' ')
  return <div {...props} ref={ref} className={className} />
}

export function Modal ({
  type = ModalType.Default,
  footer,
  onCancel,
  cancelText,
  cancelButtonProps,
  onOk,
  okText,
  okButtonProps,
  ...props
}: ModalProps) {
  const { $t } = useIntl()
  if (!footer) {
    footer = [
      <Button {...cancelButtonProps as ButtonProps} key='cancel' onClick={onCancel}>
        {cancelText || $t({ defaultMessage: 'Cancel' })}
      </Button>,
      <Button {...okButtonProps as ButtonProps} key='ok' onClick={onOk} type='primary'>
        {okText || $t({ defaultMessage: 'OK' })}
      </Button>
    ]
  }

  return (
    <UI.Modal
      {...props}
      {...((type === ModalType.ModalStepsForm) && {
        closable: false,
        width: props.width || '95%'
      })}
      modalRender={node => <HasStepsFormContainer children={node} />}
      onCancel={onCancel}
      closeIcon={<CloseSymbol />}
      title={props.subTitle ? TitleWithSubtitle(props.title, props.subTitle) : props.title}
      footer={footer}
    />
  )
}

const TitleWithSubtitle = (title: string, subTitle: string) => {
  return (
    <>
      {title}
      <UI.SubTitleWrapper children={subTitle} />
    </>
  )
}
