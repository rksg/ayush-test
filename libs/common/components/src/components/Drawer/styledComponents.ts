import { Drawer as AntDrawer }            from 'antd'
import styled, { createGlobalStyle, css } from 'styled-components'

export enum DrawerTypes {
  Default = 'default',
  FullHeight = 'fullHeight',
  Left='left',
  ModalLeft='modalLeft'
}

const fullHeightStyle = css`
  .ant-drawer-content-wrapper {
    height: 100vh;
    margin-top: calc(-1 * var(--acx-drawer-top-space));
  }
`

const leftStyle = css`
:root .ant-drawer {
  height: calc(100vh - var(--acx-header-height));
  margin-top: var(--acx-header-height);
  div.ant-drawer-content-wrapper {
    border-radius: 0px;
    .ant-drawer-content {
      background: var(--acx-neutrals-10);
      .ant-drawer-header {
        border: 0px;
      }
    }
  }
}
`

const modalLeftStyle = css`
  :root .ant-drawer {
    height: calc(100vh - 80px);
    margin: 0;
    div.ant-drawer-content-wrapper {
      border-radius: 0px;
      .ant-drawer-content {
        background: var(--acx-neutrals-10);
        border-top-left-radius: 24px;
        border-bottom-left-radius: 24px;
        .ant-drawer-header {
          border: 0px;
        }
      }
    }
  }
`
const styles = {
  default: '',
  fullHeight: fullHeightStyle,
  left: leftStyle,
  modalLeft: modalLeftStyle
}

export const DrawerStyle = createGlobalStyle<{ $type: DrawerTypes }>`
  ${props => styles[props.$type]}
`

const getStepsFormStyle = (width: number | string) => {
  const parsedWidth = typeof width === 'number'
    ? width - 50
    : isNaN(parseInt(width, 10))
      ? 0
      : parseInt(width, 10) -50

  return `
    .ant-pro-steps-form {
      width: ${parsedWidth}px;
    }
    [class*="styledComponents__ActionsContainer"] {
      display: flex;
      justify-content: flex-end;
      width: ${parsedWidth}px;
      min-width: unset;
      background-color: transparent;
      &:before {
        position: unset;
      }
      .ant-space-horizontal {
        flex-direction: row-reverse;
      }
    }
  `
}

export const Drawer = styled(AntDrawer)<{ width: number | string }>`
  .ant-drawer-body {
    display: flex;
    flex-direction: column;

    ${({ width }) => getStepsFormStyle(width)}
  }
`

export const BackButton = styled.button`
  border: none;
  background: transparent;
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  padding: 0;
  padding-bottom: 8px;
  &:hover {
    cursor: pointer;
  }
`

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const SubTitle = styled.div`
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  padding-top: 8px;
  color: var(--acx-neutrals-60);
  font-weight: var(--acx-headline-5-font-weight);
`

export const History = styled.div`
  .duration {
    margin: 0 -20px;
    border-bottom: 1px solid var(--acx-neutrals-30);
    &:last-of-type {
      border: 0px;
    }
    &:first-of-type .title{
      margin-top: -40px;
    }
    .title {
      font-size: 10px;
      font-weight: 700;
      line-height: 16px;
      color: var(--acx-neutrals-60);
      margin-bottom: 6px;
      padding: 20px 16px 0px;
      cursor: default;
    }
    .chat {
      padding: 12px 16px;
      cursor: pointer;
      &:hover {
        background: var(--acx-neutrals-80);
        color: var(--acx-primary-white);
      }
    }
  }
`
