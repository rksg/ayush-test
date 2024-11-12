import { VenueExtended } from '@acx-ui/rc/utils'

import { ConfigTemplateVenueOverrideProps } from './Venue'

type OverrideComponentPropsType = ConfigTemplateVenueOverrideProps
export type OverrideComponentType = (props: OverrideComponentPropsType) => JSX.Element

export type OverrideEntitiyType = Partial<VenueExtended>
export type OverrideDisplayViewType = (props: { entity: OverrideEntitiyType }) => JSX.Element
