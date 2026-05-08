"use client";

import { Part, motorcycleModels, partCategories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, ShoppingCart, Check, AlertCircle, Wrench } from "lucide-react";

interface PartsResultProps {
  recommendations: {
    category: string;
    categoryName: string;
    allocatedBudget: number;
    recommendedPart: Part | null;
  }[];
  budget: number;
  modelId: string;
  onBack: () => void;
}

export function PartsResult({
  recommendations,
  budget,
  modelId,
  onBack,
}: PartsResultProps) {
  const modelData = motorcycleModels.find((m) => m.id === modelId);
  const totalSpent = recommendations.reduce(
    (sum, rec) => sum + (rec.recommendedPart?.price || 0),
    0
  );
  const remaining = budget - totalSpent;
  const partsFound = recommendations.filter((r) => r.recommendedPart).length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>กลับ</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
            {modelData?.name}
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <Card className="p-6 bg-card border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">งบประมาณ</div>
            <div className="text-xl font-bold text-foreground">
              ฿{budget.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">ใช้ไป</div>
            <div className="text-xl font-bold text-primary">
              ฿{totalSpent.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">เหลือ</div>
            <div className={`text-xl font-bold ${remaining >= 0 ? 'text-green-500' : 'text-destructive'}`}>
              ฿{remaining.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">รายการ</div>
            <div className="text-xl font-bold text-foreground">
              {partsFound} / {recommendations.length}
            </div>
          </div>
        </div>
      </Card>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const categoryData = partCategories.find(
            (c) => c.id === rec.category
          );
          
          return (
            <Card
              key={rec.category}
              className={`overflow-hidden border-border transition-all hover:border-primary/50 ${
                rec.recommendedPart ? "bg-card" : "bg-secondary/50"
              }`}
            >
              {/* Category Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{categoryData?.icon}</span>
                  <span className="font-medium">{rec.categoryName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  งบ ฿{rec.allocatedBudget.toLocaleString()}
                </div>
              </div>

              {rec.recommendedPart ? (
                <div className="p-4 space-y-4">
                  {/* Product Image Placeholder */}
                  <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                    <Wrench className="w-12 h-12 text-muted-foreground/50" />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground leading-tight">
                        {rec.recommendedPart.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500 shrink-0">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">{rec.recommendedPart.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {rec.recommendedPart.brand}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {rec.recommendedPart.description}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-xl font-bold text-primary">
                      ฿{rec.recommendedPart.price.toLocaleString()}
                    </div>
                    <Button size="sm" className="gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      เพิ่ม
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex flex-col items-center justify-center min-h-[200px] text-center">
                  <AlertCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <div className="text-muted-foreground text-sm">
                    ไม่พบของแต่งในหมวดนี้
                    <br />
                    ที่ตรงกับงบประมาณ
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Actions */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Check className="w-5 h-5" />
              <span className="font-semibold">
                พบของแต่ง {partsFound} รายการ
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              รวมราคา ฿{totalSpent.toLocaleString()} • ประหยัดไป ฿{remaining.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              เปลี่ยนงบประมาณ
            </Button>
            <Button className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              เพิ่มทั้งหมดลงตะกร้า
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}