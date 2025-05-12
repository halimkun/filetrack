import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const payload = {
    client_id: config.public.clientId,
    grant_type: config.public.grantType ?? 'password',
    client_secret: config.public.clientSecret,
    scope: [
      'document:approve',
      'document.general:view', 'document.general:manage',
      'document.komite:view', 'document.komite:manage',
      'document.other:view', 'document.other:manage',
    ],
    username: body.username,
    password: body.password,
  }

  const response = await $fetch(`${config.public.API_V2_URL}/oauth/token`, {
    method: 'POST',
    body: payload,
  })

  return response
})
