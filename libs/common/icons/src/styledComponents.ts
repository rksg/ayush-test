import styled from 'styled-components/macro'

import {
  Blocked,
  DeleteOutlined, EditOutlined,
  LeafOutlined, LeafSolid,
  LinkDocument, LinkVideo
} from './index'

export const DeleteOutlinedIcon = styled(DeleteOutlined)`
  path {
    stroke: var(--acx-accents-blue-50) !important;
  }
`
export const EditOutlinedIcon = styled(EditOutlined)`
  path {
    stroke: var(--acx-accents-blue-50) !important;
  }
`

export const EditOutlinedDisabledIcon = styled(EditOutlined)`
  path {
    stroke: var(--acx-neutrals-40) !important;
  }
`
export const DeleteOutlinedDisabledIcon = styled(DeleteOutlined)`
  path {
    stroke: var(--acx-neutrals-40) !important;
  }
`

export const LeafSolidIcon = styled(LeafSolid)`
  vertical-align: middle;
  path {
    fill: var(--acx-semantics-green-50);
  }
`

export const LeafOutlinedIcon = styled(LeafOutlined)`
  path {
    stroke: var(--acx-semantics-green-50);
  }
`

export const LinkDocumentIcon = styled(LinkDocument)`
  path {
    fill: var(--acx-accents-blue-50);
  }
`

export const LinkVideoIcon = styled(LinkVideo)`
  path {
    fill: var(--acx-accents-blue-50);
  }
`
export const PersonaBlockedIcon = styled(Blocked)`
  path {
    stroke: var(--acx-semantics-red-50) !important;
  }
`
