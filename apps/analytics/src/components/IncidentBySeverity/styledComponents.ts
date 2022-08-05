import styled from 'styled-components/macro'

import { Subtitle } from '@acx-ui/components'

export const Title = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`
export const IncidentCount = styled(Subtitle).attrs({ level: 1 })`
  margin-bottom: 0 !important;
`
export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`
