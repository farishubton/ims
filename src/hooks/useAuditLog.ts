import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/schema';

export function useAuditLog(entityType?: string, entityId?: number) {
  const logs = useLiveQuery(
    () => {
      const query = db.auditLogs.orderBy('timestamp').reverse();
      
      if (entityType && entityId !== undefined) {
        return query.filter(log => log.entityType === entityType && log.entityId === entityId).limit(50).toArray();
      }
      
      return query.limit(100).toArray();
    },
    [entityType, entityId]
  );

  return {
    logs: logs || [],
    loading: !logs,
  };
}
