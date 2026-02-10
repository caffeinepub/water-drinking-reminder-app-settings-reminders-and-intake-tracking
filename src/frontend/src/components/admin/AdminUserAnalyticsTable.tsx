import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, User, Eye } from 'lucide-react';
import type { UserAnalyticsEntry } from '../../backend';
import type { Principal } from '@dfinity/principal';
import { formatBigIntCount, formatLastActiveDay } from '../../utils/analyticsFormat';

interface AdminUserAnalyticsTableProps {
  userAnalytics: UserAnalyticsEntry[];
  onSelectUser?: (principal: Principal) => void;
}

type SortField = 'profileName' | 'issuedDay' | 'hydrationLogs' | 'runningLogs' | 'sleepLogs';
type SortDirection = 'asc' | 'desc';

export default function AdminUserAnalyticsTable({ userAnalytics, onSelectUser }: AdminUserAnalyticsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('issuedDay');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = userAnalytics;

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.profileName.toLowerCase().includes(lowerSearch) ||
          user.principal.toString().toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle bigint comparison
      if (typeof aVal === 'bigint' && typeof bVal === 'bigint') {
        const diff = Number(aVal - bVal);
        return sortDirection === 'asc' ? diff : -diff;
      }

      // Handle string comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return sorted;
  }, [userAnalytics, searchTerm, sortField, sortDirection]);

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          User Analytics
        </CardTitle>
        <CardDescription>
          Detailed activity breakdown for all users ({userAnalytics.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or principal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('profileName')}
                      className="font-semibold hover:bg-muted"
                    >
                      User
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Principal</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('issuedDay')}
                      className="font-semibold hover:bg-muted"
                    >
                      Last Active
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('hydrationLogs')}
                      className="font-semibold hover:bg-muted"
                    >
                      Hydration
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('sleepLogs')}
                      className="font-semibold hover:bg-muted"
                    >
                      Sleep
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('runningLogs')}
                      className="font-semibold hover:bg-muted"
                    >
                      Running
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  {onSelectUser && <TableHead className="text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={onSelectUser ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No users found matching your search.' : 'No user data available yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((user) => (
                    <TableRow key={user.principal.toString()} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold">
                            {user.profileName.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.profileName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {user.principal.toString().slice(0, 12)}...
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatLastActiveDay(user.issuedDay)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {formatBigIntCount(user.hydrationLogs)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm">
                          {formatBigIntCount(user.sleepLogs)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {formatBigIntCount(user.runningLogs)}
                        </span>
                      </TableCell>
                      {onSelectUser && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectUser(user.principal)}
                            className="hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredAndSortedData.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredAndSortedData.length} of {userAnalytics.length} users
          </div>
        )}
      </CardContent>
    </Card>
  );
}
