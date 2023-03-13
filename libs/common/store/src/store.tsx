import { configureStore, isRejectedWithValue }            from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery }                      from '@reduxjs/toolkit/query/react'
import { defineMessage, FormattedMessage }                from 'react-intl'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { dataApi, networkHealthApi }                           from '@acx-ui/analytics/services'
import { showActionModal, ActionModalType, ErrorDetailsProps } from '@acx-ui/components'
import {
  baseCommonApi as commonApi,
  baseNetworkApi as networkApi,
  baseVenueApi as venueApi,
  baseEventAlarmApi as eventAlarmApi,
  baseTimelineApi as timelineApi,
  baseServiceApi as serviceApi,
  apApi,
  baseDhcpApi as dhcpApi,
  baseMspApi as mspApi,
  baseLicenseApi as licenseApi,
  baseEdgeApi as edgeApi,
  basePolicyApi as policyApi,
  baseClientApi as clientApi,
  baseSwitchApi as switchApi,
  baseAdministrationApi as administrationApi,
  baseFirmwareApi as firmwareApi,
  baseEdgeDhcpApi as edgeDhcpApi,
  basePersonaApi as personaApi,
  baseNsgApi as nsgApi
} from '@acx-ui/rc/services'
import { getIntl } from '@acx-ui/utils'

import type { Middleware } from '@reduxjs/toolkit'

type ErrorAction = {
  type: string,
  meta: {
    baseQueryMeta: {
      response: {
        status: number
      }
    },
    arg?: {
      endpointName: string
    }
  },
  payload: {
    data?: ErrorDetailsProps
    originalStatus?: number
  }
}

interface ErrorMessageType {
  title: { defaultMessage: string },
  content: { defaultMessage: string }
}

let isModalShown = false
// TODO: workaround for skipping general error dialog
const ignoreEndpointList = [
  'addAp', 'updateAp', 'inviteDelegation', 'addRecipient', 'updateRecipient', 'getDnsServers',
  'addEdge'
]
const errorMessage = {
  SERVER_ERROR: {
    title: defineMessage({ defaultMessage: 'Server Error' }),
    content: defineMessage({
      defaultMessage: 'An internal error has occurred. Please contact support.'
    })
  },
  SESSION_EXPIRED: {
    title: defineMessage({ defaultMessage: 'Session Expired' }),
    content: defineMessage({
      defaultMessage: 'Your session has expired. Please login again.'
    })
  },
  OPERATION_FAILED: {
    title: defineMessage({ defaultMessage: 'Operation Failed' }),
    content: defineMessage({
      defaultMessage: 'The operation failed because of a request time out'
    })
  },
  REQUEST_IN_PROGRESS: {
    title: defineMessage({ defaultMessage: 'Request in Progress' }),
    content: defineMessage({
      defaultMessage: `A configuration request is currently being executed and additional
      requests cannot be performed at this time.<br></br>Try again once the request has completed.`
    })
  },
  CHECK_YOUR_CONNECTION: {
    title: defineMessage({ defaultMessage: 'Check Your Connection' }),
    content: defineMessage({
      defaultMessage: 'Ruckus Cloud needs you to be online,<br></br>you appear to be offline.'
    })
  },
  COUNTRY_INVALID: {
    title: defineMessage({ defaultMessage: 'Error' }),
    content: defineMessage({
      defaultMessage: `The service is currently not supported in the country which you entered.
      <br></br>Please make sure that you entered the correct address.`
    })
  }
}

const getErrorContent = (action: ErrorAction) => {
  const { $t } = getIntl()
  const status = action.meta.baseQueryMeta?.response?.status || action.payload?.originalStatus

  let errorMsg = {} as ErrorMessageType
  let type: ActionModalType = 'error'
  let errors = action.payload.data
  let needLogout = false
  let callback = undefined

  switch (status) {
    case 400:
      if (errors?.error === 'API-KEY not present') {
        needLogout = true
      }
      errorMsg = errorMessage.SERVER_ERROR
      break
    case 401:
    case 403:
      errorMsg = errorMessage.SESSION_EXPIRED
      type = 'info'
      needLogout = true
      break
    case 408: // request timeout
      errorMsg = errorMessage.OPERATION_FAILED
      break
    case 423:
      errorMsg = errorMessage.REQUEST_IN_PROGRESS
      errors = '' as ErrorDetailsProps
      break
    case 504: // no connection [development mode]
    case 0:   // no connection
      errorMsg = errorMessage.CHECK_YOUR_CONNECTION
      type = 'info'
      callback = () => window.location.reload()
      break
    case 422:
      const countryInvalid // TODO: check error format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        = (errors as any)?.error?.errors?.find((e:any) => e.code === 'WIFI-10114')
      if (countryInvalid) {
        errorMsg = errorMessage.COUNTRY_INVALID
      } else {
        errorMsg = errorMessage.SERVER_ERROR
      }
      break
    default:
      // TODO: shouldIgnoreErrorCode
      errorMsg = errorMessage.SERVER_ERROR
      break
  }

  return {
    title: $t(errorMsg?.title),
    content: <FormattedMessage
      {...errorMsg?.content}
      values={{ br: () => <br /> }}
    />,
    type,
    errors,
    callback,
    needLogout
  }
}

export const showErrorModal = (details: {
  title: string,
  content: JSX.Element,
  type: ActionModalType,
  errors?: ErrorDetailsProps,
  callback?: () => void
}) => {
  const { title, content, type, errors, callback } = details
  if (title && !isModalShown) {
    isModalShown = true
    showActionModal({
      type,
      title,
      content,
      ...(type === 'error' && { customContent: {
        action: 'SHOW_ERRORS',
        errorDetails: errors
      } }),
      onOk: () => {
        callback?.()
        isModalShown = false
      }
    })
  }
}

export const userApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
  tagTypes: ['UserProfile', 'Mfa'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

const errorMiddleware: Middleware = () => (next) => (action: ErrorAction) => {
  const isDevModeOn = window.location.hostname === 'localhost'
  const endpoint = action?.meta?.arg?.endpointName || ''
  if (isRejectedWithValue(action)) {
    const { needLogout, ...details } = getErrorContent(action)
    if (!ignoreEndpointList.includes(endpoint)) {
      showErrorModal(details)
    }
    if (needLogout && !isDevModeOn) {
      const token = sessionStorage.getItem('jwt')?? null
      sessionStorage.removeItem('jwt')
      window.location.href = token? `/logout?token=${token}` : '/logout'
    }
  }
  return next(action)
}

const isDev = process.env['NODE_ENV'] === 'development'
const isTest = process.env['NODE_ENV'] === 'test'

export const store = configureStore({
  reducer: {
    [commonApi.reducerPath]: commonApi.reducer,
    [networkApi.reducerPath]: networkApi.reducer,
    [venueApi.reducerPath]: venueApi.reducer,
    [eventAlarmApi.reducerPath]: eventAlarmApi.reducer,
    [timelineApi.reducerPath]: timelineApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
    [apApi.reducerPath]: apApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
    [dhcpApi.reducerPath]: dhcpApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [mspApi.reducerPath]: mspApi.reducer,
    [licenseApi.reducerPath]: licenseApi.reducer,
    [edgeApi.reducerPath]: edgeApi.reducer,
    [policyApi.reducerPath]: policyApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [switchApi.reducerPath]: switchApi.reducer,
    [administrationApi.reducerPath]: administrationApi.reducer,
    [firmwareApi.reducerPath]: firmwareApi.reducer,
    [edgeDhcpApi.reducerPath]: edgeDhcpApi.reducer,
    [personaApi.reducerPath]: personaApi.reducer,
    [networkHealthApi.reducerPath]: networkHealthApi.reducer,
    [nsgApi.reducerPath]: nsgApi.reducer
  },

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: isDev ? undefined : false,
      immutableCheck: isDev ? undefined : false
    }).concat([
      ...(!isTest ? [errorMiddleware] : []),
      commonApi.middleware,
      networkApi.middleware,
      venueApi.middleware,
      eventAlarmApi.middleware,
      timelineApi.middleware,
      dataApi.middleware,
      apApi.middleware,
      userApi.middleware,
      dataApi.middleware,
      dhcpApi.middleware,
      serviceApi.middleware,
      mspApi.middleware,
      licenseApi.middleware,
      edgeApi.middleware,
      policyApi.middleware,
      clientApi.middleware,
      switchApi.middleware,
      administrationApi.middleware,
      firmwareApi.middleware,
      edgeDhcpApi.middleware,
      personaApi.middleware,
      networkHealthApi.middleware,
      nsgApi.middleware
    ])
  },

  devTools: !isDev
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export function baseSelector (state: AppState) {
  return state
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
