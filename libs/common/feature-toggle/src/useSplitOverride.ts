import { useState, useEffect } from 'react'

import { SplitSdk } from '@splitsoftware/splitio-react'

import { get } from '@acx-ui/config'

import type SplitIO from '@splitsoftware/splitio-react/types/splitio/splitio'

interface ClientCache {
  [key: string]: SplitIO.IClient;
}

interface CleanupTimers {
  [key: string]: NodeJS.Timeout;
}

// Cache for Split clients to avoid recreating them
const clientCache: ClientCache = {}
const cleanupTimers: CleanupTimers = {} // Tracks when to clean up unused clients

const CLIENT_CLEANUP_TIMEOUT = 5 * 60 * 1000 // 5 minutes

const useSplitOverride = (overrideKey: string, featureFlags: string[]) => {
  const [treatments, setTreatments] = useState<Record<string, string>>({})
  const [isReady, setIsReady] = useState(false)

  const splitKey = get('SPLIT_IO_KEY')
  const splitProxy = get('SPLIT_PROXY_ENDPOINT')

  useEffect(() => {
    if (!overrideKey || !featureFlags || featureFlags.length === 0) return

    // Clear any pending cleanup for this key (prevents premature cleanup)
    if (cleanupTimers[overrideKey]) {
      clearTimeout(cleanupTimers[overrideKey])
      delete cleanupTimers[overrideKey]
    }

    // Check if a client already exists for this key
    if (!clientCache[overrideKey]) {
      const factory = SplitSdk({
        core: {
          authorizationKey: splitKey,
          key: overrideKey
        },
        ...(splitProxy ? { urls: {
          sdk: splitProxy,
          events: splitProxy,
          auth: splitProxy
        } } : {}),
        debug: false // set this value to true for running in debug mode for debugging in local development only
      })
      clientCache[overrideKey] = factory.client()
    }

    const client = clientCache[overrideKey]

    const handleSDKReady = () => {
      const newTreatments: Record<string, string> = {}
      featureFlags.forEach(flag => {
        newTreatments[flag] = client.getTreatment(flag)
      })
      setTreatments(newTreatments)
      setIsReady(true)
    }

    client.on(client.Event.SDK_READY, handleSDKReady)

    return () => {
      // Delay cleanup to remove the client if unused for too long
      cleanupTimers[overrideKey] = setTimeout(() => {
        client.destroy()
        delete clientCache[overrideKey]
        delete cleanupTimers[overrideKey]
      }, CLIENT_CLEANUP_TIMEOUT)

      client.off(client.Event.SDK_READY, handleSDKReady)
    }
  }, [overrideKey, featureFlags, splitKey, splitProxy])

  return { treatments, isReady }
}

export { useSplitOverride }
