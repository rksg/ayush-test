import styled, { css } from 'styled-components/macro'



const eventIconStyle = css`
  position: relative;
  display: inline-block;
  top: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
`
export const History = styled.div`
  border-radius: 4px;
  border: 1px solid #E3E4E5;
  min-height: 480px;
`
export const HistoryHeader = styled.div`
  padding : 12px 0px 12px 16px;
  display : flex
`
export const HistoryContent = styled.div`
  .ant-list-item {
    border-bottom: none;
  }
  padding : 12px 16px 12px 16px;  
  .ant-list-item-meta-title {
    color: var(--acx-neutrals-70);
    font-size: 10px;
  }
  .ant-list-item-meta-description {
    color: var(--acx-primary-black);
    font-size: 10px;
    width: max-content;
  }
`
export const HistoryContentTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #333333;
`
export const HistoryIcon = styled.span`
  margin-left : auto;
  padding-right: 16px;
`
export const EventTypeIcon = styled.span`
  ${eventIconStyle}
  background-color: var(${props => props.color});
`