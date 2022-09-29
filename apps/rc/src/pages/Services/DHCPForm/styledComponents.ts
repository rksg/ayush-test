import styled from 'styled-components/macro'

import {
  Button
} from '@acx-ui/components'
export const Diagram = styled.div`
  width: 358px;
  margin-top: 40px;
`

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-50);
  margin-top: 4px;
`

export const FieldExtraTooltip = styled.div`
  margin-bottom: 20px;
`
export const PoolAddButton = styled(Button)`
  top: 36px;
  background-color: transparent;
  right: -650px;
  z-index: 1;
  color: var(--acx-accents-blue-50);
  font-weight: 600;
  border: 0px;
  cursor: pointer;
  font-size: 12px;
`
export const CancelButton = styled(Button)`
  top: 10px;
  right: -600px;
  z-index: 1;
  background-color: transparent;
  font-weight: 600;
  border: 0px;
  cursor: pointer;
  font-size: 14px;
  color: var(--acx-accents-blue-50);

`
export const AddButton = styled(Button)`
  top: 10px;
  right: -600px;
  z-index: 1;
  background-color: var(--acx-accents-blue-50);
  font-weight: 600;
  border: 0px;
  cursor: pointer;
  font-size: 14px;
`

export const AntLabel = styled.label`
  color: var(--acx-neutrals-60);
`
