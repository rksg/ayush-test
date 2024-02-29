import { ReactElement, ReactNode } from 'react'


interface TypeFormProps {
  content: ReactElement
  header?: () => ReactNode
}

export const TypeForm = (props: TypeFormProps) => {
  const { content, header } = props
  return <div>
    {header && header()}
    {content}
  </div>
}