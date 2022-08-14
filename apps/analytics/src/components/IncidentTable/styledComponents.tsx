import { Space as AntSpace, SpaceProps } from 'antd'
import styled                            from 'styled-components'

export const Space = styled((props: SpaceProps) =>
  <AntSpace {...props}/>
)`
  margin-bottom: 16px;
`

export const Div = styled.div``


export const withEllipsis = `
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const withDottedUnderline = `
  text-decoration: dotted underline;
  // below css will hide the default safari tooltip
  :after {
    content: '';
    display: block;
  }
`

export const DescriptionSpan = styled.div`
  ${withEllipsis}
  ${withDottedUnderline}
`
