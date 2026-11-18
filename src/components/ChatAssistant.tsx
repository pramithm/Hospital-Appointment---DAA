import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles } from 'lucide-react';
import { useStore } from '@/store/StoreContext';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

function generateReply(question: string, totalPatients: number, avgDijkstra: number, timeSavedPct: number): string {
  const q = question.toLowerCase();

  if (q.includes('dijkstra') || q.includes('algorithm') || q.includes('how does it work')) {
    return `The routing engine models the hospital layout and calculates the fastest path to your required clinical departments. It checks real-time hallway transit times and current department wait lines to guide patients along the quickest route.`;
  }

  if (q.includes('complexity') || q.includes('performance') || q.includes('speed')) {
    return `Route calculations execute in less than a millisecond (<0.5ms) using an optimized priority queue, so hospital routes update in real time even during peak patient surges.`;
  }

  if (q.includes('wait') || q.includes('long') || q.includes('time') || q.includes('delay')) {
    return `With dynamic routing active, average patient transit and treatment latency is ${avgDijkstra} minutes—saving approximately ${timeSavedPct}% time compared to standard fixed routes by avoiding congested wings.`;
  }

  if (q.includes('bottleneck') || q.includes('reroute') || q.includes('traffic') || q.includes('congestion')) {
    return `When a department (like General OPD or Pathology Lab) reaches high capacity, the system detects the delay and directs incoming patients through alternative corridors or diagnostic stations.`;
  }

  if (q.includes('emergency') || q.includes('critical') || q.includes('triage')) {
    return `Critical and Emergency patients are routed via express emergency corridors (50% faster transit) and receive immediate clinician attention.`;
  }

  if (q.includes('department') || q.includes('stations') || q.includes('hospital')) {
    return `The hospital network consists of 13 departments: Main Entrance, Triage, Emergency & Trauma, General OPD, Cardiology, Orthopedics, Blood Lab, Digital X-Ray, CT/MRI Suite, Surgery/ICU, Inpatient Ward, Pharmacy, and Discharge.`;
  }

  return `I am your MediRoute Hospital Navigator. You can ask me about:
• "How does automated route optimization work?"
• "How long is the current average wait time?"
• "How does congestion bypass work?"
• "What departments are available?"`;
}

export function ChatAssistant() {
  const { patients, simulationMetrics } = useStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: "Hello! I am your MediRoute Hospital Navigator. Ask me about department wait times, route recommendations, or congestion bypass.",
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input.trim() };
    const reply = generateReply(
      input,
      patients.length,
      simulationMetrics.dijkstraAvgTimeMinutes,
      simulationMetrics.timeSavedPercent
    );

    setMessages((prev) => [...prev, userMsg, { role: 'bot', text: reply }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles size={16} />
          <span>Hospital Assistant AI</span>
        </button>
      )}

      {open && (
        <div className="w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden max-h-[480px]">
          {/* Header */}
          <div className="bg-teal-600 p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <div>
                <div className="font-bold text-xs">MediRoute Assistant</div>
                <div className="text-[10px] text-teal-100">Patient Flow & Route Guide</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-teal-700 text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-72 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-teal-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Ask about Dijkstra or hospital wait times..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
