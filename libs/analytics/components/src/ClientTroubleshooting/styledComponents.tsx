import { Collapse }    from 'antd'
import styled, { css } from 'styled-components/macro'

import {  PlusSquareOutlined, MinusSquareOutlined } from '@acx-ui/icons'



const eventIconStyle = css`
  display: flex;
  margin-top: 3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
`
export const History = styled.div`
  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-25);
  flex:1;
`
export const HistoryHeader = styled.div`
  padding : 12px 0 12px 16px;
  display : flex
`
export const HistoryContent = styled.div`
  .ant-list-item {
    border-bottom: none;
    padding: 0 0 8px 0;
  }
  padding : 0 16px 0px 16px;  
  .ant-list-item-meta-title {
    color: var(--acx-neutrals-70);
    font-size: var(--acx-subtitle-6-font-size);
  }
  .ant-list-item-meta-description {
    color: var(--acx-neutrals-100);
    font-size: var(--acx-subtitle-6-font-size);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ant-list-item-meta-avatar {
    margin-right: 5px;
  }
  overflow: auto;
`
export const HistoryContentTitle = styled.span`
  font-weight: 600;
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
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
  margin: 2px 0 0 -8px;
  text-align: center;
  vertical-align: top;
  line-height: 12px;
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

export const TimelineSubContent = styled.span`
   line-height: 16px;
   font-weight: var(--acx-body-font-weight);
   font-size: 12px;`
export const CollapseBox = styled(Collapse)`
  .ant-collapse-content {
    margin-left : 30px;
    };
   .ant-collapse-header {
    padding-bottom: 0px !important;
    padding-right: 0px !important;
   };`
export const TooltipWrapper = styled.div`
   font-size: var(--acx-body-5-font-size);
   line-height: var(--acx-body-5-line-height);
   color: var(--acx-primary-white);
   max-width: 200px;
   white-space: normal;
   word-wrap: break-word;
 
   time { font-weight: var(--acx-body-font-weight-bold); }
 
   > ul {
     padding: 0px;
     margin: 0px;
     list-style-type: none;
     padding-top: 4px;
   }
   > li {
     font-weight: var(--acx-body-font-weight);
     margin-bottom: 4px;
     &:is(:last-child) { margin-bottom: unset; }
   }
 `