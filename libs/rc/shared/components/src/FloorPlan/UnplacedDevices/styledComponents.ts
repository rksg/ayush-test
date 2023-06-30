import { List }    from 'antd'
import { XYCoord } from 'react-dnd'
import styled      from 'styled-components'

import { Dropdown } from '@acx-ui/components'

export const OverlayContainer = styled(Dropdown.OverlayContainer)`
    border: 1px solid var(--acx-neutrals-30);
    box-shadow: 0px 6px 16px rgba(51, 51, 51, 0.15);
`

export const DeviceList = styled(List)`
    .ant-list-header {
        padding-top: 4px;
        border-bottom: unset;
    }
    .ant-list-footer {
        padding-bottom: 4px;
    }
    .ant-list-items {
        max-height: 180px;
        overflow: scroll;
        margin: 0 -16px;
    }
`

export const ListItem = styled(List.Item)<{ isdragging: boolean }>`
    opacity: ${props => props.isdragging ? '0.5' : '1' };
    border: ${props => props.isdragging ? '1px dashed var(--acx-neutrals-40) !important' : 'none' };
    padding: 8px 8px !important;
    margin: 2px 16px;
    border-radius: 4px;
    background: var(--acx-neutrals-15);
    display: flex;
    align-items: center;
    justify-content: start;
    align-content: center;
    cursor: move;

    &:hover {
        box-shadow: 0px 4px 8px var(--acx-neutrals-30);
    }
`

export const CustomDeviceMarker = styled('div')<{ clientOffset: XYCoord }>`
    transform: translate(${props => props.clientOffset?.x}px,
    ${props => props.clientOffset.y}px);
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
`
