import { StartClient } from "@tanstack/react-start/client"
import { StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"

import { registerPwaServiceWorker } from "@/lib/pwa"

void registerPwaServiceWorker().catch(() => {})

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>
)
