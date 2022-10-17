import { Slider  } from 'antd'
import styled      from 'styled-components/macro'


export const StyledSlider = styled(Slider)`
font-size: var(--acx-subtitle-5-font-size);
position: absolute;
.ant-slider-handle {
  min-width: 15px !important; 
  height: 15px !important;
  &:before {
    content: none !important;
  }
  border: 2px solid  var(--acx-neutrals-20) !important;
  padding: 0 !important;
}
.ant-slider-mark{
  display: none;
}
.ant-slider-rail,
&:hover .ant-slider-rail {
  height: 1px !important;
  background-color: var(--acx-primary-black) !important;
}
.ant-slider-track,
&:hover .ant-slider-track {
  height: 1px !important;
  background-color: var(--acx-primary-black) !important;
}
`
export const HistogramGoalPercentage = styled.span`
  color: var(--acx-primary-black);
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  font-size: var(--acx-subtitle-5-font-size);
  margin-bottom: 20px
`
export const HistogramConfig = styled.div`
font-size: 12px;
display: flex;
flex-direction: column;
-webkit-box-pack: start;
justify-content: flex-start;
margin-top: 4px;
`
export const HistogramInfo = styled.span`
  margin: 2.5px 10px;
  font-size: var(--acx-subtitle-6-font-size);
  color: var(--acx-neutrals-40);
`
export const HistogramBoldContent = styled.span`
  color: var(--acx-primary-black);
  padding-left: 2.5px;
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  font-size: var(--acx-subtitle-6-font-size);
`
export const HistogramSpanContent = styled.span`
  color: var(--acx-primary-black);
  font-size: var(--acx-subtitle-6-font-size);
  margin-bottom: 10px
`
export const BtnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px
`
export const TooltipWrapper = styled.div`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-primary-white);

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