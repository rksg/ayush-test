
import { FlagFilled } from '@ant-design/icons'
import styled         from 'styled-components/macro'


export const StyledFlagFilled = styled(FlagFilled)`
  color: ${(props) => props.color || 'grey'};
 `