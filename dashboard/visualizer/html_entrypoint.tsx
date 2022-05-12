import { TestRunVisualizer } from "."
import ReactDOM from "react-dom/client"
import { ChakraProvider } from "@chakra-ui/react"

function displayResults(element: Element, payload: string) {
  const root = ReactDOM.createRoot(element)

  root.render(
    <ChakraProvider>
      <TestRunVisualizer payload={payload} />
    </ChakraProvider>
  )
}

;(window as any).displayResults = displayResults
