import { Slider  } from 'antd'
import styled      from 'styled-components/macro'


export const StyledSlider = styled(Slider)`
.ant-slider .ant-slider-rail {
  background-color: #7a7474 !important;
},
.ant-slider-handle {
  min-width: 12px !important; 
  height: 12px !important;
  &:before {
    content: none !important;
  }
}
.ant-slider-mark{
  display: none;
}
`
const HistogramCommom = `
  font-size: var(--acx-subtitle-6-font-size);
  text-align: center;
  color: var(--acx-neutrals-40);
`
export const HistogramPercentageDesc = styled.span`${HistogramCommom}`

export const HistogramPercentageVal = styled.span`
  color: var(--acx-primary-black);
`
export const HistogramConfig = styled.div`
font-size: 12px;
display: flex;
flex-direction: column;
-webkit-box-pack: start;
justify-content: flex-start;
`
export const HistogramInfo = styled.span`
  margin: 2.5px 10px;
`