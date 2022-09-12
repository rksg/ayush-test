import { ReactNode } from 'react'

import { Wrapper, Anchor, Container } from './styledComponents'

export { Anchor } from './styledComponents'

const { Link } = Anchor

export interface AnchorPageItem {
  title: string,
  content: ReactNode
}

export const AnchorLayout = (props: {
  items: AnchorPageItem[]
}) => {
  return <Wrapper>
    <Anchor>{
      props?.items.map(item => 
        <Link href={`#${item.title.split(' ').join('-')}`} title={item.title} />
      )
    }
    </Anchor>
    <Container>{
      props.items.map(item => 
        <div className='section' id={item.title.split(' ').join('-')}>
          {item.content}
        </div>
      )
    }</Container>
  </Wrapper>
}