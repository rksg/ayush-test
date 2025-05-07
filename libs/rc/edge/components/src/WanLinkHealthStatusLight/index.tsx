import { Space, Badge } from 'antd'
import { useIntl }      from 'react-intl'

import { Tooltip }                                  from '@acx-ui/components'
import { defaultSort, EdgeWanLinkHealthStatusEnum } from '@acx-ui/rc/utils'

import { StyledWanLinkTargetWrapper } from './styledComponents'

type EdgeWanLinkHealthStatusLightProps = {
  status: EdgeWanLinkHealthStatusEnum,
  targetIpStatus: { ip: string, status: EdgeWanLinkHealthStatusEnum }[] | undefined
}

export const EdgeWanLinkHealthStatusLight = (props: EdgeWanLinkHealthStatusLightProps) => {
  const { $t } = useIntl()
  const { status, targetIpStatus } = props

  const EdgeWanLinkHealthStatusLightConfig = {
    [EdgeWanLinkHealthStatusEnum.UP]: {
      color: 'var(--acx-semantics-green-50)',
      text: $t({ defaultMessage: 'Up' })
    },
    [EdgeWanLinkHealthStatusEnum.DOWN]: {
      color: 'var(--acx-semantics-red-50)',
      text: $t({ defaultMessage: 'Down' })
    }
  }

  return <Badge
    color={EdgeWanLinkHealthStatusLightConfig[status].color}
    text={<Tooltip
      placement='bottom'
      dottedUnderline
      title={targetIpStatus
        ? <Space direction='vertical'>
          {targetIpStatus
            .sort((a, b) => defaultSort(a.ip, b.ip))
            .map(({ ip, status }) => {
              const config = EdgeWanLinkHealthStatusLightConfig[status]
              return <StyledWanLinkTargetWrapper key={ip} size={10}>
                <span>{ip}</span>
                <Badge
                  key={ip}
                  color={config.color}
                  text={config.text}
                />
              </StyledWanLinkTargetWrapper>
            })}
        </Space>
        : ''}
    >
      {EdgeWanLinkHealthStatusLightConfig[status].text}
    </Tooltip>}
  />
}