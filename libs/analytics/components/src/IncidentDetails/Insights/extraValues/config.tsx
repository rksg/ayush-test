import { Incident } from '@acx-ui/analytics/utils'

import { RogueAPsDrawerLink } from './RogueAPsDrawer'

import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat'

export type FormatMessageValue = React.ReactNode
  | PrimitiveType
  | FormatXMLElementFn<React.ReactNode, React.ReactNode>

export const extraValues: Record<string, (incident: Incident) => FormatMessageValue> = {
  RogueAPsDrawerLink: (incident) => (children) => <RogueAPsDrawerLink {...{ incident, children }} />
}
