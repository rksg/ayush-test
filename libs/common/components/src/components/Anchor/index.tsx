import { ReactNode, useRef, useEffect, createContext, useState, SetStateAction, Dispatch } from 'react'

import { Col, Row }            from 'antd'
import { InternalAnchorClass } from 'antd/lib/anchor/Anchor'
import _                       from 'lodash'

import { useNavigate, useLocation } from '@acx-ui/react-router-dom'

import { useLayoutContext } from '../Layout'

import { Anchor, Container, AnchorLayoutSidebar } from './styledComponents'

export { Anchor } from './styledComponents'

const { Link } = Anchor

export interface AnchorPageItem {
  title: string,
  content: ReactNode
}

export interface AnchorLayoutProps {
  items: AnchorPageItem[],
  /**
   * Pixels to offset from top when calculating position of scroll
   */
  offsetTop?: number,
  /**
   *  Wait for ready state before scrolling to anchor link
   */
  waitForReady?: boolean
}

export const AnchorContext = createContext({} as {
  readyToScroll: string[],
  setReadyToScroll: Dispatch<SetStateAction<string[]>>
})

export const AnchorLayout = ({ items, offsetTop = 0, waitForReady = false }: AnchorLayoutProps) => {
  const anchorRef = useRef<InternalAnchorClass>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const layout = useLayoutContext()

  const [ readyToScroll, setReadyToScroll ] = useState<string[]>([])
  const [ isScrolled, setIsScrolled ] = useState(!waitForReady)

  const getHashKey = (title: string) => title.split(' ').join('-')
  const keyList = items.map(item => getHashKey(item.title))
  const compareFn = (s1: string[], s2: string[]) => s1.sort().join(',') === s2.sort().join(',')

  useEffect(()=>{
    if (location.hash && _.isEqualWith(keyList, _.uniq(readyToScroll), compareFn) && !isScrolled) {
      setIsScrolled(true)
      setTimeout(() => anchorRef?.current?.handleScrollTo(`${location.hash}`), 500)
    }
  }, [keyList, location.hash, readyToScroll, isScrolled])

  useEffect(() => {
    if (location.hash && !waitForReady) {
      setTimeout(() => anchorRef?.current?.handleScrollTo(`${location.hash}`), 500)
    }
  }, [location.hash, waitForReady])

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setIsScrolled(true)
    const hash = getHashKey((e.target as HTMLElement).title)
    navigate({ pathname: `${location.pathname}`, hash: hash })
  }

  return <AnchorContext.Provider value={{ readyToScroll, setReadyToScroll }}><Row gutter={20}>
    <AnchorLayoutSidebar span={4}
      $offsetTop={offsetTop + layout.pageHeaderY}>
      <Anchor ref={anchorRef}
        offsetTop={offsetTop + layout.pageHeaderY}
        onClick={(e) => handleClick(e)}
        $customType='layout'>
        {items.map(item => {
          const linkId = getHashKey(item.title)
          return <Link href={`#${linkId}`} title={item.title} key={linkId} />
        })}
      </Anchor>
    </AnchorLayoutSidebar>
    <Col span={20}>{
      items.map(item => {
        const linkId = getHashKey(item.title)
        return <Container id={linkId} key={linkId}>
          {item.content}
        </Container>
      })
    }</Col>
  </Row></AnchorContext.Provider>
}
