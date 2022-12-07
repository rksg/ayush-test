import { List } from 'antd'
import styled   from 'styled-components'

export const DeviceList = styled(List)`
    .ant-list-items {
        max-height: 180px;
        overflow: overlay;
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