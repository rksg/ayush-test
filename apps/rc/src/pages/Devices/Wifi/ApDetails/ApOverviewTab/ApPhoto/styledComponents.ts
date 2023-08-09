import { Space } from 'antd'
import styled    from 'styled-components/macro'


import {
  ArrowsOut,
  PhotoSolid,
  Plus,
  Minus
} from '@acx-ui/icons'

export const StyledSpace = styled(Space)`
  position: absolute;
  top: 10px;
  right: 20px;
  text-align: center;
  z-index: 1;
`

export const PhotoDiv = styled.div`
  margin: 0 auto;

  .ant-image-img{
    max-height: 125px;
    vertical-align: middle;
    padding-bottom: 8px;
  }
`
export const RoundIconDiv = styled.div`
  width: 28px;
  height: 28px;
  background-color: var(--acx-neutrals-10);
  border-radius: 15px;
  padding: 4px;
  cursor: pointer;
`

export const PhotoIcon = styled(PhotoSolid)`
width: 20px;
height: 20px;
path:nth-of-type(1){
    fill: var(--acx-accents-blue-50);
}
path:nth-of-type(2){
    stroke: var(--acx-accents-blue-50);
}
path:nth-of-type(3){
    stroke: var(--acx-accents-blue-50);
}
`

export const ArrowsOutIcon = styled(ArrowsOut)`
width: 20px;
height: 20px;
path{
    stroke: var(--acx-accents-blue-50);
}
`

export const PlusIcon = styled(Plus)`
  path {
    stroke: #333333;
    fill: #333333;
  }
`

export const MinusIcon = styled(Minus)`
  path {
    stroke: #333333;
    fill: #333333;
  }
`

export const AppContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .crop-container {
    position: absolute;
    top: 50px;
    left: 20px;
    right: 20px;
    bottom: 200px;
  }
  
  .controls {
    position: absolute;
    bottom: 150px;
    left: 50%;
    width: 70%;
    transform: translateX(-50%);
    height: 40px;
    display: flex;
    align-items: center;

    .ant-slider-handle:before{
      content: ''
    }

    svg:hover{
      path {
        stroke-width: 2px; /*Between 1px and 2px*/
      }
    }
  }

  .description {
    position: absolute;
    left: 5%;
    bottom: 100px;
    padding: 20px;
    height: 40px;
  }
  
  .slider {
    padding: 22px 0px;
  }
`

export const DotsDiv = styled.div`
  position: absolute;
  left: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  bottom: 0;
  padding-bottom: 5px;

  .dot {
    width: 8px;
    height: 8px;
    background: var(--acx-neutrals-25);
    border-radius: 50%;
    margin: 0 3px;
    cursor: pointer;
  }

  .active-dot {
    background: var(--acx-neutrals-50);
    cursor: default;
  }
`

export const FooterDiv = styled.div`
  .ant-drawer-footer{
    justify-content: start;
  }
`