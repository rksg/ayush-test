import { Drawer as AntDrawer }       from 'antd'
import styled, { createGlobalStyle } from 'styled-components'

export enum DrawerTypes {
  Default = 'default',
  FullHeight = 'fullHeight',
  Dark='dark'
}

export const DrawerStyle = createGlobalStyle<{ $type: DrawerTypes }>`
  ${props => props.$type === DrawerTypes.FullHeight ? `
    .ant-drawer-content-wrapper {
      height: 100vh;
      margin-top: calc(-1 * var(--acx-drawer-top-space));
    }` : props.$type === DrawerTypes.Dark ? `
    :root .ant-drawer {
      height: calc(100vh - var(--acx-header-height));
      margin-top: var(--acx-header-height);
      div.ant-drawer-content-wrapper {
        border-radius: 0px;
        .ant-drawer-content {
          background: var(--acx-neutrals-15);
          .ant-drawer-header {
            border: 0px;
          }
        }
      }
  }` : ''}
`

export const Drawer = styled(AntDrawer)`
  .ant-drawer-body {
    display: flex;
    flex-direction: column;
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
