import { HydrationScript } from 'solid-js/web'

export function Document() {
  return (
    <html>
      <head>
        <HydrationScript />
      </head>
      <body>
        <App />
        <script type="module" src="/src/entry-client.jsx" />
      </body>
    </html>
  )
}

function App() {
  return <p id="text">V1</p>
}
