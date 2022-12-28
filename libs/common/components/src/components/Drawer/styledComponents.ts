import { Drawer as AntDrawer } from 'antd'
import styled                  from 'styled-components'

export const Drawer = styled(AntDrawer)`
  .ant-drawer-body {
    display: flex;
    flex-direction: column;

    .ant-form.ant-form-horizontal {
      .ant-form-item {
        margin-bottom: 0;
        .ant-row {
          align-items: baseline;
        }
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
      }
    }
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
