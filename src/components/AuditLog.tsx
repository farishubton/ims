import { useAuditLog } from '@/hooks/useAuditLog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface AuditLogProps {
  entityType?: string;
  entityId?: number;
}

export function AuditLog({ entityType, entityId }: AuditLogProps) {
  const { logs, loading } = useAuditLog(entityType, entityId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Track all changes and actions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No activity yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{formatDate(log.timestamp)}</TableCell>
                  <TableCell className="capitalize">{log.entityType}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        log.action === 'create'
                          ? 'bg-green-100 text-green-700'
                          : log.action === 'update'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{log.entityId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
