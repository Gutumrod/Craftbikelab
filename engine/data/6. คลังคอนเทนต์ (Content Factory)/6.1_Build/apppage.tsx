"use client";

import { useState } from "react";
import { BudgetForm } from "@/components/budget-form";
import { PartsResult } from "@/components/parts-result";
import { calculatePartsRecommendation } from "@/lib/mock-data";
import { Bike, Wrench, Sparkles, ShieldCheck } from "lucide-react";

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [budget, setBudget] = useState(0);
  const [modelId, setModelId] = useState("");
  const [recommendations, setRecommendations] = useState<ReturnType<typeof calculatePartsRecommendation>>([]);

  const handleSubmit = (budgetValue: number, selectedModelId: string) => {
    setBudget(budgetValue);
    setModelId(selectedModelId);
    const results = calculatePartsRecommendation(budgetValue, selectedModelId);
    setRecommendations(results);
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Bike className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">MotoCustom</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">หน้าแรก</a>
            <a href="#" className="hover:text-foreground transition-colors">ของแต่ง</a>
            <a href="#" className="hover:text-foreground transition-colors">ติดต่อเรา</a>
          </nav>
        </div>
      </header>

      {showResults ? (
        <section className="container mx-auto px-4 py-8 md:py-12">
          <PartsResult
            recommendations={recommendations}
            budget={budget}
            modelId={modelId}
            onBack={handleBack}
          />
        </section>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance">
                  <span className="text-primary">แต่งรถ</span>ในงบที่คุณกำหนด
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground text-pretty">
                  ใส่งบประมาณและรุ่นรถของคุณ ระบบจะแนะนำของแต่งครบทุกหมวด
                  <br className="hidden sm:block" />
                  เพื่อให้คุณแต่งรถได้อย่างคุ้มค่าที่สุด
                </p>
              </div>

              {/* Form Card */}
              <div className="max-w-xl mx-auto">
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl">
                  <BudgetForm onSubmit={handleSubmit} />
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="border-t border-border bg-secondary/30">
            <div className="container mx-auto px-4 py-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Wrench className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">ของแต่งครบทุกหมวด</h3>
                  <p className="text-muted-foreground text-sm">
                    ท่อไอเสีย โช้ค เบรก ชุดแต่ง ไฟ และอุปกรณ์เสริม
                    ครบครันในที่เดียว
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">AI แนะนำอัจฉริยะ</h3>
                  <p className="text-muted-foreground text-sm">
                    ระบบคำนวณงบประมาณอัตโนมัติ
                    เลือกของแต่งที่คุ้มค่าที่สุดให้คุณ
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">รับประกันคุณภาพ</h3>
                  <p className="text-muted-foreground text-sm">
                    ของแต่งแท้ 100% จากแบรนด์ชั้นนำ
                    รับประกันสินค้าทุกชิ้น
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-border">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-primary" />
                  <span>MotoCustom</span>
                </div>
                <p>© 2026 MotoCustom. สงวนลิขสิทธิ์</p>
              </div>
            </div>
          </footer>
        </>
      )}
    </main>
  );
}