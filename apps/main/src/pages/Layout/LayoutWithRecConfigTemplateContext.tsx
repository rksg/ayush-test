import { useRef } from 'react'

import { ConfigTemplateContext, SaveEnforcementConfigFnType } from '@acx-ui/rc/utils'
import { Outlet }                                             from '@acx-ui/react-router-dom'

export function LayoutWithRecConfigTemplateContext () {
  const saveEnforcementConfigFnRef = useRef<SaveEnforcementConfigFnType>()

  const setSaveEnforcementConfigFn = (fn: SaveEnforcementConfigFnType) => {
    saveEnforcementConfigFnRef.current = fn
  }

  const saveEnforcementConfig = async (templateId: string) => {
    if (templateId && saveEnforcementConfigFnRef.current) {
      await saveEnforcementConfigFnRef.current(templateId)
    }
  }

  return <ConfigTemplateContext.Provider
    value={{
      isTemplate: true,
      templateContext: 'REC',
      setSaveEnforcementConfigFn,
      saveEnforcementConfig
    }}>
    <Outlet />
  </ConfigTemplateContext.Provider>
}
