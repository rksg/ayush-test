import React from 'react'

import { Space } from 'antd'
import styled    from 'styled-components/macro'

import type { SpaceProps } from 'antd'

interface SpaceWrapperProps extends SpaceProps {
    ref?: React.ForwardedRef<HTMLDivElement>;
    children: React.ReactNode;
    justifycontent?: 'flex-start' | 'flex-end'
    | 'center' | 'space-between' | 'space-around' | 'space-evenly';
}

const StyledSpace = styled(Space)<SpaceWrapperProps>`
    width: 100%;
    height: 100%;
    justify-content: ${(props) => props.justifycontent || 'center'};
`
export const SpaceWrapper = React.forwardRef((props: SpaceWrapperProps, ref) => {
  return (
    <StyledSpace
      ref={ref as React.MutableRefObject<HTMLDivElement>}
      {...props}
    >
      {props.children}
    </StyledSpace>
  )
})