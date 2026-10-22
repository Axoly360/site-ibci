// Service worker mínimo: torna o site instalável no Android. Não guarda nada
// em cache de propósito — as áreas logadas (membro, EBD, secretaria) mostram
// dados que mudam e não podem aparecer defasados.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
