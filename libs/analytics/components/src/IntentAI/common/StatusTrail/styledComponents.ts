import styled from 'styled-components'

export const DateLabel = styled.span`
  color: var(--acx-neutrals-50);
  margin-right: 10px;
`

export const Wrapper = styled.div`
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-font-weight);
  line-height: 18px;
  max-height: 150px;
  overflow-y: auto;
  overflow-x: hidden;
`

export const FootnoteWrapper = styled.div`
  color: var(--acx-neutrals-50);
  line-height: 1.5;
`

export const StatusTrailWrapper = styled.div<{ shouldShowLimitedText: boolean }>`
  padding-bottom: ${({ shouldShowLimitedText }) => (shouldShowLimitedText ? '18px' : '0px')};
`
