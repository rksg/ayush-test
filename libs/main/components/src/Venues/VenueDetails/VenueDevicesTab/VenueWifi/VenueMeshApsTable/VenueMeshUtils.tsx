import { List, Tooltip } from 'antd'
import { useIntl }       from 'react-intl'

import {
  ApSignalExcellentDown,
  ApSignalExcellentUp,
  ApSignalGoodDown,
  ApSignalGoodUp,
  ApSignalLowDown,
  ApSignalLowUp,
  ApSignalPoorDown,
  ApSignalPoorUp
} from '@acx-ui/icons'
import { APMeshRole } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { ApSingleIcon, ArrowCornerIcon, SpanStyle, WiredIcon } from '../styledComponents'

export function venueNameColTpl (
  name: string, meshRole: string, id: string, intl: ReturnType<typeof useIntl>){
  const icon = {
    [APMeshRole.RAP]: <ArrowCornerIcon />,
    [APMeshRole.MAP]: <ApSingleIcon />,
    [APMeshRole.EMAP]: <WiredIcon />,
    [APMeshRole.DISABLED]: ''
  }
  const tooltipTitle = {
    [APMeshRole.RAP]: intl.$t({ defaultMessage: 'Root AP' }),
    [APMeshRole.MAP]: intl.$t({ defaultMessage: 'Mesh AP' }),
    [APMeshRole.EMAP]: intl.$t({ defaultMessage: 'eMesh AP' }),
    [APMeshRole.DISABLED]: intl.$t({ defaultMessage: 'disabled' })
  }
  return (
    <Tooltip title={tooltipTitle[meshRole as APMeshRole]}>
      <TenantLink to={`devices/wifi/${id}/details/overview`}>
        {icon[meshRole as APMeshRole]}
        {name}
      </TenantLink>
    </Tooltip>
  )
}

export const getNamesTooltip = (object: { count: number, names: string[] },
  intl: ReturnType<typeof useIntl>, maxShow = 10) => {
  if (!object || object.count === 0) {
    return
  }

  interface NamesDataType {
    key: React.Key
    name: string
  }
  const data: NamesDataType[] = []
  let names: string[]
  let key: number = 1
  names = object.names.slice(0, maxShow)
  if (names && object.names.length > 0) {
    names.forEach(name => {
      data.push({ key, name })
      key++
    })
    if (object.count > maxShow) {
      const lastRow = intl.$t({
        defaultMessage: 'And {total} more' }, { total: object.count - maxShow })
      data.push({ key, name: lastRow })
    }

    return (<List
      dataSource={data}
      renderItem={item => <List.Item><SpanStyle>{item.name}</SpanStyle></List.Item>}
    />)
  }

  return
}

export function getSnrIcon (snr: number, isUpRssi: boolean):
  React.FunctionComponent<React.SVGProps<SVGSVGElement>> {
  if (snr > 40) return isUpRssi ? ApSignalExcellentDown : ApSignalExcellentUp
  if (snr > 25) return isUpRssi ? ApSignalGoodDown : ApSignalGoodUp
  if (snr > 15) return isUpRssi ? ApSignalLowDown : ApSignalLowUp
  return isUpRssi ? ApSignalPoorDown : ApSignalPoorUp
}

export function getSignalStrengthTooltip (i: ReturnType<typeof useIntl>, snr: number): string {
  if (snr > 40) return i.$t({ defaultMessage: 'Excellent' })
  if (snr > 25) return i.$t({ defaultMessage: 'Good' })
  if (snr > 15) return i.$t({ defaultMessage: 'Low' })
  return i.$t({ defaultMessage: 'Poor' })
}