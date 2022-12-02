import styled, { css } from 'styled-components/macro'

import {  PlusSquareOutlined, MinusSquareOutlined } from '@acx-ui/icons'



const eventIconStyle = css`
  position: relative;
  display: inline-block;
  top: -5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  line-height: 16px;
  margin-right: 3px;
`
export const History = styled.div`
  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-25);
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ant-list-item-meta-avatar {
    margin-right: 2px;
}
`
export const HistoryContentTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--acx-primary-black);
`
export const HistoryIcon = styled.span`
  margin-left : auto;
  margin-right: 16px;
  cursor: pointer;
`
export const EventTypeIcon = styled.span`
  ${eventIconStyle}
  background-color: var(${props => props.color});
`
export const IncidentEvent = styled.span`
  display: inline-block;
  border-radius: 8px;
  background-color: var(${props => props.color});
  font-size: 8px;
  height: 12px;
  width: 16px;
  color: var(--acx-primary-white);  
  font-weight: var(--acx-body-font-weight-bold);
  margin-left:-5px;
  line-height: 12px;
  text-align: center;
  vertical-align: top;
`
export const StyledPlusSquareOutlined = styled(PlusSquareOutlined)`
   width: 16px; 
   path{
      stroke:var(--acx-accents-blue-50);
    }`
export const StyledMinusSquareOutlined = styled(MinusSquareOutlined)`
   width: 16px;
   path{
      stroke:var(--acx-accents-blue-50);
    }`
export const TimelineTitle = styled.span`
   line-height: 24px;
   font-weight: var(--acx-body-font-weight-bold);
   font-size: 12px;`
