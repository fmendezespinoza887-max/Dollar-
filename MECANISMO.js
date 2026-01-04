// === MECANISMO DE AUTO-CURACIÓN ===
class SelfHealingSystem {
    constructor() {
        this.backupState = null;
        this.healthChecks = [];
        this.setupHealthMonitor();
    }

    setupHealthMonitor() {
        // Chequeos periódicos de integridad
        setInterval(() => this.runHealthChecks(), 5000);
        
        // Capturar estado inicial
        this.captureInitialState();
    }

    captureInitialState() {
        this.backupState = {
            html: document.documentElement.outerHTML,
            css: Array.from(document.styleSheets)
                .map(sheet => {
                    try {
                        return Array.from(sheet.cssRules || [])
                            .map(rule => rule.cssText)
                            .join('\n');
                    } catch (e) {
                        return '';
                    }
                })
                .join('\n'),
            scripts: Array.from(document.scripts)
                .filter(script => !script.src)
                .map(script => script.textContent)
                .join('\n'),
            timestamp: Date.now()
        };
    }

    async runHealthChecks() {
        const checks = [
            this.checkHTMLIntegrity(),
            this.checkScriptProtection(),
            this.checkStyleProtection(),
            this.checkWORMOperation()
        ];

        const results = await Promise.all(checks);
        const failed = results.filter(r => !r.healthy);
        
        if (failed.length > 0) {
            await this.triggerHealing(failed);
        }
    }

    async triggerHealing(failedChecks) {
        WORM.append({
            type: 'SELF_HEALING_TRIGGERED',
            data: failedChecks.map(f => f.check),
            action: 'RESTORING_FROM_BACKUP'
        });

        // Restaurar elementos afectados
        failedChecks.forEach(check => {
            switch (check.check) {
                case 'HTML_INTEGRITY':
                    this.restoreHTML();
                    break;
                case 'SCRIPT_PROTECTION':
                    this.reinjectScripts();
                    break;
            }
        });
    }
}
