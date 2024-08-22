import { Card as AntCard, Button as AntButton, Space as AntSpace } from 'antd'
import styled                                                      from 'styled-components'

import { Collapse as AntCollapse } from '@acx-ui/components'


export const Card = styled(AntCard)<{ $disabled: boolean }>`
  height: 100%;
  border: 1px solid var(--acx-neutrals-30);

  ${props => props.$disabled
    ? ''
    : `:hover {
    border-radius: 4px;
    border: 1px solid var(--acx-accents-orange-50);
    background-color: var(--acx-accents-orange-10);
  }`}

  ${props => props.$disabled
    ? `opacity : 60%;
      background-color: var(--acx-neutrals-15);
    `: ''}

   :hover {
    button {
      opacity: 1;
    }
  }

  .ant-card-body {
    height: 100%;
    padding: 12px;
    display: flex;
    flex-direction: column;
  }
`

export const Space = styled(AntSpace)`
  height: 100%;

  .ant-space-item {
    height: 100%;
  }
`

export const Icon = styled.div`
  width: 40px;
  height: 40px;

  svg {
    width: 100%;
    height: 100%;
  }
`

export const Content = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const Title = styled.div`
  padding-bottom: 6px;
  color: var(--acx-primary-black);
  font-size: var(--acx-subtitle-4-font-size);
  font-weight: var(--acx-subtitle-4-font-weight);
`

export const Description = styled.div`
  padding-bottom: 12px;
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-4-font-size);
`

export const Button = styled(AntButton)`
  opacity: 0;
  width: fit-content;
  margin-top: auto;
`

export const Collapse = styled(AntCollapse)`
  grid-area: 1 / 1 / 1 / 1;

  .ant-collapse-item {
    flex: 1;

    > .ant-collapse-content > .ant-collapse-content-box {
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-top: 16px;
    }
  }
`
