import { Badge } from 'antd'
import styled    from 'styled-components'

export const StarRatingContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, 1fr);
  grid-gap: var(--acx-content-vertical-space) var(--acx-content-horizontal-space);
  margin-top: 20px;
`

export const StarRatingItemContainer = styled.div`
  display: flex;
  gap: 7px;
`

export const SparklineContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, 1fr);
  grid-gap: var(--acx-content-vertical-space) var(--acx-content-horizontal-space);
  margin-top: 20px;
`

export const SparklineItemContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  grid-template-rows: 1fr;
  align-items: center;
`

export const SparklineText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const ShortText = styled.span`
  font-size: var(--acx-body-4-font-size);
  color: var(--acx-neutrals-50);
`

export const SparklineBadge = styled(Badge)`
  color: var(--acx-primary-black);
`

export const StarsContainer = styled.div`
  display: flex;
  margin-left: auto;
`