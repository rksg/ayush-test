import { Carousel as AntCarousel, Space } from 'antd'
import parse                              from 'html-react-parser'

import * as UI from './styledComponents'

import type { CarouselProps as AntCarouselProps } from 'antd'

export interface CarouselProps extends Pick<AntCarouselProps, 'children'> {
  title?: string
  subTitle?: string
  contentList: string[][]
  classList: string
}

function Carousel ({
  contentList,
  title,
  subTitle,
  classList,
  ...props
}: CarouselProps) {
  return (
    <UI.Wrapper>
      <AntCarousel
        dotPosition={'bottom'}
        {...props}
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