import { EdgeStatusEnum } from '@acx-ui/rc/utils'

import StatusLight from '../../../components/StatusLight'

type EdgeStatusLightProps = {
  data: string
}

const EdgeStatusLightConfig = {
  [EdgeStatusEnum.REQUIRES_ATTENTION]: {
    color: '--acx-semantics-red-50',
    text: EdgeStatusEnum.REQUIRES_ATTENTION
  },
  [EdgeStatusEnum.TEMPORARILY_DEGRADED]: {
    color: '--acx-semantics-yellow-50',
    text: EdgeStatusEnum.TEMPORARILY_DEGRADED
  },
  [EdgeStatusEnum.IN_SETUP_PHASE]: {
    color: '--acx-neutrals-50',
    text: EdgeStatusEnum.IN_SETUP_PHASE
  },
  [EdgeStatusEnum.OFFLINE]: {
    color: '--acx-neutrals-50',
    text: EdgeStatusEnum.OFFLINE
  },
  [EdgeStatusEnum.OPERATIONAL]: {
    color: '--acx-semantics-green-50',
    text: EdgeStatusEnum.OPERATIONAL
  }
}

export const EdgeStatusLight = (props: EdgeStatusLightProps) => {
  return (
    <StatusLight config={EdgeStatusLightConfig} data={props.data} />
  )
}
