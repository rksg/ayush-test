import { ReactNode, useRef, useEffect } from 'react'

import { Col, Row }            from 'antd'
import { InternalAnchorClass } from 'antd/lib/anchor/Anchor'

import { useNavigate, useLocation } from '@acx-ui/react-router-dom'

import { useLayoutContext } from '../Layout'

import { Anchor, Container, AnchorLayoutSidebar } from './styledComponents'

export { Anchor } from './styledComponents'

const { Link } = Anchor

export interface AnchorPageItem {
  title: string,
  content: ReactNode
}

export const AnchorLayout = ({ items, offsetTop = 0 } : {
  items: AnchorPageItem[],
  offsetTop?: number
}) => {
  const anchorRef = useRef<InternalAnchorClass>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const layout = useLayoutContext()

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const hash = (e.target as HTMLElement).title.split(' ').join('-')
    navigate({ pathname: `${location.pathname}`, hash: hash })
  }

  return <Row gutter={20}>
    <AnchorLayoutSidebar span={4}
      $offsetTop={offsetTop + layout.pageHeaderY}>
      <Anchor ref={anchorRef}
        offsetTop={offsetTop + layout.pageHeaderY}
        onClick={(e) => handleClick(e)}
        $customType='layout'>
        {items.map(item => {
          const linkId = item.title.split(' ').join('-')
          return <Link href={`#${linkId}`} title={item.title} key={linkId} />
        })}
      </Anchor>
    </AnchorLayoutSidebar>
    <Col span={20}>{
      items.map(item => {
        const linkId = item.title.split(' ').join('-')
        return <Container id={linkId} key={linkId}>
          {item.content}
        </Container>
      })
    }</Col>
  </Row>
}
