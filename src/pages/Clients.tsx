import { useState } from 'react';
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
import { Search, Filter, Download } from 'lucide-react';
import { AddClientModal } from '@/components/clients/AddClientModal';
import type { Client } from '@/types';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);

  const handleClientAdded = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
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
          />
        </div>

        <Select defaultValue="all">
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

        <Select defaultValue="all">
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

        <Select defaultValue="all">
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

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <AddClientModal onClientAdded={handleClientAdded} />
        </div>
      </div>

      {/* Client List */}
      <ClientList 
        clients={clients} 
        title={`${clients.length} Clients`}
        showViewAll={false}
      />
    </AppLayout>
  );
};

export default Clients;
