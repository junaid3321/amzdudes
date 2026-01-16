import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientList } from '@/components/dashboard/ClientList';
import { mockClients } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, X, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddClientModal } from '@/components/clients/AddClientModal';
import type { Client } from '@/types';

type SortField = 'name' | 'healthScore' | 'revenue30Days' | 'mrr';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleClientAdded = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const filteredAndSortedClients = useMemo(() => {
    // First filter
    const filtered = clients.filter((client) => {
      const matchesSearch = searchQuery === '' || 
        client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || client.type === typeFilter;
      const matchesHealth = healthFilter === 'all' || client.healthStatus === healthFilter;
      const matchesManager = managerFilter === 'all' || 
        client.assignedManager.toLowerCase().includes(managerFilter.toLowerCase());

      return matchesSearch && matchesType && matchesHealth && matchesManager;
    });

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.companyName.localeCompare(b.companyName);
          break;
        case 'healthScore':
          comparison = a.healthScore - b.healthScore;
          break;
        case 'revenue30Days':
          comparison = a.revenue30Days - b.revenue30Days;
          break;
        case 'mrr':
          comparison = a.mrr - b.mrr;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [clients, searchQuery, typeFilter, healthFilter, managerFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredAndSortedClients.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'all' || healthFilter !== 'all' || managerFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setHealthFilter('all');
    setManagerFilter('all');
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <AppLayout 
      title="Clients" 
      subtitle="Manage and monitor all your agency clients"
    >
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Select value={typeFilter} onValueChange={handleFilterChange(setTypeFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Client Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="brand_owner">Brand Owners</SelectItem>
            <SelectItem value="reseller">Resellers</SelectItem>
            <SelectItem value="wholesaler">Wholesalers</SelectItem>
            <SelectItem value="product_launcher">Product Launchers</SelectItem>
            <SelectItem value="3p_seller">3P Sellers</SelectItem>
          </SelectContent>
        </Select>

        <Select value={healthFilter} onValueChange={handleFilterChange(setHealthFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Health Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={managerFilter} onValueChange={handleFilterChange(setManagerFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Managers</SelectItem>
            <SelectItem value="alex">Alex Thompson</SelectItem>
            <SelectItem value="jordan">Jordan Martinez</SelectItem>
            <SelectItem value="casey">Casey Williams</SelectItem>
          </SelectContent>
        </Select>

        <Select value={`${sortField}-${sortDirection}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="healthScore-desc">Health (High-Low)</SelectItem>
            <SelectItem value="healthScore-asc">Health (Low-High)</SelectItem>
            <SelectItem value="revenue30Days-desc">Revenue (High-Low)</SelectItem>
            <SelectItem value="revenue30Days-asc">Revenue (Low-High)</SelectItem>
            <SelectItem value="mrr-desc">MRR (High-Low)</SelectItem>
            <SelectItem value="mrr-asc">MRR (Low-High)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <AddClientModal onClientAdded={handleClientAdded} />
        </div>
      </div>

      {/* Client List */}
      <ClientList 
        clients={paginatedClients} 
        title={`${filteredAndSortedClients.length} Client${filteredAndSortedClients.length !== 1 ? 's' : ''}${hasActiveFilters ? ' (filtered)' : ''}`}
        showViewAll={false}
      />

      {/* Pagination */}
      {filteredAndSortedClients.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 px-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedClients.length)} of {filteredAndSortedClients.length}
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Clients;
