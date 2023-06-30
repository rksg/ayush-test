/* eslint-disable max-len */
import { Modal }        from 'antd'
import Draggable        from 'react-draggable'
import { ResizableBox } from 'react-resizable'
import styled           from 'styled-components/macro'


//reference from https://github.com/ant-design/ant-design/issues/32604
export const UIResizableBox = styled(ResizableBox)`
.react-resizable {
  position: relative;
}
.react-resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  bottom: 0;
  right: 0;
  background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+");
  background-position: bottom right;
  padding: 0 3px 3px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: se-resize;
}

.ant-modal-body{
  padding: 0px;
}

.dialog-wrapper {
  padding: 0px;
}

.react-resizable-handle {
  right: 0px;
}

`

export const UIDraggable = styled(Draggable)`
.ant-modal-body{
  padding: 0px;
}
.dialog-wrapper{
  padding: 0px;
}
`

export const UIModal = styled(Modal)`
.ant-modal-body{
  padding: 0px;
  background: var(--acx-neutrals-100);
}
.dialog-wrapper{
  padding: 0px;
}

.ant-modal-header{
  background-color: var(--acx-primary-black);
}

.ant-modal-title {
  color: white;
}

.ant-modal-close-x{
  color: white;
}
`