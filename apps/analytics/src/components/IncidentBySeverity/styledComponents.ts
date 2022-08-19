import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const Title = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  margin-bottom: 3px;
`
export const IncidentCount = styled(Typography.Title).attrs({ level: 1 })`
  margin-bottom: 0 !important;
`
export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`
