import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { TagsOutline, TagsSolid } from '@acx-ui/icons'

export const MainGroupListLayout = styled('div')`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  max-height: calc( 100vh - 450px);
  min-height: 450px;

  div.ant-radio-group{
    width: 100%
  }

  label.ant-radio-wrapper-in-form-item {
    display: flex;
    width: 100%;
    padding: 3px;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
  }

  label.ant-radio-wrapper-checked {
    display: flex;
    width: 100%;
    padding: 3px;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
    background: var(--acx-accents-orange-20);
  }

  .ant-card{
    min-height: 430px;
    padding-left: 0;
    padding-right: 0;
  }
  
  .ant-radio-inner{
    display: none;
  }

  .label-class {
    padding-top: 2px;
  }
`

export const SubGroupListLayout = styled('div')`
  display: flex;
  flex-direction: column;
  max-height: calc( 100vh - 450px);
  min-height: 450px;

  label.ant-checkbox-wrapper-in-form-item {
    display: flex;
    padding: 3px;
    width: 100%;
    margin-left: 8px;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
  }

  .ant-card {
    min-height: 430px;
    padding-left: 0;
    padding-right: 0;
  }

  .ant-radio-inner {
    display: none;
  }
`

export const Module = styled.div`
  padding-bottom: 10px;
  div.lightblue.ant-checkbox-group {
    padding-top: 10px;
    padding-bottom: 20px;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
    grid-gap: 5px;
    grid-auto-flow: column;
    justify-content: start;
    > label.ant-checkbox-wrapper {
      width: 20px;
      height: 20px;
      align-items: center;
      border: 1px solid var(--acx-neutrals-60);
      background-color: white;
      margin-right: 0px;

      > span:first-child {
        display: none;
      }
    }

    > label.ant-checkbox-wrapper:has(.ant-checkbox-disabled)  {
      width: 20px;
      height: 20px;
      align-items: center;
      background-color: var(--acx-neutrals-15);
      border: solid 1px var(--acx-neutrals-25);
      margin-right: 0px;
    }

    > label.ant-checkbox-wrapper-checked {
      background-color: #d7f8fb;
      border: solid 1px #5de0ec;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }

    > label:nth-child(even) p {
      margin-top: 2px;
      margin-left: -2px;
      text-align: center;
    }

    > label:nth-child(odd) p {
      margin-top: -37px;
      margin-left: -2px;
      text-align: center;
    }
  }
  
  div.purple.ant-checkbox-group {
    padding-top: 10px;
    padding-bottom: 20px;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
    grid-gap: 5px;
    grid-auto-flow: column;
    justify-content: start;
    > label.ant-checkbox-wrapper {
      width: 20px;
      height: 20px;
      align-items: center;
      border: 1px solid var(--acx-neutrals-60);
      background-color: white;
      margin-right: 0px;

      > span:first-child {
        display: none;
      }
    }
    
    > label.ant-checkbox-wrapper:has(.ant-checkbox-disabled)  {
      width: 20px;
      height: 20px;
      align-items: center;
      background-color: var(--acx-neutrals-15);
      border: solid 1px var(--acx-neutrals-25);
      margin-right: 0px;
    }

    > label.ant-checkbox-wrapper-checked {
      background-color: #dcc9ed;
      border: solid 1px #7025b6;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }

    > label:nth-child(even) p {
      margin-top: 2px;
      margin-left: -2px;
      text-align: center;
    }

    > label:nth-child(odd) p {
      margin-top: -37px;
      margin-left: -2px;
      text-align: center;
    }
  }

  .ant-checkbox + span {
    padding: 0;
    width: 20px;
    height: 20px;
  }
`

export const TagsOutlineIcon = styled(TagsOutline)`
  display: flex;
  width: 16px;
  height: auto;
  path {
    fill: var(--acx-primary-white);
  }
`

export const TagsSolidIcon = styled(TagsSolid)`
  display: flex;
  width: 16px;
  height: auto;
  path {
    fill: var(--acx-primary-white);
  }
`

export const TooltipTitle = styled(Space)`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-neutrals-40);  
`

export const TagsTitle = styled(Space)`
  display: flex;
  padding: 4px 0;
  gap: 4px !important;
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-neutrals-40);
`

export const PortSpan = styled.div`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  padding-left: 20px;
`

export const CardStyle = styled.div`
  background-color: var(--acx-neutrals-10);
  height: auto;
  margin-bottom: 20px;
  border-radius: 4px;
  .ant-typography {
    font-size: 12px;
  }
  .title {
    font-size: 12px;
    font-weight: 700;
    padding: 8px 20px;
    background-color: var(--acx-neutrals-20);
    margin: 0 !important;
  }
  .content {
    padding: 12px 20px;
  }
  &:last-child {
    margin-bottom: 60px;
  }
`