// ? Dependencias
import { WebWorkerMLCEngineHandler } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm"

// ? Instanciamos el handler
const handler = new WebWorkerMLCEngineHandler()

// ? Esta función se ejecuta cuando el worker recibe un mensaje
self.onmessage = (msg) => {
  handler.onmessage(msg)
}