import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Filter, X, ExternalLink, AlertTriangle, Ambulance, ArrowRightLeft } from "lucide-react";
import { SAMPLE_ARTICLES, DISTRICTS } from "@/data/mockData";
import { Article, Classification, Language } from "@/types";
import {
  classificationBadgeClass,
  classificationLabel,
  formatDate,
  formatRelative,
  severityBadgeClass,
  severityLabel,
  truncate,
} from "@/lib/formatters";
import ArticleDetailPanel from "@/components/ArticleDetailPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DISTRICT_OPTIONS = ["All Districts", ...DISTRICTS.map((d) => d.districtName)];
const CLASS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "confirmed_maternal_mortality", label: "Confirmed" },
  { value: "probable_maternal_mortality", label: "Probable" },
];
const LANG_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];
const SEVERITY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Severities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const Articles: React.FC = () => {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [classification, setClassification] = useState("all");
  const [language, setLanguage] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    return SAMPLE_ARTICLES.filter((a) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.title.toLowerCase().includes(q) &&
          !a.summary.toLowerCase().includes(q) &&
          !a.source.toLowerCase().includes(q) &&
          !(a.district?.toLowerCase().includes(q))
        )
          return false;
      }
      if (district !== "All Districts" && a.district !== district) return false;
      if (classification !== "all" && a.classification !== classification) return false;
      if (language !== "all" && a.language !== language) return false;
      if (severity !== "all" && a.severity !== severity) return false;
      return true;
    }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [search, district, classification, language, severity]);

  const hasFilters = search || district !== "All Districts" || classification !== "all" || language !== "all" || severity !== "all";

  const clearFilters = () => {
    setSearch("");
    setDistrict("All Districts");
    setClassification("all");
    setLanguage("all");
    setSeverity("all");
  };

  return (
    <div className="space-y-4 max-w-screen-xl">
      {/* Filter bar */}
      <div className="app-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, source, district…"
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              {DISTRICT_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={classification} onValueChange={setClassification}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {LANG_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular">{filtered.length}</span> articles{hasFilters && " (filtered)"}
        </div>
      </div>

      {/* Table */}
      <div className="app-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-8" />
                <th>Title</th>
                <th className="hidden md:table-cell">Source</th>
                <th className="hidden sm:table-cell">District</th>
                <th>Classification</th>
                <th className="hidden lg:table-cell">Severity</th>
                <th className="hidden xl:table-cell">Published</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                    No articles match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <motion.tr
                    key={a.id}
                    layout
                    onClick={() => setSelectedArticle(a)}
                    className="cursor-pointer"
                  >
                    <td>
                      <div className="flex flex-col gap-1 items-center">
                        {a.negligenceFlag && (
                          <span title="Negligence"><AlertTriangle className="h-3 w-3 text-destructive" /></span>
                        )}
                        {a.referralDelayFlag && (
                          <span title="Referral Delay"><ArrowRightLeft className="h-3 w-3 text-warning" /></span>
                        )}
                        {a.ambulanceIssueFlag && (
                          <span title="Ambulance Issue"><Ambulance className="h-3 w-3 text-warning" /></span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-foreground text-sm leading-tight max-w-xs">
                        {truncate(a.title, 72)}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {a.language === "hi" ? "हिंदी" : "English"} · Score {a.relevanceScore}
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-sm text-muted-foreground">{a.source}</td>
                    <td className="hidden sm:table-cell text-sm text-muted-foreground">{a.district || "—"}</td>
                    <td>
                      <span className={classificationBadgeClass(a.classification)}>
                        {classificationLabel(a.classification)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className={severityBadgeClass(a.severity)}>
                        {severityLabel(a.severity)}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell text-xs text-muted-foreground tabular">
                      {formatRelative(a.publishedAt)}
                    </td>
                    <td>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article detail panel */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSelectedArticle(null)}
            />
            <ArticleDetailPanel
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Articles;
