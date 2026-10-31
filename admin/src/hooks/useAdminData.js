import { useCallback, useEffect, useState } from 'react'

export function useAdminData(loader, dependencies = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)

  const reload = useCallback(() => {
    setLoading(true)
    setError('')
    setRevision((value) => value + 1)
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve()
      .then(loader)
      .then((result) => {
        if (active) setData(result)
      })
      .catch((requestError) => {
        if (active) {
          setData(null)
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  // `dependencies` are page-specific stable primitive values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, revision])

  return { data, setData, error, loading, reload }
}
