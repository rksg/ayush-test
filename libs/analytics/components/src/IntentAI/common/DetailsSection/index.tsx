import * as UI from './styledComponents'

const DetailsSection = (props: React.HTMLAttributes<HTMLDivElement>) => <UI.Wrapper {...props} />
DetailsSection.Title = UI.Title
DetailsSection.Details = UI.Details

export { DetailsSection }
