import { useEffect, useRef } from 'react'

import { Carousel as AntCarousel, Space } from 'antd'
import { CarouselRef }                    from 'antd/lib/carousel'
import parse                              from 'html-react-parser'

import * as UI from './styledComponents'

import type { CarouselProps as AntCarouselProps } from 'antd'

export interface CarouselProps extends Pick<AntCarouselProps, 'children'> {
  title?: string
  subTitle?: string
  contentList: string[][]
  classList: string
  style: { height: number, width: number }
}

function Carousel ({
  contentList,
  title,
  subTitle,
  classList,
  style,
  ...props
}: CarouselProps) {
  const slider = useRef<CarouselRef>()
  useEffect(()=>{
    slider.current?.goTo(0)
  },[contentList])
  return (
    <UI.Wrapper style={style}>
      <AntCarousel
        dotPosition={'bottom'}
        {...props}
        style={style}
        ref={ref => {
          slider.current = ref as CarouselRef
        }}
      >
        {contentList.map((list, index) => (
          <div key={'carousel-card-'+index} className={classList}>
            <UI.Title children={title} />
            <Space></Space>
            {subTitle ? (
              <UI.SubTitle children={subTitle} />
            ) : null}
            <UI.List><ol>
              {list.map((content, index) => (
                <li key={'carousel-card-li-'+index}>{parse(content)}</li>
              ))}
            </ol></UI.List></div>
        ))}
      </AntCarousel>
    </UI.Wrapper>
  )
}

export { Carousel }