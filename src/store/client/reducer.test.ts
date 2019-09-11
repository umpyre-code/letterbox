import { reducer } from './reducer'

test('new_client_reducer', () => {
  let state
  state = reducer(
    {
      authSubmitting: false,
      clientLoading: false,
      clientReady: false,
      credentialsLoading: false,
      credentialsReady: false,
      newClientSubmitting: true,
      phoneVerifying: false,
      reload: false
    },
    {
      payload: {
        client_id: '648ce922c2794b34b4f11d146b68dad2',
        jwt: {
          secret: 'SG1uF5fNJmIatw0lOFqULiEUHUbUP7NLmaJvnGkg5LjMpxhlBP',
          token:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTU5NTM2ODEsImlhdCI6MTU2NDQxNzY4MSwiaXNzIjoiVW1weXJlIiwianRpIjoiOGQxZmY2ZjE3YmIxNDEwYWFhOGFjNWQ5ZTk1OGE5OWYiLCJuYmYiOjE1NjQ0MTc5ODEsInN1YiI6IjY0OGNlOTIyYzI3OTRiMzRiNGYxMWQxNDZiNjhkYWQyIn0.m3WKTr_5fraEbqcaen6W9-zL57kGT3O42T1XKfji4Sw'
        }
      },
      type: '@@client/SUBMIT_NEW_CLIENT_SUCCESS'
    }
  )
  expect(state).toEqual({
    authSubmitting: false,
    clientLoading: false,
    clientReady: false,
    credentials: {
      client_id: '648ce922c2794b34b4f11d146b68dad2',
      jwt: {
        secret: 'SG1uF5fNJmIatw0lOFqULiEUHUbUP7NLmaJvnGkg5LjMpxhlBP',
        token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTU5NTM2ODEsImlhdCI6MTU2NDQxNzY4MSwiaXNzIjoiVW1weXJlIiwianRpIjoiOGQxZmY2ZjE3YmIxNDEwYWFhOGFjNWQ5ZTk1OGE5OWYiLCJuYmYiOjE1NjQ0MTc5ODEsInN1YiI6IjY0OGNlOTIyYzI3OTRiMzRiNGYxMWQxNDZiNjhkYWQyIn0.m3WKTr_5fraEbqcaen6W9-zL57kGT3O42T1XKfji4Sw'
      }
    },
    credentialsLoading: false,
    credentialsReady: false,
    newClientSubmitting: false,
    phoneVerifying: false,
    reload: false
  })
})
