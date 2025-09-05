// Client-side API helpers - no MongoDB imports

// Email Authentication helpers
export const signInWithEmail = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  const result = await response.json()
  if (!response.ok) {
    return { data: null, error: { message: result.error } }
  }
  
  return { data: result.data, error: null }
}

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName })
  })
  
  const result = await response.json()
  if (!response.ok) {
    return { data: null, error: { message: result.error } }
  }
  
  return { data: result.data, error: null }
}

export const signOut = async () => {
  return { error: null }
}

// User profile helpers
export const createUserProfile = async (userId: string, profile: any) => {
  const response = await fetch('/api/users/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...profile })
  })
  
  const result = await response.json()
  if (!response.ok) {
    return { data: null, error: { message: result.error } }
  }
  
  return { data: result.data, error: null }
}

export const getUserProfile = async (userId: string) => {
  const response = await fetch(`/api/users/profile?userId=${userId}`)
  const result = await response.json()
  
  if (!response.ok) {
    return { data: null, error: { message: result.error } }
  }
  
  return { data: result.data, error: null }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...updates })
  })
  
  const result = await response.json()
  if (!response.ok) {
    return { data: null, error: { message: result.error } }
  }
  
  return { data: result.data, error: null }
}
