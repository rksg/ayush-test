import React from 'react'
export const DataSubscriptionsForm = React.lazy(() => import('./DataSubscriptionsForm'))
export const DataSubscriptionsContent = React.lazy(() => import('./DataSubscriptionsContent'))
export const DataSubscriptionsAuditLog = React.lazy(() => import('./DataSubscriptionsAuditLog'))
export const DataSubscriptionsCloudStorage = React.lazy(
  () => import('./DataSubscriptionsCloudStorage')
)
