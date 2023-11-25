import { createContext } from 'react'

import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { ApGroupEditPageHeader } from './ApGroupEditPageHeader'
import { ApGroupGeneralTab }     from './ApGroupGeneralTab'
import { ApGroupVlanRadioTab }   from './ApGroupVlanRadioTab'


export const ApGroupEditContext = createContext({} as {
    isApGroupTableFlag: boolean
    isEditMode: boolean
})

const tabs = {
  general: ApGroupGeneralTab,
  vlanRadio: ApGroupVlanRadioTab
}

export function ApGroupEdit () {
  const isApGroupTableFlag = useIsSplitOn(Features.AP_GROUP_TOGGLE)
  const { activeTab = 'general', action } = useParams()
  const isEditMode = action === 'edit'
  const Tab = tabs[activeTab as keyof typeof tabs]

  return (
    <ApGroupEditContext.Provider value={{ isEditMode, isApGroupTableFlag }} >
      <ApGroupEditPageHeader />
      {Tab && <Tab />}
    </ApGroupEditContext.Provider>
  )
}