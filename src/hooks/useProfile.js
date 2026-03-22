import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetch a profile by date code.
 * Returns { profile, loading, error }.
 */
export function useProfile(dateCode) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!dateCode) return

    setLoading(true)
    setError(null)

    supabase
      .from('profiles')
      .select('*')
      .eq('date_code', dateCode.toUpperCase())
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProfile(data)
        setLoading(false)
      })
  }, [dateCode])

  return { profile, loading, error }
}
