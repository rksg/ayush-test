import { ReactElement, ReactNode } from 'react'

import * as UI from './styledComponent'

interface TypeFormProps {
  header?: ReactNode
  content: ReactElement
}

export const TypeForm = (props: TypeFormProps) => {
  const { content, header } = props
  return <div>
    <UI.StyledWrapper>{header}</UI.StyledWrapper>
    {content}
  </div>
}