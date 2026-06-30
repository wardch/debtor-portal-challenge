"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Euro,
  LayoutGrid,
  Mail,
  MessageSquare,
  Phone,
  SendHorizonal,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { LegacyAccountFixture } from "@/lib/account/types";
import { cn } from "@/lib/utils";

type PortalProps = {
  fixture: LegacyAccountFixture;
};

type View = "dashboard" | "conversations";
type ChatMessage = {
  id: string;
  role: "customer" | "agent";
  content: string;
};

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`;
}

function buildCannedReply(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("payment") ||
    normalizedMessage.includes("pay")
  ) {
    return "Our AI assistant is processing your payment question and will guide you to the next step shortly.";
  }

  if (
    normalizedMessage.includes("call") ||
    normalizedMessage.includes("phone") ||
    normalizedMessage.includes("email")
  ) {
    return "Our AI assistant is processing your contact request and will suggest the next best support option shortly.";
  }

  if (
    normalizedMessage.includes("dispute") ||
    normalizedMessage.includes("incorrect") ||
    normalizedMessage.includes("wrong")
  ) {
    return "Our AI assistant is processing your dispute note and will help route it for review.";
  }

  return "Our AI assistant is processing your message and will respond shortly.";
}

export function DebtorPortal({ fixture }: PortalProps) {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const fullName = `${fixture.account.debtorFirstName} ${fixture.account.debtorLastName}`;

  const handleSendMessage = () => {
    const nextMessage = draft.trim();

    if (!nextMessage) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `customer-${Date.now()}`,
        role: "customer",
        content: nextMessage,
      },
      {
        id: `agent-${Date.now() + 1}`,
        role: "agent",
        content: buildCannedReply(nextMessage),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#eef5fb_0%,#dcecf3_52%,#d8f0ec_100%)] p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-[1700px] overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/45 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-sm lg:h-[calc(100vh-3rem)]">
        <aside className="flex w-full shrink-0 flex-col justify-between border-b border-slate-200/80 bg-[linear-gradient(180deg,#dfe8f2_0%,#d7e2ed_100%)] p-5 lg:w-[300px] lg:border-r lg:border-b-0 lg:p-7">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-300/70 bg-white/80 text-slate-700 shadow-sm">
                <LayoutGrid className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Account Portal
                </h1>
                <p className="mt-2 max-w-[14rem] text-sm leading-6 text-slate-600">
                  Simple account summary and message view for self-service.
                </p>
              </div>
            </div>

            <nav className="space-y-3">
              <NavItem
                active={activeView === "dashboard"}
                icon={LayoutGrid}
                label="Dashboard"
                onClick={() => setActiveView("dashboard")}
              />
              <NavItem
                active={activeView === "conversations"}
                icon={MessageSquare}
                label="Conversations"
                onClick={() => setActiveView("conversations")}
              />
            </nav>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-slate-300/60 bg-white/80 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <Avatar size="lg" className="shadow-sm after:border-slate-300/70">
                <AvatarFallback className="bg-[linear-gradient(135deg,#3b82f6,#0f172a)] font-semibold text-white">
                  {getInitials(
                    fixture.account.debtorFirstName,
                    fixture.account.debtorLastName,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-900">
                  {fullName}
                </p>
                <p className="truncate text-sm text-slate-600">
                  {fixture.account.email}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(246,250,252,0.8))] p-4 sm:p-6 lg:p-8">
          {activeView === "dashboard" ? (
            <DashboardView fixture={fixture} fullName={fullName} />
          ) : (
            <ConversationView
              draft={draft}
              messages={messages}
              onDraftChange={setDraft}
              onSendMessage={handleSendMessage}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardView({
  fixture,
  fullName,
}: {
  fixture: LegacyAccountFixture;
  fullName: string;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <section className="rounded-[2rem] border border-white/75 bg-white/72 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
              Dashboard
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              {fullName}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              A stripped back customer summary with the main account details and
              a separate conversation area.
            </p>
          </div>

          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            {fixture.account.status}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Euro}
            label="Current balance"
            value={formatCurrency(
              fixture.account.balanceCents,
              fixture.account.currency,
            )}
          />
          <MetricCard
            icon={CalendarDays}
            label="Due date"
            value={formatDate(fixture.billing.dueDate)}
          />
          <MetricCard
            icon={LayoutGrid}
            label="Reference"
            value={fixture.account.reference}
          />
          <MetricCard
            icon={UserRound}
            label="Days overdue"
            value={`${fixture.account.daysPastDue} days`}
          />
        </div>
      </section>

      <section className="flex-1 rounded-[2rem] border border-white/75 bg-white/78 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
          Account info
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoRow
            icon={UserRound}
            label="Customer"
            value={fullName}
          />
          <InfoRow
            icon={Mail}
            label="Email"
            value={fixture.account.email}
          />
          <InfoRow
            icon={Phone}
            label="Phone"
            value={fixture.account.phone}
          />
          <InfoRow
            icon={LayoutGrid}
            label="Preferred contact"
            value={fixture.account.preferredContactMethod.toUpperCase()}
          />
          <InfoRow
            icon={LayoutGrid}
            label="Creditor"
            value={fixture.account.creditorName}
          />
          <InfoRow
            icon={CalendarDays}
            label="Last payment"
            value={`${formatCurrency(
              fixture.account.lastPaymentAmountCents,
              fixture.account.currency,
            )} on ${formatDate(fixture.account.lastPaymentDate)}`}
          />
        </div>
      </section>
    </div>
  );
}

function ConversationView({
  draft,
  messages,
  onDraftChange,
  onSendMessage,
}: {
  draft: string;
  messages: ChatMessage[];
  onDraftChange: (value: string) => void;
  onSendMessage: () => void;
}) {
  const hasMessages = messages.length > 0;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col overflow-hidden rounded-[2rem] border border-white/75 bg-white/72 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="shrink-0 border-b border-slate-200/80 px-6 py-5 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
          Conversations
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Chat with AI Assistant
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Send a message to start the thread and receive an instant AI response.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            Open
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {hasMessages ? (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "customer" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[min(100%,36rem)] rounded-[1.5rem] px-5 py-4 text-sm leading-7 shadow-sm",
                    message.role === "customer"
                      ? "bg-[linear-gradient(135deg,#0f1d3d,#213a6b)] text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700",
                  )}
                >
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
                    {message.role === "customer" ? "You" : "AI Support"}
                  </p>
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex min-h-full items-center justify-center">
            <div className="flex w-full max-w-2xl flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50/70 px-8 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm">
                <MessageSquare className="size-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                No conversation yet
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                Keep it lightweight: send the first message and the thread will
                show a canned AI support response right away.
              </p>
            </div>
          </div>
        )}
      </div>

      <form
        className="shrink-0 border-t border-slate-200/80 bg-white/90 px-6 py-5 sm:px-8"
        onSubmit={(event) => {
          event.preventDefault();
          onSendMessage();
        }}
      >
        <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Message the AI assistant..."
            className="min-h-24 w-full resize-none border-0 bg-transparent px-2 py-2 text-base text-slate-900 outline-none placeholder:text-slate-400"
          />
          <div className="mt-2 flex items-center justify-between gap-3 px-2">
            <p className="text-xs text-slate-500">
              Send with <span className="font-medium text-slate-700">Cmd/Ctrl + Enter</span>
            </p>
            <Button
              type="submit"
              disabled={!draft.trim()}
              className={cn(
                "h-10 rounded-full px-4 text-sm font-medium text-white shadow-none",
                draft.trim()
                  ? "bg-slate-500 hover:bg-slate-600"
                  : "bg-slate-400 hover:bg-slate-400",
              )}
            >
              Send
              <SendHorizonal className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

function NavItem({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof LayoutGrid;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[1.4rem] px-5 py-4 text-left text-base font-medium transition",
        active
          ? "bg-[linear-gradient(135deg,#0f1d3d,#15294f)] text-white shadow-[0_18px_38px_rgba(15,29,61,0.24)]"
          : "bg-white/55 text-slate-700 hover:bg-white/80",
      )}
    >
      <Icon className="size-5" />
      <span>{label}</span>
    </button>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LayoutGrid;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/75 bg-slate-50/75 p-5">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LayoutGrid;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/75 bg-slate-50/75 p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
          <Icon className="size-4" />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="mt-4 text-base font-medium leading-7 text-slate-900">
        {value}
      </p>
    </div>
  );
}
