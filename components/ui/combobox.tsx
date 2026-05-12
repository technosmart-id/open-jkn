"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxProps {
  options: { value: string | number; label: string; description?: string }[];
  value?: string | number;
  onValueChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  isLoading?: boolean;
  onSearchChange?: (search: string) => void;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  isLoading = false,
  onSearchChange,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-11", className)}
        >
          <div className="flex flex-col items-start truncate text-left">
            {selectedOption ? (
              <>
                <span className="font-medium">{selectedOption.label}</span>
                {selectedOption.description && (
                  <span className="text-[10px] text-muted-foreground truncate">
                    {selectedOption.description}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={!onSearchChange}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            onValueChange={onSearchChange}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={String(option.value)}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className="flex flex-col items-start py-3"
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
