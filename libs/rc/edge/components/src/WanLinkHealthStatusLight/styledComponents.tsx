import styled from 'styled-components'

export const StyledWanLinkTargetWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: baseline;
  color: var(--acx-primary-white);

  & > span:not(.ant-badge) {
    margin-right: 16px;  
  }

  & .ant-badge.ant-badge-status {
    display: flex;
    align-items: center;
    & .ant-badge-status-text {
      color: var(--acx-primary-white);
    }
  }
`