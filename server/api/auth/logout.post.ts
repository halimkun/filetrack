import { defineEventHandler, getHeader, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    return sendError(event, createError({ statusCode: 401, message: 'Unauthorized: No token provided' }))
  }

  try {
    const result = await $fetch(`${config.public.API_V2_URL}/user/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Logout result:', result)

    return { success: true, result }
  } catch (err: any) {
    console.error('Logout error:', err)

    return sendError(event, createError({
      statusCode: err?.response?.status || 500,
      message: err?.response?._data?.message || 'Logout failed',
    }))
  }
})
