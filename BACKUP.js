// === BACKUP EN TIEMPO REAL ===
class MemoryBackupSystem {
    constructor() {
        this.snapshots = new Map();
        this.snapshotInterval = null;
        this.maxSnapshots = 10;
    }

    start() {
        // Tomar snapshot cada 30 segundos
        this.snapshotInterval = setInterval(() => {
            this.takeSnapshot();
        }, 30000);

        // Primer snapshot inmediato
        this.takeSnapshot();
    }

    takeSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            html: this.serializeDOM(),
            state: this.captureApplicationState(),
            hash: this.calculateDOMHash()
        };

        // Almacenar en memoria
        this.snapshots.set(snapshot.timestamp, snapshot);
        
        // Mantener solo últimos N snapshots
        if (this.snapshots.size > this.maxSnapshots) {
            const oldest = Array.from(this.snapshots.keys()).sort()[0];
            this.snapshots.delete(oldest);
        }

        WORM.append({
            type: 'SNAPSHOT_CREATED',
            timestamp: snapshot.timestamp,
            size: JSON.stringify(snapshot).length,
            hash: snapshot.hash
        });
    }

    serializeDOM() {
        // Serializar solo elementos críticos
        const criticalElements = document.querySelectorAll('[data-fgme-immutable]');
        return Array.from(criticalElements)
            .map(el => el.outerHTML)
            .join('\n');
    }

    restoreSnapshot(timestamp) {
        const snapshot = this.snapshots.get(timestamp);
        if (!snapshot) return false;

        // Reemplazar DOM
        const container = document.querySelector('[data-fgme-container]');
        if (container) {
            container.innerHTML = this.parseSnapshot(snapshot.html);
            
            WORM.append({
                type: 'SNAPSHOT_RESTORED',
                timestamp: snapshot.timestamp,
                success: true
            });
            
            return true;
        }
        return false;
    }
}
