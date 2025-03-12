import { TypedUseQueryHookResult }    from '@reduxjs/toolkit/query/react'
import { get }                        from 'lodash'
import { MessageDescriptor, useIntl } from 'react-intl'

import { Card, Tooltip } from '@acx-ui/components'
import { noDataDisplay } from '@acx-ui/utils'

import switchImg from '../../../../../assets/switch.png'

import { DetailsContainer, Image, Statistic } from './styledComponents'

export type Field = {
    key: string;
    title: MessageDescriptor;
    Component?: ({ value }: {
        value: number;
    }) => JSX.Element;
    valueFormatter?: (value: number) => string;
    infoFormatter?: (value: string) => string;
  }

export type SwitchData = {
    utilization?: {
        info: string | undefined;
        value: number | undefined;
    };
    apCount?: number | null;
    name?: string | undefined;
    mac?: string | undefined;
    model?: string | undefined;
    firmware?: string | undefined;
}

  interface SwitchDetailsCardProps {
    fields: Field[]
    data: SwitchData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    impactedSwitch: TypedUseQueryHookResult<any, any, any, any>
  }
export function DetailsCard (
  { fields, data, impactedSwitch }:
    SwitchDetailsCardProps) {
  const { $t } = useIntl()

  return <Card title={$t({ defaultMessage: 'Details' })} type='no-border'>
    <DetailsContainer>
      <Image src={switchImg} alt={$t({ defaultMessage: 'switch image' })} />
      {fields.map(({ key, title, Component, valueFormatter, infoFormatter })=>{
        const { value, info = undefined } = get(data, `${key}.value`)
          ? get(data, key) : { value: get(data, key) }
        return <Statistic
          key={key}
          title={<>{$t(title)}{info && <Tooltip.Info title={infoFormatter?.(info)}/>}</>}
          prefix={Component && <Component value={value} />}
          value={Component
            ? undefined
            : impactedSwitch.data
              ? valueFormatter ? valueFormatter(value) : value
              : noDataDisplay
          }
        />
      })}
    </DetailsContainer>
  </Card>
}