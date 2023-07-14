import { ReactNode, useRef, useEffect } from 'react'

import { Col, Row }            from 'antd'
import { InternalAnchorClass } from 'antd/lib/anchor/Anchor'

import { useNavigate, useLocation } from '@acx-ui/react-router-dom'

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
  const anchorRef = useRef<InternalAnchorClass>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    const hash = (e.target as HTMLElement).title.split(' ').join('-')
    navigate({ pathname: `${location.pathname}`, hash: hash })
  }

  useEffect(()=>{
    if (location.hash) {
      setTimeout(() =>
        anchorRef?.current?.handleScrollTo(`${location.hash}`)
      , 500)
    }
  }, [])

  return <Row gutter={20}>
    <Col span={4}>
      <Anchor ref={anchorRef} offsetTop={offsetTop} onClick={(e) => handleClick(e)}>{
        items.map(item => {
          const linkId = item.title.split(' ').join('-')
          return <Link href={`#${linkId}`} title={item.title} key={linkId} />
        })
      }</Anchor>
    </Col>
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
