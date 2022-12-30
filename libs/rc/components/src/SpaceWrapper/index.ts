import { Space } from 'antd'
import styled    from 'styled-components/macro'

import type { SpaceProps } from 'antd'

interface SpaceWrapperProps extends SpaceProps {
    justifyContent?: 'flex-start' | 'flex-end'
    | 'center' | 'space-between' | 'space-around' | 'space-evenly';
}

export const SpaceWrapper = styled(Space)<SpaceWrapperProps>`
width: 100%;
height: 100%;
justify-content: ${(props) => props.justifyContent || 'center'};
`