import styled from 'styled-components/macro'

import { Drawer } from '@acx-ui/components'

export const MelissaDrawer = styled(Drawer)`
    .ant-drawer-header {
        background: linear-gradient(#2B4181,#223878,#263C7B);
        margin: 0px !important;
        padding: 8px 10px 8px 10px !important;
    }
    .ant-drawer-title {
        color: white;
        font-family: 'Montserrat';
    }
    .ant-drawer-close {
        padding-top: 8px;
    }
    .ant-drawer-close > svg > path{
        stroke: #FFF;
    }
`