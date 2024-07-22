import styled from 'styled-components'

import { Button as AntButton } from '@acx-ui/components'

export const PreviewContainer = styled.div<{ backgroundColor?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  max-width: 360px;
  ${props => props.backgroundColor ? `background-color: ${props.backgroundColor};` : ''}
`

export const Icon = styled.div`
  width: 105x;
  height: 105px;
  
  margin: 24px;

  svg {
    width: 100%;
    height: 100%;
  }
`

export const Title = styled.div<{ color?: string }>`
  ${props => props.color ? `color: ${props.color};` : ''}
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 4px;
`

export const Body = styled.div<{ color?: string }>`
  ${props => props.color ? `color: ${props.color};` : ''}
  font-size: 14px;
  padding: 20px 0;
`

export const Button = styled(AntButton)<{ backgroundColor?: string }>`
  ${props => props.color ? `color: ${props.color};` : ''}
  ${props => props.backgroundColor ? `background-color: ${props.backgroundColor} !important;` : ''}
`