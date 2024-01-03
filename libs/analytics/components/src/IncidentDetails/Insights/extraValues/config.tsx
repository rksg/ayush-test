import { Incident } from '@acx-ui/analytics/utils'

import { RogueAPsDrawerLink } from './RogueAPsDrawer'

export const extraValues: Record<string,Function> = {
  RogueAPsDrawerLink: (incident: Incident) => (text: string) =>
    <RogueAPsDrawerLink incident={incident}>{text}</RogueAPsDrawerLink>
}
