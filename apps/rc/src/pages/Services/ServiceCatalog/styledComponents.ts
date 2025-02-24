import styled from 'styled-components/macro'

import { GridCol } from '@acx-ui/components'

export const CategoryContainer = styled.div`
  margin-bottom: 40px;
`

export const OltCardWrapper = styled(GridCol)`
 & button.ant-btn.ant-btn-primary {
  background-color: var(--acx-neutrals-40);
  border-color: var(--acx-neutrals-40);
  color: var(--acx-neutrals-10);
  cursor: not-allowed;

  &:hover, &:focus, &:active {
    background-color: var(--acx-neutrals-40);
    border-color: var(--acx-neutrals-40);
    color: var(--acx-neutrals-10);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 60px;
    height: 30px;
    background: rgba(255,255,255,0.1);
    animation: none;
    box-shadow: none;
  }
 }
`