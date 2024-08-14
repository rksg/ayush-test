/* eslint-disable max-len */
import { MessageDescriptor } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

export type IconValue = { order: number, label: MessageDescriptor }

// move to where we define EnhanceIntent?
export type StatusTrail = Array<{
  status: string //Lowercase<StateType>
  createdAt?: string
}>

export type IntentKPIConfig = {
  key: string;
  label: MessageDescriptor;
  format: ReturnType<typeof formatter>;
  deltaSign: '+' | '-' | 'none';
  valueAccessor?: (value: number[]) => number;
  valueFormatter?: ReturnType<typeof formatter>;
  showAps?: boolean;
  filter?: CallableFunction
}
