import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  onDateFilter: (filter: string) => void;
  onSearch?: (query: string) => void;
  activeFilter: string;
  searchQuery?: string;
}

export default function SearchFilters({ 
  onDateFilter, 
  onSearch, 
  activeFilter, 
  searchQuery = "" 
}: SearchFiltersProps) {
  const handleFilterClick = (filter: string) => {
    onDateFilter(filter === activeFilter ? "" : filter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar (only show if onSearch is provided) */}
      {onSearch && (
        <div className="max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events by title..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
              data-testid="input-search"
            />
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-muted-foreground">Filter by date:</span>
        
        <Button
          variant={activeFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("today")}
          className={activeFilter === "today" ? "bg-primary hover:bg-primary/90" : ""}
          data-testid="filter-today"
        >
          Today
        </Button>
        
        <Button
          variant={activeFilter === "this_week" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("this_week")}
          className={activeFilter === "this_week" ? "bg-primary hover:bg-primary/90" : ""}
          data-testid="filter-this-week"
        >
          This Week
        </Button>
        
        <Button
          variant={activeFilter === "next_month" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("next_month")}
          className={activeFilter === "next_month" ? "bg-primary hover:bg-primary/90" : ""}
          data-testid="filter-next-month"
        >
          Next Month
        </Button>
        
        <Button
          variant={!activeFilter ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("")}
          className={!activeFilter ? "bg-primary hover:bg-primary/90" : ""}
          data-testid="filter-all"
        >
          All Events
        </Button>

        {/* Sort Dropdown */}
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select defaultValue="date-asc">
            <SelectTrigger className="w-48" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date (Upcoming First)</SelectItem>
              <SelectItem value="date-desc">Date (Latest First)</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
