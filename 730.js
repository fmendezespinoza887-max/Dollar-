// === MONITOR DE INTEGRIDAD EN TIEMPO REAL ===
class IntegrityMonitor {
    constructor() {
        this.mutationObserver = null;
        this.protectionActive = true;
        this.init();
    }

    init() {
        // 1. Protección contra consola
        this.protectConsole();
        
        // 2. Observador de mutaciones DOM
        this.setupDOMMonitor();
        
        // 3. Protección de localStorage/sessionStorage
        this.protectStorage();
        
        // 4. Monitoreo de red
        this.monitorNetwork();
    }

    protectConsole() {
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        // Redirigir console a registro interno
        ['log', 'error', 'warn', 'info'].forEach(method => {
            console[method] = (...args) => {
                // Registrar en WORM
                WORM.append({
                    type: 'CONSOLE_' + method.toUpperCase(),
                    data: args.map(arg => 
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    ).join(' '),
                    timestamp: Date.now()
                });
                
                // Opcional: mostrar en producción
                if (method === 'error') {
                    originalConsole.error('[FGME]', ...args);
                }
            };
        });
    }

    setupDOMMonitor() {
        // Configurar MutationObserver
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (this.protectionActive && mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            this.handleUnauthorizedDOM(node);
                        }
                    });
                }
            });
        });

        // Observar todo el documento
        this.mutationObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
    }

    handleUnauthorizedDOM(node) {
        // Verificar si es código autorizado
        const isAuthorized = node.hasAttribute('data-fgme-authorized');
        
        if (!isAuthorized) {
            WORM.append({
                type: 'UNAUTHORIZED_DOM_MODIFICATION',
                data: node.outerHTML || node.nodeValue,
                action: 'REMOVED'
            });
            
            node.remove(); // Eliminar nodo no autorizado
        }
    }
}
