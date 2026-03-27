## Redux

[Redux](https://redux.js.org/) is a JS library for predictable and maintainable global state management.
It helps you write applications that behave consistently, run in different
environments (client, server, and native), and are easy to test.
On top of that, it provides a great developer experience, such as
 [live code editing combined with a time traveling debugger](https://github.com/reduxjs/redux-devtools) .

The whole global state of your app is stored in an object tree inside a single *store*.
The only way to change the state tree is to create an *action*, an object describing what happened, and *dispatch* it to the store.
To specify how state gets updated in response to an action, you write pure *reducer*
functions that calculate a new state based on the old state and the action.

Redux Toolkit simplifies the process of writing Redux logic and setting up the store.
With Redux Toolkit, the basic app logic looks like:

```tsx
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    incremented: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    decremented: state => {
      state.value -= 1
    }
  }
})

export const { incremented, decremented } = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer
})

// Can still subscribe to the store
store.subscribe(() => console.log(store.getState()))

// Still pass action objects to `dispatch`, but they're created for us
store.dispatch(incremented())
// {value: 1}
store.dispatch(incremented())
// {value: 2}
store.dispatch(decremented())
// {value: 1}

```

Instead of mutating the state directly, you specify the mutations you want to happen with plain objects called *actions*.
Then you write a special function called a *reducer* to decide how every action transforms the entire application's *state*.

In a typical Redux app, there is just a single store with a single root reducer function.
As your app grows, you split the root reducer into smaller reducers independently operating on the different parts of the state tree.
This is exactly like how there is just one root component in a React app, but it is composed out of many small components.

This architecture might seem like a lot for a counter app, but the beauty of this pattern is how well it scales to large and complex apps.
It also enables very powerful developer tools, because it is possible to trace every mutation to the action that caused it.
You can record user sessions and reproduce them just by replaying every action.

Redux Toolkit allows us to write shorter logic that's easier to read, while still following the same Redux behavior and data flow.

## Redux toolkit

The Redux Toolkit package is intended to be the standard way to write Redux logic.
It was originally created to help address three common concerns about Redux:

- "Configuring a Redux store is too complicated"
- "I have to add a lot of packages to get Redux to do anything useful"
- "Redux requires too much boilerplate code"

## Tools that will be used within the example project

### configureStore()

[configureStore()](https://redux-toolkit.js.org/api/configureStore): wraps createStore to provide simplified configuration options and good defaults.
It can automatically combine your slice reducers, adds whatever Redux middleware
you supply, includes `redux-thunk` by default, and enables use of the Redux DevTools Extension.

A standard Redux store setup typically requires multiple pieces of configuration:

- Combining the slice reducers into the root reducer
- Creating the middleware enhancer, usually with the thunk middleware or other side effects middleware, as well as middleware that might be used for development checks
- Adding the Redux DevTools enhancer, and composing the enhancers together
- Calling `createStore`

Legacy Redux usage patterns typically required several dozen lines of copy-pasted boilerplate to achieve this.

Redux Toolkit's `configureStore` simplifies that setup process, by doing all that work for you. One call to configureStore will:

- Call `combineReducers` to combine your slices reducers into the root reducer function
- Add the thunk middleware and called `applyMiddleware`
- In development, automatically add more middleware to check for common mistakes like accidentally mutating the state
- Automatically set up the Redux DevTools Extension connection
- Call `createStore` to create a Redux store using that root reducer and those configuration options

`configureStore` also offers an improved API and usage patterns compared to the original `createStore`
by accepting named fields for `reducer`, `preloadedState`, `middleware`, `enhancers`, and `devtools`, as well as much better TS type inference.

```tsx
import { configureStore } from '@reduxjs/toolkit'

import rootReducer from './reducers'

const store = configureStore({ reducer: rootReducer })
// The store now has redux-thunk added and the Redux DevTools Extension is turned on

```

### createSlice()

[createSlice()](https://redux-toolkit.js.org/api/createSlice): accepts an object of reducer functions,
a "slice name", and an initial state value, and automatically generates a slice reducer
with corresponding action creators and action types.

```tsx
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
  value: number
}

const initialState = { value: 0 } satisfies CounterState as CounterState

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value++
    },
    decrement(state) {
      state.value--
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer

```

### createSelector()

[createSelector()](https://redux-toolkit.js.org/api/createSelector) utility
from the  [Reselect](https://github.com/reduxjs/reselect)  library, re-exported for ease of use.
Reselect exports a *createSelector* API, which generates memoized selector functions.
*createSelector* accepts one or more input selectors, which extract values from arguments,
and a result function function that receives the extracted values and should return a derived value.
If the generated output selector is called multiple times,
the output will only be recalculated when the extracted values have changed.

- Selectors can compute derived data, allowing *Redux* to store the minimal possible state.
- Selectors are efficient. A selector is not recomputed unless one of its arguments changes.
- Selectors are composable. They can be used as input to other selectors.

```tsx
const memoizedSelectCompletedTodos = createSelector(
[(state: RootState) => state.todos],
todos => {
  console.log('memoized selector ran')
  return todos.filter(todo => todo.completed === true)
}
)

```

### createEntityAdapter()

[createEntityAdapter()](https://www.notion.so/callstack/createEntityAdapter): generates a set of reusable reducers and selectors
for performing CRUD operations to manage normalized data in the store

```tsx
import {
  createEntityAdapter,
  createSlice,
  configureStore,
} from '@reduxjs/toolkit'

type Book = { bookId: string; title: string }

const booksAdapter = createEntityAdapter({
  // Assume IDs are stored in a field other than 'book.id'
  selectId: (book: Book) => book.bookId,
  // Keep the "all IDs" array sorted based on book titles
  sortComparer: (a, b) => a.title.localeCompare(b.title),
})

const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState(),
  reducers: {
    // Can pass adapter functions directly as case reducers.  Because we're passing this
    // as a value, 'createSlice' will auto-generate the 'bookAdded' action type / creator
    bookAdded: booksAdapter.addOne,
    booksReceived(state, action) {
      // Or, call them as "mutating" helpers in a case reducer
      booksAdapter.setAll(state, action.payload.books)
    },
  },
})

const store = configureStore({
  reducer: {
    books: booksSlice.reducer,
  },
})

type RootState = ReturnType<typeof store.getState>

console.log(store.getState().books)
// { ids: [], entities: {} }

// Can create a set of memoized selectors based on the location of this entity state
const booksSelectors = booksAdapter.getSelectors<RootState>(
  (state) => state.books,
)

// And then use the selectors to retrieve values
const allBooks = booksSelectors.selectAll(store.getState())

```

### CRUD Functions

The primary content of an entity adapter is a set of generated reducer functions for adding, updating, and removing entity instances from an entity state object:

- `addOne`: accepts a single entity, and adds it if it's not already present.
- `addMany`: accepts an array of entities or an object in the shape of `Record<EntityId, T>`, and adds them if not already present.
- `setOne`: accepts a single entity and adds or replaces it
- `setMany`: accepts an array of entities or an object in the shape of `Record<EntityId, T>`, and adds or replaces them.
- `setAll`: accepts an array of entities or an object in the shape of `Record<EntityId, T>`, and replaces all existing entities with the values in the array.
- `removeOne`: accepts a single entity ID value, and removes the entity with that ID if it exists.
- `removeMany`: accepts an array of entity ID values, and removes each entity with those IDs if they exist.
- `removeAll`: removes all entities from the entity state object.
- `updateOne`: accepts an "update object" containing an entity ID and an object containing one or more new field values to update inside a changes field, and performs a shallow update on the corresponding entity.
- `updateMany`: accepts an array of update objects, and performs shallow updates on all corresponding entities.
- `upsertOne`: accepts a single entity. If an entity with that ID exists, it will perform a shallow update and the specified fields will be merged into the existing entity, with any matching fields overwriting the existing values. If the entity does not exist, it will be added.
- `upsertMany`: accepts an array of entities or an object in the shape of `Record<EntityId, T>` that will be shallowly upserted.

Each method has a signature that looks like:

```tsx
(state: EntityState<T>, argument: TypeOrPayloadAction<Argument<T>>) => EntityState<T>

```

In other words, they accept a state that looks like `{ids: [], entities: {}}`, and calculate and return a new state.

These CRUD methods may be used in multiple ways:

- They may be passed as case reducers directly to `createReducer` and `createSlice`.
- They may be used as "mutating" helper methods when called manually, such as a separate hand-written call to `addOne()` inside of an existing case reducer, if the `state` argument is actually an Immer `Draft` value.
- They may be used as immutable update methods when called manually, if the `state` argument is actually a plain JS object or array.

### Get InitialState

Returns a new entity state object like `{ids: [], entities: {}}`.

It accepts an optional object as an argument. The fields in that object will be merged into the returned initial state value. For example, perhaps you want your slice to also track some loading state:

```tsx
const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState({
    loading: 'idle',
  }),
  reducers: {
    booksLoadingStarted(state, action) {
      // Can update the additional state field
      state.loading = 'pending'
    },
  },
})

```

### Selector functions

The entity adapter will contain a `getSelectors()` function that returns a set of selectors that know how to read the contents of an entity state object:

- `selectIds`: returns the `state.ids` array.
- `selectEntities`: returns the `state.entities` lookup table.
- `selectAll`: maps over the state.ids array, and returns an array of entities in the same order.
- `selectTotal`: returns the total number of entities being stored in this state.
- `selectById`: given the state and an entity ID, returns the entity with that ID or `undefined`.

Each selector function will be created using the `createSelector` function from Reselect, to enable memoizing calculation of the results.