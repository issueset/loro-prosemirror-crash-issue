[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/issueset/loro-prosemirror-crash-issue)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/issueset/loro-prosemirror-crash-issue)

1. `bun install`
2. `bun run dev`
3. Open `http://localhost:5173` in your browser
4. Type something in the editor
5. Get the error

```
hook.js:608 panicked at crates/loro-internal/src/state/container_store/container_wrapper.rs:41:42:
called `Option::unwrap()` on a `None` value
```
