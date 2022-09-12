import { Button as AntButton } from 'antd'
import styled                  from 'styled-components/macro'

import { ArrowsOut, MoreVertical } from '@acx-ui/icons'

import type { CardTypes } from '.'

type WrapperProps = {
  type: CardTypes
  hasTitle: boolean
  isChart: boolean
}

export const ArrowOutIcon = styled(ArrowsOut)``
export const MoreVerticalIcon = styled(MoreVertical)``

export const Button = styled(AntButton)`
  border: none;
  box-shadow: none;
  background: var(--acx-primary-white);
  padding: 0;
  &.ant-btn-icon-only {
    width: 16px;
    height: 16px;
  }
`

const height = '250px'

export const Wrapper = styled.div<WrapperProps>`
  height: ${(props) => (props.isChart ? height : '100%')};
  width: 100%;
  .ant-card {
    height: 100%;
    display:flex;
    flex-direction:column;
    border-radius: 8px;
    ${(props) => (props.type === 'default' ? `
      padding: 12px 16px;
      border: 1px solid var(--acx-neutrals-20);
      box-shadow: 0px 2px 4px rgba(51, 51, 51, 0.08);
    ` : '')}
    ${(props) => (props.type === 'solid-bg' ? `
      padding: 12px 16px;
      background-color: var(--acx-neutrals-10);
    ` : '')}
  }
  .ant-card-head {
    ${(props) => (props.hasTitle ? '' : 'display:none;')}
    padding: 0;
    border-bottom: none;
    min-height: 0;
    ${(props) => (props.isChart ? '' : 'margin-bottom: 10px;')}
  }
  .ant-card-head-title {
    padding: 0;
  }
  .ant-card-head-wrapper {
    align-items: start;
  }
  .ant-card-extra {
    padding: 0;
  }
  .ant-card-body {
    display: flex;
    flex-grow: 1;
    padding: 0;
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
`

export const Title = styled.div`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-headline-4-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-headline-4-font-weight-bold);
  height: var(--acx-headline-4-line-height);
  margin-bottom: 5px;
`

export const SubTitle = styled.div`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-body-font-weight);
  height: var(--acx-body-5-line-height);
`
