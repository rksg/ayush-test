import styled from 'styled-components'

const itemPrefix = `
  ::before {
    content: '- ';
  }
`

export const Invitation = {
  Wrapper: styled.div`
    margin-bottom: 20px;
  `,
  Title: styled.div`
    font-size: var(--acx-subtitle-4-font-size);
    font-weight: var(--acx-subtitle-4-font-weight);
  `,
  BrandLink: styled.div`
    ${itemPrefix}
    margin: 10px 0;
  `,
  ListItem: styled.div`
    ${itemPrefix}
    margin: 10px 0;
  `,
  ActionBtn: styled.span`
    color: var(--acx-accents-blue-50);
    text-decoration: none;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    transition: color 0.3s;
  `,
  Highlight: styled.span`
    font-weight: var(--acx-subtitle-4-font-weight);
  `,
  Count: styled.div`
    margin: -12px 0 0 3px;
  `
}
