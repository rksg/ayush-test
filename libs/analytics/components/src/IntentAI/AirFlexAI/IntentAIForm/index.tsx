// import React, { useState } from 'react'

// import _           from 'lodash'
// import { useIntl } from 'react-intl'

// import { StepsForm } from '@acx-ui/components'

// import { IntentWizardHeader } from '../../common/IntentWizardHeader'
// import { useIntentContext }   from '../../IntentContext'

// import { Introduction } from './Introduction'
// import { Priority }     from './Priority'
// import { Settings }     from './Settings'
// import { Summary }      from './Summary'

// export function IntentAIForm () {
//   const { intent } = useIntentContext()
//   const { $t } = useIntl()

//   //const queryResult = useIntentAICRRMQuery()
//   //const crrmData = queryResult.data!


//   const defaultValue = {
//     preferences: {
//       crrmFullOptimization: true
//     }
//   }

//   return (<>
//     <IntentWizardHeader />

//     <StepsForm
//       buttonLabel={{
//         submit: $t({ defaultMessage: 'Apply' })
//       }}
//       initialValues={_.merge(defaultValue, intent)}
//     >
//       <StepsForm.StepForm
//         title={$t({ defaultMessage: 'Introduction' })}
//         children={<Introduction/>}
//       />
//       <StepsForm.StepForm
//         title={$t({ defaultMessage: 'Intent Priority' })}
//         children={<Priority />}
//       />
//       <StepsForm.StepForm
//         title={$t({ defaultMessage: 'Settings' })}
//         children={<Settings />}
//       />
//       {/* <StepsForm.StepForm
//         title={$t({ defaultMessage: 'Summary' })}
//         children={<Summary
//           summaryUrlBefore={summaryUrlBefore}
//           summaryUrlAfter={summaryUrlAfter}
//           crrmData={crrmData}
//         />}
//       /> */}
//     </StepsForm>
//   </>)
// }
