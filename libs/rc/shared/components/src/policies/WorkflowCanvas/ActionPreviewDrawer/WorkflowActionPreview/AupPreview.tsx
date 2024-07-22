
import { AupIcon }                  from '@acx-ui/icons'
import { AupAction, UIColorSchema } from '@acx-ui/rc/utils'

import { StepNavigation } from './StepNavigation'
import * as UI            from './styledComponent'


export function AupPreview (props: { data?: AupAction }) {
  const { data } = props
  const uiColorSchema: UIColorSchema = {
    titleFontColor: 'red',
    bodyFontColor: 'red',
    backgroundColor: 'yellow',

    buttonColor: 'blue',
    buttonFontColor: 'orange'
  }

  return (<UI.PreviewContainer>
    <UI.Icon>
      <AupIcon/>
    </UI.Icon>
    <UI.Title>
      {data?.title}
    </UI.Title>
    <UI.Body color={uiColorSchema.bodyFontColor}>
      {data?.messageHtml}
    </UI.Body>

    <StepNavigation
      onBack={() => {console.log('onBack')}}
      onNext={() => {console.log('onNext')}}
    />
  </UI.PreviewContainer>
  )
}
