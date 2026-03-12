import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Newspaper,
  Calendar,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  Ambulance,
  ArrowRightLeft,
} from "lucide-react";
import { SAMPLE_ARTICLES, SAMPLE_RUNS, computeDistrictCounts, computeMetrics, computeSourceCounts } from "@/data/mockData";
import { formatRelative, classificationBadgeClass, classificationLabel, severityBadgeClass, severityLabel, formatDate, truncate } from "@/lib/formatters";
import { DistrictBarChart, SourceBarChart, SeverityDonut } from "@/components/Charts";
import { getLastRun } from "@/lib/formatters";

// framer-motion custom variants typed correctly
const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, duration: 0.4, bounce: 0, delay: i * 0.05 },
  }),
};

const MetricCard: React.FC<{
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  index: number;
}> = ({ label, value, sub, icon, accent = "text-foreground", index }) => (
  <motion.div
    className="app-card"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariant}
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label}</div>
        <div className={`metric-value ${accent}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
      <div className="text-muted-foreground opacity-40">{icon}</div>
    </div>
  </motion.div>
);

const Overview: React.FC = () => {
  const metrics = computeMetrics(SAMPLE_ARTICLES);
  const districtCounts = computeDistrictCounts(SAMPLE_ARTICLES);
  const sourceCounts = computeSourceCounts(SAMPLE_ARTICLES);
  const lastRun = getLastRun(SAMPLE_RUNS);
  const recentArticles = [...SAMPLE_ARTICLES]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-screen-xl">
      {/* Last run banner */}
      {lastRun && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-success/10 border border-success/20"
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="font-semibold text-foreground">Last run succeeded</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{formatRelative(lastRun.createdAt)}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{lastRun.totalFetched} fetched, {lastRun.totalRelevant} relevant</span>
          </div>
          <Link to="/runs" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
            View logs <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Relevant"
          value={metrics.totalArticles}
          sub="All-time"
          icon={<Newspaper className="h-6 w-6" />}
          index={0}
        />
        <MetricCard
          label="Today"
          value={metrics.todayCount}
          sub="articles found today"
          icon={<Calendar className="h-6 w-6" />}
          index={1}
        />
        <MetricCard
          label="This Week"
          value={metrics.weekCount}
          sub="last 7 days"
          icon={<BarChart2 className="h-6 w-6" />}
          index={2}
        />
        <MetricCard
          label="Confirmed Deaths"
          value={metrics.confirmedCount}
          sub={`${metrics.probableCount} probable`}
          icon={<AlertTriangle className="h-6 w-6" />}
          accent="text-destructive"
          index={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* District breakdown */}
        <motion.div
          className="app-card lg:col-span-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.2 }}
        >
          <div className="text-sm font-semibold text-foreground mb-4">District Breakdown</div>
          <DistrictBarChart data={districtCounts} />
        </motion.div>

        {/* Source breakdown */}
        <motion.div
          className="app-card lg:col-span-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.25 }}
        >
          <div className="text-sm font-semibold text-foreground mb-4">Source Breakdown</div>
          <SourceBarChart data={sourceCounts} />
        </motion.div>

        {/* Severity split */}
        <motion.div
          className="app-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.3 }}
        >
          <div className="text-sm font-semibold text-foreground mb-4">Classification Split</div>
          <SeverityDonut confirmed={metrics.confirmedCount} probable={metrics.probableCount} />

          {/* Issue type flags */}
          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Issue Flags
            </div>
            <FlagRow
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              label="Negligence"
              count={SAMPLE_ARTICLES.filter((a) => a.negligenceFlag).length}
              colorClass="text-destructive"
            />
            <FlagRow
              icon={<ArrowRightLeft className="h-3.5 w-3.5" />}
              label="Referral Delay"
              count={SAMPLE_ARTICLES.filter((a) => a.referralDelayFlag).length}
              colorClass="text-warning"
            />
            <FlagRow
              icon={<Ambulance className="h-3.5 w-3.5" />}
              label="Ambulance Issue"
              count={SAMPLE_ARTICLES.filter((a) => a.ambulanceIssueFlag).length}
              colorClass="text-warning"
            />
          </div>
        </motion.div>
      </div>

      {/* Recent articles */}
      <motion.div
        className="app-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.35 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-foreground">Recent Incidents</div>
          <Link
            to="/articles"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border">
                <th>Title</th>
                <th className="hidden sm:table-cell">Source</th>
                <th className="hidden md:table-cell">District</th>
                <th>Classification</th>
                <th className="hidden lg:table-cell">Published</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="font-medium text-foreground text-sm leading-tight">
                          {truncate(a.title, 70)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {a.negligenceFlag && (
                            <span className="badge badge-destructive text-[10px] py-0">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Negligence
                            </span>
                          )}
                          {a.referralDelayFlag && (
                            <span className="badge badge-warning text-[10px] py-0">Referral</span>
                          )}
                          {a.ambulanceIssueFlag && (
                            <span className="badge badge-warning text-[10px] py-0">Ambulance</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-muted-foreground">{a.source}</td>
                  <td className="hidden md:table-cell text-muted-foreground">{a.district || "—"}</td>
                  <td>
                    <span className={classificationBadgeClass(a.classification)}>
                      {classificationLabel(a.classification)}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell text-muted-foreground text-xs tabular">
                    {formatRelative(a.publishedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

const FlagRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  count: number;
  colorClass: string;
}> = ({ icon, label, count, colorClass }) => (
  <div className="flex items-center justify-between">
    <div className={`flex items-center gap-1.5 text-xs ${colorClass}`}>
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-sm font-semibold tabular text-foreground">{count}</span>
  </div>
);

export default Overview;
