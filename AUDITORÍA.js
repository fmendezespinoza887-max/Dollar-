// === AUDITORÍA FORENSE ===
class ForensicAuditor {
    constructor() {
        this.auditLog = [];
        this.anomalyDetector = new AnomalyDetector();
    }

    logEvent(event) {
        const auditEvent = {
            ...event,
            forensicId: this.generateForensicId(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            fingerprint: this.generateBrowserFingerprint()
        };

        this.auditLog.push(auditEvent);
        this.anomalyDetector.analyze(auditEvent);
        
        // Enviar a blockchain simulada
        this.broadcastToValidators(auditEvent);
        
        return auditEvent;
    }

    generateForensicId() {
        const time = Date.now();
        const random = crypto.getRandomValues(new Uint8Array(8));
        return `FID_${time}_${Array.from(random).map(b => b.toString(16)).join('')}`;
    }

    generateBrowserFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.hardwareConcurrency,
            navigator.deviceMemory,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            !!window.sessionStorage,
            !!window.localStorage,
            navigator.languages.join(',')
        ];
        
        return this.hashString(components.join('|'));
    }
}
