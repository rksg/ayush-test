import { ReactNode } from 'react'

import { GridRow, GridCol } from '../Grid'

import { Anchor, Container } from './styledComponents'

export { Anchor } from './styledComponents'

const { Link } = Anchor

export interface AnchorPageItem {
  title: string,
  content: ReactNode
}

export const AnchorLayout = ({ items, offsetTop } : {
  items: AnchorPageItem[],
  offsetTop?: number
}) => {
  return <GridRow>
    <GridCol col={{ span: 4 }}>
      <Anchor offsetTop={offsetTop} onClick={(e) => e.preventDefault()}>{
        items.map(item => {
          const linkId = item.title.split(' ').join('-')
          return <Link href={`#${linkId}`} title={item.title} key={linkId} />
        })
      }</Anchor>
    </GridCol>
    <GridCol col={{ span: 20 }}>{
      items.map(item => {
        const linkId = item.title.split(' ').join('-')
        return <Container id={linkId} key={linkId}>
          {item.content}
        </Container>
      })
    }</GridCol>
  </GridRow>
}