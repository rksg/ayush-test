import { useRef } from 'react'

import { Outlet } from '@acx-ui/react-router-dom'

import { ConfigTemplateContext, SaveEnforcementConfigFnType } from './ConfigTemplateContext'

export function LayoutWithConfigTemplateContext () {
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
      setSaveEnforcementConfigFn,
      saveEnforcementConfig
    }}>
    <Outlet />
  </ConfigTemplateContext.Provider>
}
