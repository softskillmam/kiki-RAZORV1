
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminSearchableTabProps {
  children: React.ReactNode;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const AdminSearchableTab = ({ children, onSearch, placeholder = "Search..." }: AdminSearchableTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {children}
    </div>
  );
};

export default AdminSearchableTab;
