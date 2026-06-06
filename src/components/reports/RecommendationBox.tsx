import { Lightbulb, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

type PriorityType = 'high' | 'medium' | 'low';
type CategoryType = '设备维保' | '排队优化' | '人员配置' | '营销策略';

interface StructuredRecommendation {
  id: string;
  content: string;
  priority: PriorityType;
  category: CategoryType;
}

interface RecommendationBoxProps {
  recommendations: string[];
}

function enrichRecommendations(raw: string[]): StructuredRecommendation[] {
  const priorityOrder: PriorityType[] = ['high', 'medium', 'low'];

  return raw.map((text, idx) => {
    let priority: PriorityType = 'medium';
    let category: CategoryType = '营销策略';

    if (/维保|维修|故障|设备|振动|传感器|齿轮|液压|制动/.test(text)) {
      category = '设备维保';
    } else if (/排队|等待|快速通道|限流|翻台|遮阳|互动/.test(text)) {
      category = '排队优化';
    } else if (/人员|排班|员工|服务人员|班组|技师/.test(text)) {
      category = '人员配置';
    }

    if (/加强|建议立即|必须|紧急|严重|高于|持续高位/.test(text)) {
      priority = 'high';
    } else if (/持续关注|优化|适当|引入/.test(text)) {
      priority = 'medium';
    } else {
      priority = priorityOrder[idx % 3];
    }

    return {
      id: `rec-${idx}`,
      content: text,
      priority,
      category,
    };
  });
}

const priorityStyles: Record<PriorityType, { label: string; className: string; dotColor: string }> = {
  high: {
    label: '高',
    className: 'bg-accent-red/15 text-accent-red border-accent-red/30',
    dotColor: 'bg-accent-red',
  },
  medium: {
    label: '中',
    className: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
    dotColor: 'bg-accent-orange',
  },
  low: {
    label: '低',
    className: 'bg-accent-teal/15 text-accent-teal border-accent-teal/30',
    dotColor: 'bg-accent-teal',
  },
};

const categoryStyles: Record<CategoryType, string> = {
  '设备维保': 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
  '排队优化': 'bg-accent-gold/15 text-accent-gold border-accent-gold/30',
  '人员配置': 'bg-accent-teal/15 text-accent-teal border-accent-teal/30',
  '营销策略': 'bg-navy-300/20 text-metal-200 border-navy-400/30',
};

export default function RecommendationBox({ recommendations }: RecommendationBoxProps) {
  const items = enrichRecommendations(recommendations);

  return (
    <div className="bg-navy-800/60 backdrop-blur-xl rounded-2xl border border-navy-600/50 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-accent-gold/15">
          <Lightbulb className="w-5 h-5 text-accent-gold" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">运营优化建议</h2>
          <p className="text-metal-400 text-xs mt-0.5">基于数据分析的智能优化方案</p>
        </div>
        <span className="ml-auto px-2.5 py-1 rounded-lg bg-navy-700/80 text-metal-300 text-xs font-medium">
          共 {items.length} 条
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-2xl bg-navy-700/50 mb-3">
            <Inbox className="w-10 h-10 text-metal-500" />
          </div>
          <p className="text-metal-300 font-medium">暂无优化建议</p>
          <p className="text-metal-500 text-sm mt-1">运营指标表现良好，继续保持</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const pStyle = priorityStyles[item.priority];
            return (
              <div
                key={item.id}
                className="group flex items-start gap-4 p-4 rounded-xl bg-navy-900/40 border border-navy-700/50 hover:border-navy-600/60 hover:bg-navy-900/60 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center shadow-lg border border-navy-500/30 group-hover:scale-110 transition-transform duration-300">
                  <span className="font-bold text-white text-sm">{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm leading-relaxed">{item.content}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border',
                        pStyle.className
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', pStyle.dotColor)} />
                      {pStyle.label}优先级
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
                        categoryStyles[item.category]
                      )}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
