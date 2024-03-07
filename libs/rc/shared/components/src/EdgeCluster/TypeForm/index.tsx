import { ReactElement, ReactNode } from 'react'

interface TypeFormProps {
  header?: ReactNode
  content: ReactElement
}

export const TypeForm = (props: TypeFormProps) => {
  const { content, header } = props
  return <div>
    {header}
    {content}
  </div>
}