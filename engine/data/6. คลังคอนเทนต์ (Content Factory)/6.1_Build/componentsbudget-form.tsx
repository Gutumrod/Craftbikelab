"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motorcycleModels } from "@/lib/mock-data";
import { Search, ChevronDown, Bike } from "lucide-react";

interface BudgetFormProps {
  onSubmit: (budget: number, modelId: string) => void;
}

export function BudgetForm({ onSubmit }: BudgetFormProps) {
  const [budget, setBudget] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredModels = motorcycleModels.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedModelData = motorcycleModels.find(
    (m) => m.id === selectedModel
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseInt(budget.replace(/,/g, ""));
    if (budgetNum > 0 && selectedModel) {
      onSubmit(budgetNum, selectedModel);
    }
  };

  const formatBudget = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
      {/* Budget Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          งบประมาณของคุณ (บาท)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            ฿
          </span>
          <Input
            type="text"
            placeholder="50,000"
            value={budget}
            onChange={(e) => setBudget(formatBudget(e.target.value))}
            className="pl-10 h-14 text-lg bg-secondary border-border focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[10000, 30000, 50000, 100000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setBudget(formatBudget(amount.toString()))}
              className="px-3 py-1.5 text-sm rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
            >
              ฿{amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          รุ่นรถของคุณ
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full h-14 px-4 flex items-center justify-between rounded-lg bg-secondary border border-border hover:border-primary transition-colors text-left"
          >
            {selectedModelData ? (
              <span className="flex items-center gap-3">
                <Bike className="w-5 h-5 text-primary" />
                <span>{selectedModelData.name}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">เลือกรุ่นรถ...</span>
            )}
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 top-full mt-2 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ค้นหารุ่นรถ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-secondary rounded-md border border-border focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              {/* Model List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredModels.length > 0 ? (
                  filteredModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsDropdownOpen(false);
                        setSearchQuery("");
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary transition-colors text-left ${
                        selectedModel === model.id
                          ? "bg-primary/10 text-primary"
                          : ""
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {model.brand} • {model.type}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    ไม่พบรุ่นรถที่ค้นหา
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!budget || !selectedModel}
        className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50"
      >
        ดูของแต่งแนะนำ
      </Button>
    </form>
  );
}