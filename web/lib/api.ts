import axios, { AxiosError } from 'axios'
import User from '../types/User'

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
})

export class ApiError extends Error {
  public status?: number

  constructor(error: AxiosError) {
    if (!error.isAxiosError) throw error

    if (error.response?.data) {
      const { message, statusCode } = error.response.data
      super(message)
      this.status = statusCode
    } else if (error.code) {
      super(error.code)
    } else {
      super(error.message)
    }
  }
}

async function register(
  user: Omit<User, 'id'> & { password: string },
): Promise<User> {
  try {
    const response = await client.post<User>('/users', user)
    return response.data
  } catch (error) {
    throw new ApiError(error)
  }
}

async function login(email: string, password: string): Promise<User> {
  try {
    const response = await client.post<User>('/tokens', { email, password })
    return response.data
  } catch (error) {
    throw new ApiError(error)
  }
}

async function getCurrentUser(cookie?: string): Promise<User | null> {
  const config = cookie
    ? {
        headers: {
          cookie,
        },
      }
    : undefined

  try {
    const response = await client.get<User>('/users/me', config)
    return response.data
  } catch (error) {
    if (error.response?.status === 401) return null
    throw new ApiError(error)
  }
}

async function logout(): Promise<void> {
  try {
    await client.delete<void>('/tokens')
  } catch (error) {
    throw new ApiError(error)
  }
}

async function updateUser(
  id: number,
  user: Omit<User, 'id'> & { password?: string },
): Promise<User> {
  try {
    const response = await client.put<User>(`/users/${id}`, user)
    return response.data
  } catch (error) {
    throw new ApiError(error)
  }
}

export default {
  getCurrentUser,
  login,
  logout,
  register,
  updateUser,
}
