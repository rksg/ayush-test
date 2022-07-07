import { CloseSymbol } from '@acx-ui/icons'
import { Modal as AntdModal, ModalProps as AntdModalProps } from 'antd'
import { useState } from 'react'

import * as UI from './styledComponents'

interface ModalProps extends AntdModalProps {
  subTitle?: string
}

export function Modal ({ ...props }: ModalProps) {
  const [visible, setVisible] = useState(false)

  const showModal = () => {
    setVisible(true)
  }

  const handleOk = () => {
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  return (
    <UI.Wrapper>
      <AntdModal
        {...props}
        closeIcon={<CloseSymbol />}
        title={props.subTitle ? TitleWithSubtitle(props.title, props.subTitle) : props.title}
      />
    </UI.Wrapper>
  )
}

const TitleWithSubtitle = (title: React.ReactNode, subTitle: string) => {
  return (
    <>
      <>{title}</>
      <UI.SubTitleWrapper children={subTitle} />
    </>
  )
}