import styled from 'styled-components/macro'


/* eslint-disable max-len */
export const Wrapper = styled.div`

.ant-picker:hover,
.ant-picker-focused  {
    border-color: var(--acx-accents-blue-50);
    box-shadow: 0 0 0 2px rgb(84 150 233/20%)
    }
.ant-picker-panel-container {
    border-radius: 0px 4px 4px 0;
    background: var(--acx-primary-white);
}   
.ant-picker-range .ant-picker-active-bar {
    background: var(--acx-accents-blue-50);
    }
.acx-range-picker-popup {
  & .ant-picker-panel {border: none;}
  & .ant-picker-header-super-prev-btn,
  & .ant-picker-header-super-next-btn{
    display: none;
}
  & .acx-calender {
    & .ant-picker-footer{
      display: none;
    }
  }
 .ant-picker-ranges{
  position: absolute;
  left: -122px;
  width: 22%;
  display: flex;
  flex-direction: column;
  background-color:var(--acx-neutrals-10);
  height: 95%;
  padding: 20px;
  top: 9px;
  border-radius: 4px 0 0 4px;

 } 
.ant-picker-footer-extra{
  background-color:white;
  padding: 0
}
.ant-picker-panels{
  background-color:white;
}

.calender-range-apply-row{
  background-color:var(--acx-neutrals-10); 
  height: 48px;
  align-items: center;
}
.ant-picker-ranges .ant-picker-preset > .ant-tag-blue {
  color: black;
  background: var(--acx-neutrals-10);
  border-color: var(--acx-neutrals-10);
  cursor: pointer;
}

.ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner, 
.ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
.ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {
  color: #fff;
  background: var(--acx-accents-blue-50);
  border-radius: 20px
}
.ant-picker-cell-in-view.ant-picker-cell-range-hover .ant-picker-cell-inner::before,
.ant-picker-cell-in-view.ant-picker-cell-range-hover-start .ant-picker-cell-inner::before,
.ant-picker-cell-in-view.ant-picker-cell-range-hover-end .ant-picker-cell-inner::before,
{
  background: var(--acx-accents-blue-10);
}
.ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover::before, 
.ant-picker-cell-in-view.ant-picker-cell-range-start.ant-picker-cell-range-hover::before, 
.ant-picker-cell-in-view.ant-picker-cell-range-end.ant-picker-cell-range-hover::before, 
.ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single).ant-picker-cell-range-hover-start::before, 
.ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single).ant-picker-cell-range-hover-end::before, 
.ant-picker-panel > :not(.ant-picker-date-panel) .ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover-start::before, 
.ant-picker-panel > :not(.ant-picker-date-panel) .ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover-end::before,
.ant-picker-cell-in-view.ant-picker-cell-in-range::before,
.ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single)::before,
.ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single)::before{
  background: var(--acx-accents-blue-10);
}
.ant-picker-date-panel .ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover-start .ant-picker-cell-inner::after, 
.ant-picker-date-panel .ant-picker-cell-in-view.ant-picker-cell-in-range.ant-picker-cell-range-hover-end .ant-picker-cell-inner::after{
  background: var(--acx-accents-blue-10);
}

.ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before{
  border-color: var(--acx-accents-blue-50);
}
.ant-picker-cell-in-view.ant-picker-cell-range-hover:not(.ant-picker-cell-in-range)::after,
.ant-picker-cell-in-view.ant-picker-cell-range-hover-start:not(.ant-picker-cell-in-range)::after,
.ant-picker-cell-in-view.ant-picker-cell-range-hover-end:not(.ant-picker-cell-in-range)::after {
  border-color : var(--acx-accents-blue-50);
}
.ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single):not(.ant-picker-cell-range-end) .ant-picker-cell-inner,
.ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single):not(.ant-picker-cell-range-start) .ant-picker-cell-inner{
border-radius: 20px
}
.ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
    background: var(--acx-accents-blue-10);
}
.ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before{
    border-radius: 20px
}
}`