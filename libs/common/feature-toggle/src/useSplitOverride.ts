import { useState, useEffect, useCallback } from 'react'

import { SplitSdk } from '@splitsoftware/splitio-react'

import { get } from '@acx-ui/config'

import type SplitIO from '@splitsoftware/splitio-react/types/splitio/splitio'

interface SplitOverrideResult {
  treatments: Record<string, string>;
  isReady: boolean;
  error?: Error;
}

// Cache for Split clients
const clientCache = new Map<string, SplitIO.IClient>()
const CLEANUP_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const SDK_TIMEOUT = 5000 // 5 seconds

const createClient = (overrideKey: string): SplitIO.IClient => {
  const splitKey = get('SPLIT_IO_KEY')
  const splitProxy = get('SPLIT_PROXY_ENDPOINT')

  const factory = SplitSdk({
    core: {
      authorizationKey: splitKey,
      key: overrideKey
    },
    ...(splitProxy ? { urls: { sdk: splitProxy, events: splitProxy, auth: splitProxy } } : {})
  })
  return factory.client()
}

const useSplitOverride = (overrideKey: string, featureFlags: string[]): SplitOverrideResult => {
  const [treatments, setTreatments] = useState<Record<string, string>>({})
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error>()

  const handleSDKReady = useCallback((client: SplitIO.IClient) => {
    try {
      const newTreatments = featureFlags.reduce((acc, flag) => {
        acc[flag] = client.getTreatment(flag)
        return acc
      }, {} as Record<string, string>)

      setTreatments(newTreatments)
      setIsReady(true)
      setError(undefined)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get treatments'))
      setIsReady(false)
    }
  }, [featureFlags])

  useEffect(() => {
    if (!overrideKey || !featureFlags.length) return

    let client = clientCache.get(overrideKey)
    if (!client) {
      try {
        client = createClient(overrideKey)
        clientCache.set(overrideKey, client)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create Split client'))
        setIsReady(false)
        return
      }
    }

    const handleReady = () => handleSDKReady(client!)
    client.on(client.Event.SDK_READY, handleReady)

    const timeoutId = setTimeout(() => {
      if (!isReady) {
        setError(new Error('Split SDK ready timeout'))
        setIsReady(false)
      }
    }, SDK_TIMEOUT)

    return () => {
      clearTimeout(timeoutId)
      client!.off(client!.Event.SDK_READY, handleReady)

      // Cleanup unused client after timeout
      setTimeout(() => {
        if (clientCache.has(overrideKey)) {
          clientCache.get(overrideKey)?.destroy()
          clientCache.delete(overrideKey)
        }
      }, CLEANUP_TIMEOUT)
    }
  }, [overrideKey, featureFlags, handleSDKReady, isReady])

  return { treatments, isReady, error }
}

export { useSplitOverride }
