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
`

