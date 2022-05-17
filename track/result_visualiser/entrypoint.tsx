import { ChakraProvider } from "@chakra-ui/react"
import ReactDOM from "react-dom/client"
import { TestRunResultVisualizer } from "."

function renderVisualisation(element: HTMLElement, payload: any) {
  const root = ReactDOM.createRoot(element)
  root.render(
    <ChakraProvider>
      <TestRunResultVisualizer payload={payload} />
    </ChakraProvider>
  )
}

;(window as any).renderVisualisation = renderVisualisation
