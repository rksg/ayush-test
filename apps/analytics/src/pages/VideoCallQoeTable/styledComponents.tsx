import styled from 'styled-components'

export const withDottedUnderline = `
  text-decoration: dotted underline;
  // below css will hide the default safari tooltip
  :after {
    content: '';
    display: block;
  }
`
export const WithDottedUnderline = styled.span`
  ${withDottedUnderline}
  color: red;
`
WithDottedUnderline.displayName = 'WithDottedUnderline'

