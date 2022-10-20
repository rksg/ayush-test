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
  margin-bottom: 10px
`
export const HistogramConfig = styled.div`
font-size: var(--acx-subtitle-6-font-size);
display: flex;
flex-direction: column;
-webkit-box-pack: start;
justify-content: flex-start;
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
  margin-bottom: 8px
`
export const BtnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px
`