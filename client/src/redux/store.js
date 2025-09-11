import { combineReducers, configureStore } from '@reduxjs/toolkit'
import  userReducer  from '../redux/user/userSlice.js'
import {persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { persistStore } from 'redux-persist'

// Create a specific persist config for user reducer
const userPersistConfig = {
  key: 'user',
  storage,
  blacklist: ['loading'] // Exclude loading from persistence
}

// Apply persist config to user reducer
const persistedUserReducer = persistReducer(userPersistConfig, userReducer)

const rootReducer = combineReducers({
  user: persistedUserReducer
})

export const store = configureStore({
  reducer: rootReducer,
  middleware : (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck :false,
  })
})

export const persistor = persistStore(store)

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch