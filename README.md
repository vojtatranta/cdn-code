# Check the code for CDN77

I used CRAP to get the code running from my older project.

I chosed a TDD snippet I wrote that is trying to resolve conflicts between multiple sources of the same JSON file stored in the backend.

I picked this because it is simple and well testable code. You can take look at [Avocode Forever](https://inspect.ceros.com//) (now running under Ceros brand) to check the whole project we made together where this code ran.

The former Avocode app is available as a freemium.

## Check the code

The files are:

```
./src/variable-utils.ts
./src/variable-utils.spec.ts
```

## Scripts to run

### `yarn test variable-utils.spec.ts`

The tests are passing and were passing right when I copied the code :).

Run:

```
$ yarn test variable-utils.spec.ts
```

### `yarn start`

Only starts a webserver telling you the same.

## Some other interesting code

I was dissatisfied with the state of Redux and middleware, particulary side-effects handling.

I tried Saga or Redux Observables but it all seemed to me that it doesn't fit the architecture we developed at Avocode.

We used to use Angular-style dependency injector.

So I proposed [this change](https://github.com/reduxjs/redux-thunk/issues/277) to the `redux-thunk`. It was rejected as it was too advanced as per the community.

Nevertheless, I published it anyway to the NPM and we used it in our projects.

Check it here (https://github.com/vojtatranta/redux-thunk)
