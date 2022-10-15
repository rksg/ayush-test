import { Slider  } from 'antd'
import styled      from 'styled-components/macro'


export const StyledSlider = styled(Slider)`
.ant-slider-handle {
  min-width: 12px !important; 
  height: 12px !important;
  &:before {
    content: none !important;
  }
  border: 1px solid  var(--acx-neutrals-20) !important;
}
.ant-slider-mark{
  display: none;
}
.ant-slider-rail,
&:hover .ant-slider-rail {
  height: 1.5px !important;
  background-color: var(--acx-primary-black) !important;
}
.ant-slider-track,
&:hover .ant-slider-track {
  height: 1.5px !important;
  background-color: var(--acx-primary-black) !important;
}
`
const HistogramCommom = `
  font-size: var(--acx-subtitle-6-font-size);
  text-align: center;
  color: var(--acx-neutrals-40);
`
export const HistogramPercentageDesc = styled.span`${HistogramCommom}`

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

export const Button = styled.input`
  color: white;
  background-color: black;
  height: 20px;
  border-radius: 10px;
  font-size: 10px;
  outline: none;
  border: none;
  transition: opacity .1s;
  cursor: pointer;
  opacity: 0.5;
  cursor: not-allowed;
  margin-right: 5px;
  width : 35px;
  text-align : center;
  font-size: var(--acx-subtitle-6-font-size);
`
export const BtnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px
`